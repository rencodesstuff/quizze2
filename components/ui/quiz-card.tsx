// components/ui/quiz-card.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface QuizCardProps {
  quiz: {
    title: string;
    description: string;
    icon: string;
    questions: number;
    duration: string;
    difficulty: string;
    category: string;
  };
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center mb-4">
        <img src={quiz.icon} alt={quiz.title} className="w-12 h-12 mr-4" />
        <h3 className="text-xl font-semibold">{quiz.title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{quiz.description}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{quiz.questions} questions</span>
        <span>{quiz.duration}</span>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs ${
          quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
          quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {quiz.difficulty}
        </span>
        <span className="text-blue-600 text-sm">{quiz.category}</span>
      </div>
    </motion.div>
  );
};