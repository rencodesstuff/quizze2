import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from "../../../utils/supabase/component";
import StudentLayout from "@/comps/student-layout";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { RefreshCcw, ChevronLeft, Award } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from "../../hooks/use-toast";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

interface FlashcardData {
  id: string;
  set_id: string;
  front_content: string;
  back_content: string;
  created_at: string;
  updated_at: string;
  mastery_level: number;
  last_reviewed: string | null;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, isFlipped, onFlip }) => {
  return (
    <div className="w-full h-96 perspective-1000">
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 70 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front of card */}
        <div 
          className={`absolute w-full h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center text-center
            ${isFlipped ? 'pointer-events-none' : 'cursor-pointer'}`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          onClick={onFlip}
        >
          <p className="text-xl font-medium">{front}</p>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute w-full h-full bg-white rounded-xl shadow-lg p-8 flex items-center justify-center text-center
            ${!isFlipped ? 'pointer-events-none' : 'cursor-pointer'}`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          onClick={onFlip}
        >
          <p className="text-xl font-medium">{back}</p>
        </div>
      </motion.div>
    </div>
  );
};

const StudyFlashcards: React.FC = () => {
  const router = useRouter();
  const { setId } = router.query;
  const [studentName, setStudentName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [setTitle, setSetTitle] = useState<string>("");
  const [reviewedCards, setReviewedCards] = useState<number>(0);

  const supabase = createClient();

  useEffect(() => {
    if (setId) {
      fetchStudentInfo();
      fetchFlashcards();
    }
  }, [setId]);

  const fetchStudentInfo = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setStudentName(data.name);
          setStudentId(data.student_id);
        }
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student information",
        variant: "destructive"
      });
    }
  };

  const fetchFlashcards = async (): Promise<void> => {
    try {
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('title')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setSetTitle(setData.title);

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (error) throw error;
      setCards(data as FlashcardData[]);
      setReviewedCards(0);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flashcards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = (): void => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = (): void => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setDirection(0);
  };

  const handleSwipe = async (swipeDirection: number): Promise<void> => {
    if (!isFlipped) return;

    const currentCard = cards[currentIndex];

    try {
      if (swipeDirection === 1) {
        // Got It! - Update mastery, progress, and move to next card
        setDirection(1);
        const newMasteryLevel = Math.min(currentCard.mastery_level + 1, 5);
        
        const { error } = await supabase
          .from('flashcards')
          .update({ 
            mastery_level: newMasteryLevel,
            last_reviewed: new Date().toISOString()
          })
          .eq('id', currentCard.id);

        if (error) throw error;

        if (reviewedCards < cards.length) {
          setReviewedCards(prev => prev + 1);
        }

        // Move to next card after a short delay
        setTimeout(() => {
          nextCard();
        }, 300);
      } else {
        // Need More Practice - Just flip the card back and update mastery
        setDirection(-1);
        const newMasteryLevel = Math.max(currentCard.mastery_level - 1, 0);
        
        const { error } = await supabase
          .from('flashcards')
          .update({ 
            mastery_level: newMasteryLevel,
            last_reviewed: new Date().toISOString()
          })
          .eq('id', currentCard.id);

        if (error) throw error;

        // Reset the card to show the question again after a short delay
        setTimeout(() => {
          setIsFlipped(false);
          setDirection(0);
        }, 300);
      }
    } catch (error) {
      console.error('Error updating mastery level:', error);
      toast({
        title: "Error",
        description: "Failed to update card progress",
        variant: "destructive"
      });
    }
  };

  const handleRestart = (): void => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(0);
    setDirection(0);
  };

  const progress = (reviewedCards / cards.length) * 100;
  const isComplete = reviewedCards === cards.length;

  if (loading) {
    return (
      <StudentLayout studentName={studentName} studentId={studentId}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/flashcards')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Sets
              </Button>
              <Button
                variant="outline"
                onClick={handleRestart}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Restart
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{setTitle}</h1>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          <div className="relative w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${isFlipped}`}
                initial={{ 
                  x: direction === 0 ? 0 : direction > 0 ? 1000 : -1000,
                  opacity: direction === 0 ? 1 : 0 
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ 
                  x: direction === 0 ? 0 : direction > 0 ? -1000 : 1000,
                  opacity: 0
                }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {cards.length > 0 && (
                  <Flashcard
                    front={cards[currentIndex].front_content}
                    back={cards[currentIndex].back_content}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {isFlipped && !isComplete && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-500 py-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSwipe(-1)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  ← Need More Practice
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleSwipe(1)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Got It! →
                </Button>
              </div>
            )}
          </div>

          {isComplete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  <Award className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Study Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    You&apos;ve reviewed all the flashcards in this set.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => router.push('/flashcards')}
                      variant="outline"
                    >
                      Back to Sets
                    </Button>
                    <Button
                      onClick={handleRestart}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Study Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudyFlashcards;