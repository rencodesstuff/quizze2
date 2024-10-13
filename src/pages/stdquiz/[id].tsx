import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "../../../utils/supabase/component";
import { MultiStepLoader } from "@/ui/multi-step-loader";
import Image from "next/image";

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[] | null;
  correct_answer: string;
  image_url?: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: Question[];
}

interface LoadingState {
  text: string;
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const supabase = createClient();

  const loadingStates: LoadingState[] = [
    { text: "Validating" },
    { text: "Uploading" },
    { text: "Processing" },
    { text: "Finalizing" },
  ];

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== "string") return;

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No authenticated user found");

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("name, student_id")
          .eq("id", user.id)
          .single();

        if (studentError) throw studentError;
        if (!studentData) throw new Error("No student data found");

        setStudentName(studentData.name);
        setStudentId(studentData.student_id);

        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
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
              correct_answer,
              image_url
            )
          `)
          .eq("id", id)
          .single();

        if (quizError) throw quizError;

        const transformedQuizData = {
          ...quizData,
          questions: quizData.questions.map((question: Question) => ({
            ...question,
            options: question.type.toLowerCase().includes("multiple_choice")
              ? Array.isArray(question.options)
                ? question.options
                : typeof question.options === "string"
                ? JSON.parse(question.options)
                : []
              : null,
          })),
        };

        setQuiz(transformedQuizData as Quiz);
        setTimeLeft(quizData.duration_minutes * 60);
      } catch (error) {
        console.error("Error fetching quiz or student info:", error);
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

  const handleSkipQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleShowConfirmation = () => {
    if (quiz && Object.keys(answers).length > 0) {
      setShowConfirmation(true);
    } else {
      alert("Please answer at least one question before submitting.");
    }
  };

  const calculateScore = (
    userAnswers: Record<string, string>,
    questions: Question[]
  ): number => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (
        userAnswers[question.id]?.toLowerCase() ===
        question.correct_answer.toLowerCase()
      ) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string") return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      const score = calculateScore(answers, quiz.questions);

      setSubmissionStep(0);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissionStep(1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissionStep(2);

      const { data, error } = await supabase
        .from("quiz_submissions")
        .insert({
          student_id: user.id,
          quiz_id: id,
          answers: answers,
          score: score,
          total_questions: quiz.questions.length,
          correct_answers: Math.round((score / 100) * quiz.questions.length),
        })
        .select();

      if (error) throw error;

      setSubmissionStep(3);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Quiz submitted successfully:", data);
      setQuizSubmitted(true);

      router.push(`/quiz-result/${id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setSubmitError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionOptions = (question: Question) => {
    const questionType = question.type.toLowerCase().replace(/[^a-z0-9]/g, "_");

    switch (questionType) {
      case "multiple_choice":
        return (
          <div className="space-y-4 mb-8">
            {question.options &&
              question.options.map((option, index) => (
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
      case "true_false":
      case "true_or_false":
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
      case "short_answer":
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
      default:
        console.log("Unsupported question type:", question.type);
        return <p>Unsupported question type: {question.type}</p>;
    }
  };

  if (!quiz)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading quiz...
      </div>
    );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Submitting Quiz
          </h2>
          <MultiStepLoader
            loadingStates={loadingStates}
            loading={isSubmitting}
          />
          <p className="mt-6 text-center text-gray-600">
            Please wait while we submit your quiz...
          </p>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Confirm Submission
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">{studentName}</p>
              <p className="text-sm text-gray-600">Student ID: {studentId}</p>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white shadow-xl rounded-lg p-8 max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="mb-6">
                <p className="font-semibold">
                  Question {index + 1}: {question.text}
                </p>
                {answers[question.id] ? (
                  <p className="text-blue-600">
                    Your answer: {answers[question.id]}
                  </p>
                ) : (
                  <p className="text-yellow-600">Skipped</p>
                )}
              </div>
            ))}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm Submission"}
              </button>
            </div>
            {submitError && (
              <p className="mt-4 text-red-500 text-center">{submitError}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">{studentName}</p>
            <p className="text-sm text-gray-600">Student ID: {studentId}</p>
            <p className="text-sm font-bold text-blue-600">
              Time left: {Math.floor(timeLeft! / 60)}:
              {(timeLeft! % 60).toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex p-4">
        <div className="w-1/4 bg-white shadow-xl rounded-lg p-4 mr-4">
          <h2 className="text-lg font-bold mb-4">Questions</h2>
          <div className="space-y-2">
            {quiz.questions.map((q, index) => (
              <button
              key={q.id}
              onClick={() => handleQuestionSelect(index)}
              className={`w-full text-left p-2 rounded ${
                index === currentQuestionIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Question {index + 1}
              {answers[q.id] && answers[q.id].trim() !== "" && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow bg-white shadow-xl rounded-lg p-8"
      >
        <h2 className="text-xl font-bold mb-4">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </h2>
        <p className="text-lg mb-6">{currentQuestion.text}</p>

        {currentQuestion.image_url && (
          <div className="mb-6">
            <Image
              src={currentQuestion.image_url}
              alt={`Image for question ${currentQuestionIndex + 1}`}
              width={400}
              height={300}
              layout="responsive"
            />
          </div>
        )}

        {renderQuestionOptions(currentQuestion)}

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150 disabled:opacity-50"
          >
            Previous
          </button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleShowConfirmation}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150"
            >
              Review Answers
            </button>
          ) : (
            <div>
              <button
                onClick={handleSkipQuestion}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-150 mr-2"
              >
                Skip
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  </div>
);
};

export default TakeQuiz;