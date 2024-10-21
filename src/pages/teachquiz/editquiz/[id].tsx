// File: pages/teachquiz/editquiz/[id].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../../utils/supabase/component";

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  correct_answer: string;
  image_url?: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string;
  code: string | null;
  questions: Question[];
}

const EditQuiz = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id);

      if (questionsError) throw questionsError;

      setQuiz({ ...quizData, questions: questionsData || [] });
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (quiz) {
      setQuiz({ ...quiz, [e.target.name]: e.target.value });
    }
  };

  const handleQuestionChange = (questionId: string, field: string, value: string) => {
    if (quiz) {
      const updatedQuestions = quiz.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleSave = async () => {
    if (!quiz) return;

    try {
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quiz.title,
          duration_minutes: quiz.duration_minutes,
          release_date: quiz.release_date,
          code: quiz.code,
        })
        .eq('id', quiz.id);

      if (quizError) throw quizError;

      for (const question of quiz.questions) {
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            type: question.type,
            text: question.text,
            options: question.options,
            correct_answer: question.correct_answer,
            image_url: question.image_url,
            explanation: question.explanation,
          })
          .eq('id', question.id);

        if (questionError) throw questionError;
      }

      alert('Quiz updated successfully!');
      router.push('/teachquiz');
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz. Please try again.');
    }
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  if (loading) {
    return <TeacherLayout><div>Loading...</div></TeacherLayout>;
  }

  if (!quiz) {
    return <TeacherLayout><div>Quiz not found</div></TeacherLayout>;
  }

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Quiz</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              name="duration_minutes"
              value={quiz.duration_minutes || ''}
              onChange={handleQuizChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Release Date</label>
            <input
              type="datetime-local"
              name="release_date"
              value={quiz.release_date}
              onChange={handleQuizChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              value={quiz.code || ''}
              onChange={handleQuizChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Questions</h2>
        {quiz.questions.map((question) => (
          <div key={question.id} className="border rounded-md p-4 mb-4">
            <div
              className="cursor-pointer flex justify-between items-center"
              onClick={() => toggleQuestion(question.id)}
            >
              <span>{question.text}</span>
              <span>{expandedQuestion === question.id ? '▲' : '▼'}</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedQuestion === question.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question Text</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <input
                    type="text"
                    value={question.type}
                    onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                  <input
                    type="text"
                    value={question.correct_answer}
                    onChange={(e) => handleQuestionChange(question.id, 'correct_answer', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                {/* Add more fields based later */}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Save Changes
        </button>
      </div>
    </TeacherLayout>
  );
};

export default EditQuiz;