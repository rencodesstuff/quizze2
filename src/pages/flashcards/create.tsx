import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { toast } from "../../hooks/use-toast";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";

// Interface for a single flashcard
interface Flashcard {
  front: string;
  back: string;
}

const CreateFlashcardSet = () => {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([{ front: "", back: "" }]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch student info on component mount
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("students")
            .select("name, student_id")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (data) {
            setStudentName(data.name);
            setStudentId(data.student_id);
          }
        }
      } catch (error) {
        console.error("Error fetching student info:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student information",
          variant: "destructive",
        });
      }
    };

    fetchStudentInfo();
  }, []);

  // Add new card
  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  // Remove card at specific index
  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  // Update card content
  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate at least one card has content
      if (cards.some(card => !card.front.trim() || !card.back.trim())) {
        toast({
          title: "Error",
          description: "Please fill in both sides of all cards",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create the flashcard set
      const { data: set, error: setError } = await supabase
        .from("flashcard_sets")
        .insert({
          student_id: user.id,
          title,
          description,
        })
        .select()
        .single();

      if (setError) throw setError;

      // Create the flashcards
      const { error: cardsError } = await supabase
        .from("flashcards")
        .insert(
          cards.map(card => ({
            set_id: set.id,
            front_content: card.front,
            back_content: card.back,
          }))
        );

      if (cardsError) throw cardsError;

      toast({
        title: "Success",
        description: "Flashcard set created successfully",
      });

      router.push('/flashcards');
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard set",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Flashcard Set</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Set Details */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Set Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter set title"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter set description"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Flashcards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Flashcards</h2>
            
            {cards.map((card, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Card {index + 1}</h3>
                  {cards.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCard(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`front-${index}`}>Front</Label>
                    <Textarea
                      id={`front-${index}`}
                      value={card.front}
                      onChange={(e) => updateCard(index, 'front', e.target.value)}
                      placeholder="Front side content"
                      required
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`back-${index}`}>Back</Label>
                    <Textarea
                      id={`back-${index}`}
                      value={card.back}
                      onChange={(e) => updateCard(index, 'back', e.target.value)}
                      placeholder="Back side content"
                      required
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button
              type="button"
              onClick={addCard}
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Card
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/flashcards')}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Set"}
            </Button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
};

export default CreateFlashcardSet;