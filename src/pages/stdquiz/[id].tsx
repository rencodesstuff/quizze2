import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "../../../utils/supabase/component";
import { MultiStepLoader } from "@/ui/multi-step-loader";
import { MultipleChoice, TrueFalse, ShortAnswer } from '@/comps/QuestionTypes';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[] | null;
  correct_answer: string;
  image_url?: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: Question[];
}

const TakeQuiz: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== "string") return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user found");
  
        const [studentData, quizData] = await Promise.all([
          supabase.from("students").select("name, student_id").eq("id", user.id).single(),
          supabase.from("quizzes").select(`
            id, title, duration_minutes, release_date,
            questions (id, type, text, options, correct_answer, image_url)
          `).eq("id", id).single()
        ]);
  
        if (studentData.error || quizData.error) throw new Error("Error fetching data");
  
        setStudentInfo({ name: studentData.data.name, id: studentData.data.student_id });
        setQuiz({
          ...quizData.data,
          questions: quizData.data.questions.map((q: Question) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : null
          }))
        });
        setTimeLeft(quizData.data.duration_minutes * 60);
      } catch (error) {
        console.error("Error fetching quiz or student info:", error);
      }
    };
  
    fetchQuizAndStudentInfo();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;
    const timer = setInterval(() => setTimeLeft(prev => prev !== null && prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted]);

  const handleAnswer = (questionId: string, answer: string) => 
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (!quiz) return;
    const newIndex = direction === 'next' ? currentQuestionIndex + 1 : currentQuestionIndex - 1;
    if (newIndex >= 0 && newIndex < quiz.questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string") return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const score = quiz.questions.reduce((acc, q) => 
        acc + (answers[q.id]?.toLowerCase() === q.correct_answer.toLowerCase() ? 1 : 0), 0);
      
      const { error } = await supabase.from("quiz_submissions").insert({
        student_id: user.id,
        quiz_id: id,
        answers,
        score: Math.round((score / quiz.questions.length) * 100),
        total_questions: quiz.questions.length,
        correct_answers: score,
      });

      if (error) throw error;
      setQuizSubmitted(true);
      router.push(`/stdinbox`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setSubmitError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionOptions = (question: Question) => {
    const props = { question, answers, handleAnswer };
    switch (question.type.toLowerCase().replace(/[^a-z0-9]/g, "_")) {
      case "multiple_choice":
        if (question.options && Array.isArray(question.options)) {
          return <MultipleChoice {...props} />;
        } else {
          console.error("Invalid options for multiple choice question:", question.options);
          return <p>Error: Invalid question options</p>;
        }
      case "true_false":
      case "true_or_false":
        return <TrueFalse {...props} />;
      case "short_answer":
        return <ShortAnswer {...props} />;
      default:
        return <p>Unsupported question type: {question.type}</p>;
    }
  };

  if (!quiz) return <div className="h-screen flex items-center justify-center">Loading quiz...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">{studentInfo.name}</p>
            <p className="text-sm text-gray-600">Student ID: {studentInfo.id}</p>
            <p className="text-sm font-bold text-blue-600">
              Time left: {Math.floor(timeLeft! / 60)}:{(timeLeft! % 60).toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex p-4">
        <div className="w-1/4 bg-white shadow-xl rounded-lg p-4 mr-4">
          <h2 className="text-lg font-bold mb-4">Questions</h2>
          <div className="space-y-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-full text-left p-2 rounded ${
                  index === currentQuestionIndex ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Question {index + 1}
                {answers[q.id] && answers[q.id].trim() !== "" && <span className="ml-2 text-green-500">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow bg-white shadow-xl rounded-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">Question {currentQuestionIndex + 1} of {quiz.questions.length}</h2>
          <p className="text-lg mb-6">{currentQuestion.text}</p>
          {currentQuestion.image_url && (
            <div className="mb-6">
              <Image
                src={currentQuestion.image_url}
                alt={`Image for question ${currentQuestionIndex + 1}`}
                width={400}
                height={300}
                layout="responsive"
              />
            </div>
          )}
          {renderQuestionOptions(currentQuestion)}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleNavigation('prev')}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150 disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150"
              >
                Review Answers
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('next')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
              >
                Next
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <p className="font-semibold">Question {index + 1}: {question.text}</p>
                <p className={answers[question.id] ? "text-blue-600" : "text-yellow-600"}>
                  {answers[question.id] ? `Your answer: ${answers[question.id]}` : "Skipped"}
                </p>
              </div>
            ))}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm Submission"}
              </button>
            </div>
            {submitError && <p className="mt-4 text-red-500 text-center">{submitError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;