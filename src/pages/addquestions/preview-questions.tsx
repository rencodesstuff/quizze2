import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

interface Question {
  question: string;
  options: string[];
  correctOption: string;
}

const PreviewQuestionsPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // In a real application, you would fetch the questions from your backend or state management solution
    // For now, we'll use some mock data
    const mockQuestions: Question[] = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctOption: "Paris"
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctOption: "Mars"
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Preview Questions</h1>
        {questions.map((q, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">{q.question}</h2>
            <ul className="space-y-2">
              {q.options.map((option: string, optIndex: number) => (
                <li
                  key={optIndex}
                  className={`p-2 rounded ${
                    option === q.correctOption
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-100'
                  } border`}
                >
                  {option} {option === q.correctOption && ' (Correct)'}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/addquestions')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Add Questions
        </motion.button>
      </div>
    </div>
  );
};

export default PreviewQuestionsPage;
