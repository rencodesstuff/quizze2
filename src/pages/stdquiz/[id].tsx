import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Card, Title, Text, Subtitle } from '@tremor/react';

interface Question {
  question: string;
  answer: string;
  correct: boolean;
}

interface QuizResult {
  id: string;
  name: string;
  date: string;
  score: string;
  questions: Question[];
}

const mockQuizResults: QuizResult[] = [
    {
      id: '6',
      name: 'Biology',
      date: '2024-07-30',
      score: '85%',
      questions: [
        { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', correct: true },
        { question: 'What is the largest organ in the human body?', answer: 'Skin', correct: true },
        { question: 'What is the process by which plants make their own food?', answer: 'Photosynthesis', correct: true },
        { question: 'What is the name of the pigment that gives plants their green color?', answer: 'Chloroplast', correct: false },
        { question: 'What is the scientific name for the human species?', answer: 'Homo sapiens', correct: true },
      ],
    },
    {
      id: '7',
      name: 'Chemistry',
      date: '2024-08-02',
      score: '92%',
      questions: [
        { question: 'What is the chemical symbol for water?', answer: 'H2O', correct: true },
        { question: 'What type of bond involves the sharing of electron pairs between atoms?', answer: 'Covalent bond', correct: true },
        { question: 'Which element has the highest electronegativity?', answer: 'Fluorine', correct: true },
        { question: 'What is the process called where a solid turns directly into a gas?', answer: 'Sublimation', correct: true },
        { question: 'What pH level is considered neutral?', answer: '7', correct: true },
      ],
    },
    {
      id: '8',
      name: 'Geography',
      date: '2024-08-07',
      score: '78%',
      questions: [
        { question: 'What is the largest desert in the world?', answer: 'Antarctica', correct: true },
        { question: 'Which river is the longest in the world?', answer: 'Amazon River', correct: false }, // Nile is the correct answer
        { question: 'What is the imaginary line called that divides the earth into Northern and Southern Hemispheres?', answer: 'Equator', correct: true },
        { question: 'Which country has the most natural lakes?', answer: 'Canada', correct: true },
        { question: 'What is the capital city of Australia?', answer: 'Canberra', correct: true },
      ],
    },
    // You can add more quizzes or other subjects as needed
  ];
  

const QuizResult = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (id) {
      const result = mockQuizResults.find(quiz => quiz.id === id);
      if (result) {
        setQuizResult(result);
      }
    }
  }, [id]);

  if (!quizResult) {
    return <div>Loading...</div>;
  }

  const chartdata = [
    { name: 'Correct', 'Number of Questions': quizResult.questions.filter(q => q.correct).length },
    { name: 'Incorrect', 'Number of Questions': quizResult.questions.filter(q => !q.correct).length },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <Title>{quizResult.name} Quiz Results</Title>
            <Text>Date: {quizResult.date}</Text>
            <Subtitle>Score: {quizResult.score}</Subtitle>

            <BarChart
              className="mt-6"
              data={chartdata}
              index="name"
              categories={['Number of Questions']}
              colors={['green', 'red']}
              yAxisWidth={48}
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Question Breakdown</h3>
              {quizResult.questions.map((q, index) => (
                <motion.div
                  key={index}
                  className={`p-4 mb-4 rounded-lg ${q.correct ? 'bg-green-100' : 'bg-red-100'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <p className="font-medium">{q.question}</p>
                  <p className="text-sm mt-1">Your answer: {q.answer}</p>
                  <p className={`text-sm mt-1 ${q.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {q.correct ? 'Correct' : 'Incorrect'}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResult;