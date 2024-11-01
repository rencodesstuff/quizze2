// QuestionTypes.tsx
import React from 'react';
import Image from 'next/image';

interface QuestionProps {
  question: {
    id: string;
    text: string;
    type: string;
    options?: string[] | null;
    image_url?: string;
    explanation?: string;
    correct_answer: string;
    multiple_correct_answers?: string[];
  };
  answers: Record<string, any>;
  handleAnswer: (questionId: string, answer: any) => void;
  showExplanation?: boolean;
}

export const MultipleChoice: React.FC<QuestionProps> = ({ 
  question, 
  answers, 
  handleAnswer, 
  showExplanation 
}) => {
  if (!question.options || question.options.length === 0) {
    return <p className="text-red-500">No options available for this question.</p>;
  }

  return (
    <div className="space-y-4">
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
      
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
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

export const TrueFalse: React.FC<QuestionProps> = ({ 
  question, 
  answers, 
  handleAnswer, 
  showExplanation 
}) => {
  return (
    <div className="space-y-4">
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
      
      <div className="space-y-2">
        {["True", "False"].map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
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

export const ShortAnswer: React.FC<QuestionProps> = ({ 
  question, 
  answers, 
  handleAnswer, 
  showExplanation 
}) => {
  return (
    <div>
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

export const MultipleSelection: React.FC<QuestionProps> = ({ 
  question, 
  answers, 
  handleAnswer, 
  showExplanation 
}) => {
  const currentAnswers = typeof answers[question.id] === 'string' 
    ? JSON.parse(answers[question.id] || '[]') 
    : answers[question.id] || [];

  const handleCheckboxChange = (option: string) => {
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    handleAnswer(question.id, newAnswers);
  };

  if (!question.options || question.options.length === 0) {
    return <p className="text-red-500">No options available for this question.</p>;
  }

  return (
    <div className="space-y-4">
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
      
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <input
              type="checkbox"
              checked={currentAnswers.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
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

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection';

export const QuestionTypes: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  'multiple-selection': 'Multiple Selection'
};

export const isAnswerComplete = (
  questionType: QuestionType, 
  answer: any
): boolean => {
  if (!answer) return false;

  switch (questionType) {
    case 'multiple-choice':
    case 'true-false':
    case 'short-answer':
      return typeof answer === 'string' && answer.trim() !== '';

    case 'multiple-selection':
      try {
        const answers = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return Array.isArray(answers) && answers.length > 0;
      } catch {
        return false;
      }

    default:
      return false;
  }
};

export const formatAnswer = (
  questionType: QuestionType, 
  answer: any
): string => {
  try {
    switch (questionType) {
      case 'multiple-choice':
      case 'true-false':
      case 'short-answer':
        return String(answer);

      case 'multiple-selection':
        const selections = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return Array.isArray(selections) ? selections.join(', ') : String(answer);

      default:
        return String(answer);
    }
  } catch (e) {
    console.error('Error formatting answer:', e);
    return String(answer);
  }
};

export type { QuestionProps };