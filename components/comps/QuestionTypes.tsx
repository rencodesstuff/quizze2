import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface QuestionProps {
  question: {
    id: string;
    text: string;
    options?: string[] | null;
    image_url?: string;
    multiple_correct_answers?: string[];
    drag_drop_pairs?: { [key: string]: string };
    blank_positions?: { [key: string]: number[] };
    explanation?: string;
  };
  answers: Record<string, any>;
  handleAnswer: (questionId: string, answer: any) => void;
  showExplanation?: boolean;
}

// Multiple Choice Question Component
export const MultipleChoice: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  if (!question.options || question.options.length === 0) {
    return <p className="text-red-500">No options available for this question.</p>;
  }

  return (
    <div className="space-y-4 mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      {question.options.map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
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
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// True/False Question Component
export const TrueFalse: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  return (
    <div className="space-y-4 mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      {["True", "False"].map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.toLowerCase()}
              checked={answers[question.id] === option.toLowerCase()}
              onChange={() => handleAnswer(question.id, option.toLowerCase())}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        </motion.div>
      ))}
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// Short Answer Question Component
export const ShortAnswer: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  return (
    <div className="mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={4}
        value={answers[question.id] || ""}
        onChange={(e) => handleAnswer(question.id, e.target.value)}
        placeholder="Type your answer here..."
      />
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// Multiple Selection Component
export const MultipleSelection: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  const handleCheckboxChange = (option: string) => {
    const currentAnswers = answers[question.id] || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    handleAnswer(question.id, newAnswers);
  };

  return (
    <div className="space-y-4 mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      <p className="text-sm text-gray-600 mb-2">Select all that apply:</p>
      
      {question.options?.map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <label className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
            <input
              type="checkbox"
              checked={(answers[question.id] || []).includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        </motion.div>
      ))}
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// Drag and Drop Component
export const DragAndDrop: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const pairs = question.drag_drop_pairs || {};
  const terms = Object.keys(pairs);
  const definitions = Object.values(pairs);
  const currentAnswers = answers[question.id] || {};

  const handleDragStart = (term: string) => {
    setDraggedItem(term);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (definition: string) => {
    if (draggedItem) {
      const newAnswers = { ...currentAnswers, [draggedItem]: definition };
      handleAnswer(question.id, newAnswers);
      setDraggedItem(null);
    }
  };

  return (
    <div className="mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 mb-2">Terms</h3>
          {terms.map((term, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              draggable
              onDragStart={() => handleDragStart(term)}
              className={`p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-move 
                ${draggedItem === term ? 'opacity-50' : ''} 
                hover:shadow-md transition-shadow duration-200`}
            >
              {term}
            </motion.div>
          ))}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 mb-2">Definitions</h3>
          {definitions.map((definition, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(definition)}
              className={`p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg
                ${Object.values(currentAnswers).includes(definition) ? 'bg-green-50 border-green-300' : ''}
                min-h-[60px] flex items-center justify-center`}
            >
              {definition}
            </motion.div>
          ))}
        </div>
      </div>
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// Fill in the Blanks Component
export const FillInBlanks: React.FC<QuestionProps> = ({ question, answers, handleAnswer, showExplanation }) => {
  const blankPositions = question.blank_positions || [];
  const text = question.text;
  const parts = text.split('_____');

  const handleBlankChange = (index: number, value: string) => {
    const newAnswers = { ...answers[question.id], [index]: value };
    handleAnswer(question.id, newAnswers);
  };

  return (
    <div className="mb-8">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}
      
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                value={answers[question.id]?.[index] || ''}
                onChange={(e) => handleBlankChange(index, e.target.value)}
                className="mx-2 px-2 py-1 w-32 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 transition-colors duration-200"
                placeholder="Fill in..."
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection' | 'drag-drop' | 'fill-blanks';

export const QuestionTypes: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  'multiple-selection': 'Multiple Selection',
  'drag-drop': 'Drag and Drop',
  'fill-blanks': 'Fill in the Blanks'
};