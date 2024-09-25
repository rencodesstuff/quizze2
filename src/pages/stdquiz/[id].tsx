import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from "../../../utils/supabase/component";

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: Question[];
}

const TakeQuiz = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== 'string') return;

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', user.id)
          .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error('No student data found');

        setStudentName(studentData.name);
        setStudentId(studentData.student_id);

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            duration_minutes,
            release_date,
            questions (
              id,
              type,
              text,
              options,
              correct_answer
            )
          `)
          .eq('id', id)
          .single();

        if (quizError) throw quizError;

        setQuiz(quizData as Quiz);
        setTimeLeft(quizData.duration_minutes * 60);
      } catch (error) {
        console.error('Error fetching quiz or student info:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    fetchQuizAndStudentInfo();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== 'string') return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user found');

      const { data, error } = await supabase
        .from('quiz_submissions')
        .insert({
          student_id: user.id,
          quiz_id: id,
          answers: answers,
          // You can calculate the score here if you have the correct answers
          // score: calculateScore(answers, quiz.questions),
        })
        .select();

      if (error) throw error;

      console.log('Quiz submitted successfully:', data);
      setQuizSubmitted(true);
      
      // Navigate to results page
      router.push(`/quiz-result/${id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setSubmitError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) return <div className="h-screen flex items-center justify-center">Loading quiz...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">{studentName}</p>
            <p className="text-sm text-gray-600">Student ID: {studentId}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg p-8 max-w-3xl w-full"
        >
          {/* Timer */}
          <div className="mb-6 text-center">
            <p className="text-xl font-semibold">
              Time left: {Math.floor(timeLeft! / 60)}:{(timeLeft! % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold mb-4">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <p className="text-lg mb-6">{currentQuestion.text}</p>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <label className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-150">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswer(currentQuestion.id, option)}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              </motion.div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150 disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
              >
                Next
              </button>
            )}
          </div>

          {submitError && (
            <p className="mt-4 text-red-500 text-center">{submitError}</p>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default TakeQuiz;