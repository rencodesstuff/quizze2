import React from 'react';
import { motion } from 'framer-motion';

interface QuestionProps {
  question: {
    id: string;
    text: string;
    options?: string[] | null;
  };
  answers: Record<string, string>;
  handleAnswer: (questionId: string, answer: string) => void;
}

// Multiple Choice Question Component
export const MultipleChoice: React.FC<QuestionProps> = ({ question, answers, handleAnswer }) => {
    if (!question.options || question.options.length === 0) {
      return <p>No options available for this question.</p>;
    }
  
    return (
      <div className="space-y-4 mb-8">
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <label className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-150">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleAnswer(question.id, option)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          </motion.div>
        ))}
      </div>
    );
  };

// True/False Question Component
export const TrueFalse: React.FC<QuestionProps> = ({ question, answers, handleAnswer }) => {
  return (
    <div className="space-y-4 mb-8">
      {["True", "False"].map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <label className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-150">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={answers[question.id] === option}
              onChange={() => handleAnswer(question.id, option)}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        </motion.div>
      ))}
    </div>
  );
};

// Short Answer Question Component
export const ShortAnswer: React.FC<QuestionProps> = ({ question, answers, handleAnswer }) => {
  return (
    <div className="mb-8">
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        value={answers[question.id] || ""}
        onChange={(e) => handleAnswer(question.id, e.target.value)}
        placeholder="Type your answer here..."
      />
    </div>
  );
};