import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { createClient } from "../../../utils/supabase/component";

type QuizReview = {
  id: string;
  score: number;
  total_questions: number;
  submitted_at: string;
  answers: Record<string, string>;
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      id: string;
      text: string;
      correct_answer: string;
      explanation: string | null;
    }>;
  };
};

const QuizReviewDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quizReview, setQuizReview] = useState<QuizReview | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchQuizReview = async () => {
      if (typeof id !== 'string') return;

      try {
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select(`
            id,
            score,
            total_questions,
            submitted_at,
            answers,
            quiz:quizzes (
              id,
              title,
              questions (
                id,
                text,
                correct_answer,
                explanation
              )
            )
          `)
          .eq('quiz_id', id)
          .single();

        if (error) throw error;

        // Ensure the quiz property is an object, not an array
        const formattedData: QuizReview = {
          ...data,
          quiz: Array.isArray(data.quiz) ? data.quiz[0] : data.quiz
        };

        setQuizReview(formattedData);
      } catch (error) {
        console.error('Error fetching quiz review:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizReview();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (!quizReview) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/stdinbox')}
          className="mb-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Quiz History
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{quizReview.quiz.title}</h1>
        <p className="text-xl text-gray-700 mb-8">
          Score: {quizReview.score}/{quizReview.total_questions} | 
          Submitted: {new Date(quizReview.submitted_at).toLocaleString()}
        </p>
        {quizReview.quiz.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white shadow-md rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Question {index + 1}: {question.text}</h2>
            <p className="mb-2">Your answer: <span className={quizReview.answers[question.id] === question.correct_answer ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{quizReview.answers[question.id] || 'Not answered'}</span></p>
            <p className="mb-4">Correct answer: <span className="text-green-600 font-semibold">{question.correct_answer}</span></p>
            {question.explanation && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">Explanation:</h3>
                <p>{question.explanation}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizReviewDetail;