import React, { useState } from "react";
import { Title } from "@tremor/react";

interface JoinQuizFormProps {
  onJoinQuiz: (quizCode: string) => void;
}

const JoinQuizForm: React.FC<JoinQuizFormProps> = ({ onJoinQuiz }) => {
  const [quizCode, setQuizCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinQuiz(quizCode);
    setQuizCode("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Title className="text-xl font-semibold mb-4">Join a New Quiz</Title>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Enter quiz code"
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
          required
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Join Quiz
        </button>
      </div>
    </form>
  );
};

export default JoinQuizForm;