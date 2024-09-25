import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import { motion } from 'framer-motion';
import Image from 'next/image';
import QuizDetailsModal from './QuizDetailsModal';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  correct_answer: string;
  image_url?: string;
  explanation: string;
}

interface QuizDetails {
  code: string;
  title: string;
  releaseDate: string;
  durationMinutes: number;
}

const PreviewQuizPage: React.FC = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    setIsLoading(true);
    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('title, release_date, duration_minutes')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;
      setQuizTitle(quizData.title);

      // Fetch questions
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
      alert('Failed to load quiz data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Question {index + 1}: {question.text}</h3>
        {question.image_url && (
          <div className="mb-4">
            <Image src={question.image_url} alt="Question image" width={300} height={200} objectFit="contain" />
          </div>
        )}
        {renderQuestionType(question, index)}
        <p className="text-sm text-gray-600 mt-2">Correct answer: {question.correct_answer}</p>
        <p className="text-sm text-gray-600 mt-1">Explanation: {question.explanation}</p>
      </div>
    );
  };

  const renderQuestionType = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <>
            {question.options && question.options.map((option, i) => (
              <div key={i} className="flex items-center mb-2">
                <input type="radio" id={`q${index}-option${i}`} name={`question-${index}`} className="mr-2" />
                <label htmlFor={`q${index}-option${i}`}>{option}</label>
              </div>
            ))}
          </>
        );
      case 'true-false':
        return (
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input type="radio" id={`q${index}-true`} name={`question-${index}`} value="true" className="mr-2" />
              <label htmlFor={`q${index}-true`}>True</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id={`q${index}-false`} name={`question-${index}`} value="false" className="mr-2" />
              <label htmlFor={`q${index}-false`}>False</label>
            </div>
          </div>
        );
      case 'short-answer':
        return (
          <input type="text" placeholder="Enter your answer" className="w-full p-2 border rounded" />
        );
      default:
        return null;
    }
  };

  const generateQuizCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleFinish = async () => {
    setIsGeneratingCode(true);
    try {
      const quizCode = generateQuizCode();
      const { data, error } = await supabase
        .from('quizzes')
        .update({ code: quizCode })
        .eq('id', quizId)
        .select('title, release_date, duration_minutes');

      if (error) throw error;

      if (data) {
        setQuizDetails({
          code: quizCode,
          title: data[0].title,
          releaseDate: data[0].release_date,
          durationMinutes: data[0].duration_minutes
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error generating quiz code:', error);
      alert('Failed to generate quiz code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/teachquiz');
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
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Preview: {quizTitle}</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
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
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => router.push(`/addquestions/${quizId}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Edit
          </button>
          <button
            onClick={handleFinish}
            disabled={isGeneratingCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isGeneratingCode ? 'Generating Code...' : 'Finish'}
          </button>
        </div>
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

export default PreviewQuizPage;