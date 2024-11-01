import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { QuizDetails, QuizDetailsModalProps } from '@/comps/QuizDetailsModal';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Preview page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <TeacherLayout>
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-4">
                An error occurred while loading the preview. Please try refreshing or return to the previous page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </TeacherLayout>
      );
    }

    return this.props.children;
  }
}

// Dynamic import of QuizDetailsModal with loading state
const QuizDetailsModal = dynamic<QuizDetailsModalProps>(
  () => import('@/comps/QuizDetailsModal'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Loading quiz details...</p>
        </div>
      </div>
    ),
  }
);

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  correct_answer: string;
  image_url?: string;
  explanation: string;
}


// Main Preview Component
const PreviewQuizPage: React.FC = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('title, release_date, duration_minutes')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuizTitle(quizData.title);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;
      
      const parsedQuestions = questionsData.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined
      }));
      setQuestions(parsedQuestions);

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      setError('Failed to load quiz data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(
      { length: 6 }, 
      () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };

  const handleFinish = async () => {
    setIsGeneratingCode(true);
    setError(null);
    try {
      const quizCode = generateQuizCode();
      const { data, error } = await supabase
        .from('quizzes')
        .update({ code: quizCode })
        .eq('id', quizId)
        .select('title, release_date, duration_minutes')
        .single();

      if (error) throw error;

      if (data) {
        setQuizDetails({
          code: quizCode,
          title: data.title,
          releaseDate: data.release_date,
          durationMinutes: data.duration_minutes
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error generating quiz code:', error);
      setError('Failed to generate quiz code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/teachquiz');
  };

  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Question {index + 1}: {question.text}
        </h3>
        
        {question.image_url && (
          <div className="mb-4">
            <Image
              src={question.image_url}
              alt="Question image"
              width={300}
              height={200}
              className="rounded-lg object-contain"
            />
          </div>
        )}

        <div className="mt-4 space-y-4">
          {renderQuestionType(question, index)}
          
          <div className="text-sm">
            <p className="text-green-600 font-medium">
              Correct answer: {question.correct_answer}
            </p>
            <p className="text-gray-600 mt-2">
              Explanation: {question.explanation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionType = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <div 
                key={i} 
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
              >
                <input
                  type="radio"
                  id={`q${index}-option${i}`}
                  name={`question-${index}`}
                  className="h-4 w-4 text-blue-600"
                  disabled
                />
                <label 
                  htmlFor={`q${index}-option${i}`} 
                  className="ml-3 text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex space-x-4">
            {['True', 'False'].map((option) => (
              <div 
                key={option} 
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
              >
                <input
                  type="radio"
                  id={`q${index}-${option}`}
                  name={`question-${index}`}
                  value={option.toLowerCase()}
                  className="h-4 w-4 text-blue-600"
                  disabled
                />
                <label 
                  htmlFor={`q${index}-${option}`} 
                  className="ml-3 text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'short-answer':
        return (
          <input
            type="text"
            placeholder="Student answer will go here"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            disabled
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Preview: {quizTitle}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push(`/addquestions/${quizId}`)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-center"
              >
                Back to Edit
              </button>
              <button
                onClick={handleFinish}
                disabled={isGeneratingCode || questions.length === 0}
                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 flex items-center justify-center
                  ${questions.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : isGeneratingCode 
                      ? 'bg-blue-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isGeneratingCode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Generating Code...</span>
                  </>
                ) : (
                  <span>Finish & Generate Code</span>
                )}
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Questions Added
              </h2>
              <p className="text-gray-600 mb-4">
                Add some questions before previewing the quiz.
              </p>
              <button
                onClick={() => router.push(`/addquestions/${quizId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add Questions
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="space-y-8">
                <div className="pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Quiz Overview
                  </h2>
                  <p className="text-gray-600">
                    Total Questions: {questions.length}
                  </p>
                </div>

                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {renderQuestion(question, index)}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {quizDetails && (
          <QuizDetailsModal
            isOpen={showModal}
            onClose={handleCloseModal}
            quizDetails={quizDetails}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

// Wrap the main component with ErrorBoundary
const PreviewQuizPageWrapper: React.FC = () => {
  return (
    <ErrorBoundary>
      <PreviewQuizPage />
    </ErrorBoundary>
  );
};

export default PreviewQuizPageWrapper;