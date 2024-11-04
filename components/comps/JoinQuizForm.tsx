// components/JoinQuizForm.tsx
import React from "react";
import { Title } from "@tremor/react";

interface JoinQuizFormProps {
  quizCode: string;
  onQuizCodeChange: (code: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const JoinQuizForm: React.FC<JoinQuizFormProps> = ({ 
  quizCode, 
  onQuizCodeChange,
  onSubmit,
  isLoading = false 
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Enter 6-digit quiz code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={quizCode}
            onChange={(e) => onQuizCodeChange(e.target.value.toUpperCase())}
            maxLength={6}
            required
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading || !quizCode.trim()}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] h-[40px] flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            'Join Quiz'
          )}
        </button>
      </div>
    </form>
  );
};

export default JoinQuizForm;