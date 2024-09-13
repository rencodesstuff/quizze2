import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Button, ProgressBar } from '@tremor/react';
import { createClient } from "../../../utils/supabase/component";
import StudentLayout from '@/comps/student-layout';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: Question[];
}

const TakeQuiz = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAvailable, setQuizAvailable] = useState(false);
  const [studentName, setStudentName] = useState(""); // Add this line
  const [studentId, setStudentId] = useState(""); // Add this line
  const supabase = createClient();

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== 'string') return;

      try {
        // Fetch student info
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', user.id)
          .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error('No student data found');

        setStudentName(studentData.name);
        setStudentId(studentData.student_id);

        // Fetch quiz data
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            duration_minutes,
            release_date,
            questions (
              id,
              type,
              text,
              options,
              correct_answer
            )
          `)
          .eq('id', id)
          .single();

        if (quizError) throw quizError;

        setQuiz(quizData as Quiz);
        
        const now = new Date();
        const quizDate = new Date(quizData.release_date);
        
        if (now >= quizDate) {
          setQuizAvailable(true);
          setTimeLeft(quizData.duration_minutes * 60);
        } else {
          setQuizAvailable(false);
        }
      } catch (error) {
        console.error('Error fetching quiz or student info:', error);
      }
    };

    fetchQuizAndStudentInfo();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Here you would typically send the answers to your backend
    // For now, we'll just set the quiz as submitted
    setQuizSubmitted(true);
    
    // Navigate to results page
    router.push(`/quiz-result/${id}`);
  };

  if (!quiz) return <div>Loading...</div>;

  if (!quizAvailable) {
    return (
      <StudentLayout studentName={studentName} studentId={studentId}>
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <Title>{quiz.title}</Title>
              <Text>This quiz is not yet available. Please check back at the scheduled time.</Text>
              <Text>Scheduled start: {new Date(quiz.release_date).toLocaleString()}</Text>
            </Card>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <Title>{quiz.title}</Title>
              <Text>Question {currentQuestionIndex + 1} of {quiz.questions.length}</Text>
              <ProgressBar value={progress} className="mt-2" />
              
              {!quizSubmitted && timeLeft !== null && (
                <Text className="mt-2">Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
              )}

              <div className="mt-6">
                <Text className="font-semibold">{currentQuestion.text}</Text>
                <div className="mt-4 space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={() => handleAnswer(currentQuestion.id, option)}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  color="gray"
                >
                  Previous
                </Button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmitQuiz} color="green">
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} color="blue">
                    Next
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default TakeQuiz;