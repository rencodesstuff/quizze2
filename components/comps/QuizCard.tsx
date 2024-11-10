import React from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Quiz {
  id: string;
  title: string;
  duration_minutes?: number | null;
  release_date: string | null;
}

interface QuizCardProps {
  quiz: Quiz;
  status: "active" | "upcoming" | "completed";
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, status }) => {
  const statusIcons = {
    active: <Clock className="w-5 h-5 text-green-500" />,
    upcoming: <Calendar className="w-5 h-5 text-yellow-500" />,
    completed: <CheckCircle className="w-5 h-5 text-blue-500" />
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    upcoming: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800"
  };

  // Determine the link URL based on the quiz status
  const getLinkUrl = () => {
    if (status === "completed") {
      return "/stdinbox"; // Redirect completed quizzes to inbox
    }
    return `/stdquiz/${quiz.id}`; // Default path for active and upcoming quizzes
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-gray-800">{quiz.title}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[status]} flex items-center`}>
            {statusIcons[status]}
            <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Release:</span> {quiz.release_date ? new Date(quiz.release_date).toLocaleString() : 'Always available'}
        </p>
        {quiz.duration_minutes && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold">Duration:</span> {quiz.duration_minutes} minutes
          </p>
        )}
        <Link legacyBehavior href={getLinkUrl()}>
          <a className={`block w-full py-2 text-center rounded-md transition-colors duration-200 ${
            status === "active" ? "bg-green-500 hover:bg-green-600 text-white" :
            status === "upcoming" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
            "bg-blue-500 hover:bg-blue-600 text-white"
          }`}>
            {status === "active" ? "Take Quiz" : status === "upcoming" ? "Prepare" : "View Results"}
          </a>
        </Link>
      </div>
    </motion.div>
  );
};

export default QuizCard;