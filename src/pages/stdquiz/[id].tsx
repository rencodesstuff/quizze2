import React, { useState, useEffect, ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "../../../utils/supabase/component";
import { MultipleChoice, TrueFalse, ShortAnswer } from "@/comps/QuestionTypes";
import ErrorModal from "@/comps/ErrorModal";

// Error boundary component
class ErrorBoundary extends React.Component<
  {
    children: ReactNode;
    onError: (error: Error, errorInfo: ErrorInfo) => void;
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: ReactNode;
    onError: (error: Error, errorInfo: ErrorInfo) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try refreshing the page.</h1>;
    }

    return this.props.children;
  }
}

interface Question {
  id: string;
  type: string;
  text: string;
  options: string | string[] | null;
  correct_answer: string;
  image_url?: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: Question[];
  randomize_arrangement: boolean;
}

const TakeQuiz: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== "string") {
        setErrorMessage("Invalid quiz ID. Please try again.");
        return;
      }
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user found");

        const [studentData, quizData] = await Promise.all([
          supabase
            .from("students")
            .select("name, student_id")
            .eq("id", user.id)
            .single(),
          supabase
            .from("quizzes")
            .select(
              `
            id, title, duration_minutes, release_date, randomize_arrangement,
            questions (id, type, text, options, correct_answer, image_url)
          `
            )
            .eq("id", id)
            .single(),
        ]);

        if (studentData.error) throw new Error("Error fetching student data");
        if (quizData.error) throw new Error("Error fetching quiz data");

        setStudentInfo({
          name: studentData.data.name,
          id: studentData.data.student_id,
        });

        // Generate a random seed based on the student ID and quiz ID
        const seed = hashCode(
          `${studentData.data.student_id}-${quizData.data.id}`
        );
        setRandomSeed(seed);

        // Validate and potentially randomize quiz data
        let validatedQuestions = quizData.data.questions.map((q: Question) => ({
          ...q,
          options: validateQuestionOptions(q),
        }));

        if (quizData.data.randomize_arrangement) {
          validatedQuestions = shuffleArray(validatedQuestions, seed);
        }

        setQuiz({
          ...quizData.data,
          questions: validatedQuestions,
        });
        setTimeLeft(quizData.data.duration_minutes * 60);
      } catch (error) {
        setErrorMessage(
          `An error occurred while loading the quiz: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    fetchQuizAndStudentInfo();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted]);

  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; 
    }
    return Math.abs(hash);
  };

  const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    let currentIndex = shuffled.length,
      temporaryValue,
      randomIndex;

    // Create a seeded random number generator
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // While there remain elements to shuffle
    while (0 !== currentIndex) {
      // Pick a remaining element
      randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  };

  const parseOptions = (options: string | string[] | null): string[] | null => {
    if (Array.isArray(options)) {
      return options;
    }
    if (typeof options === "string") {
      try {
        const parsedOptions = JSON.parse(options);
        if (Array.isArray(parsedOptions)) {
          return parsedOptions;
        }
      } catch (error) {
        console.error("Error parsing options:", error);
      }
    }
    return null;
  };

  const validateQuestionOptions = (question: Question): string[] | null => {
    const questionType = question.type.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const parsedOptions = parseOptions(question.options);

    switch (questionType) {
      case "multiple_choice":
        if (
          parsedOptions &&
          parsedOptions.every((opt) => typeof opt === "string")
        ) {
          return parsedOptions;
        }
        throw new Error(
          `Invalid options for multiple choice question ${question.id}`
        );

      case "true_false":
        return ["True", "False"];

      case "short_answer":
        return null;

      default:
        throw new Error(`Unsupported question type: ${question.type}`);
    }
  };

  const handleAnswer = (questionId: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const handleNavigation = (direction: "next" | "prev") => {
    if (!quiz) return;
    const newIndex =
      direction === "next"
        ? currentQuestionIndex + 1
        : currentQuestionIndex - 1;
    if (newIndex >= 0 && newIndex < quiz.questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string") {
      setErrorMessage("Unable to submit quiz. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const score = quiz.questions.reduce(
        (acc, q) =>
          acc +
          (answers[q.id]?.toLowerCase() === q.correct_answer.toLowerCase()
            ? 1
            : 0),
        0
      );

      const { error } = await supabase.from("quiz_submissions").insert({
        student_id: user.id,
        quiz_id: id,
        answers,
        score: Math.round((score / quiz.questions.length) * 100),
        total_questions: quiz.questions.length,
        correct_answers: score,
      });

      if (error) throw error;
      setQuizSubmitted(true);
      router.push(`/stdinbox`);
    } catch (error) {
      setSubmitError(
        `Failed to submit quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionOptions = (question: Question) => {
    const parsedOptions = parseOptions(question.options);
    const props = {
      question: {
        ...question,
        options: parsedOptions,
      },
      answers,
      handleAnswer,
    };

    try {
      switch (question.type.toLowerCase().replace(/[^a-z0-9]/g, "_")) {
        case "multiple_choice":
          return <MultipleChoice {...props} />;
        case "true_false":
          return <TrueFalse {...props} />;
        case "short_answer":
          return <ShortAnswer {...props} />;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }
    } catch (error) {
      console.error(`Error rendering question ${question.id}:`, error);
      return (
        <p className="text-red-500">
          Error loading question. Please try refreshing the page.
        </p>
      );
    }
  };

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("Caught an error:", error, errorInfo);
    setErrorMessage(
      `An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.`
    );
  };

  if (errorMessage) {
    return (
      <ErrorModal
        message={errorMessage}
        onClose={() => router.push("/stdinbox")}
      />
    );
  }

  if (!quiz)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading quiz...
      </div>
    );

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <ErrorBoundary onError={handleError}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">{studentInfo.name}</p>
              <p className="text-sm text-gray-600">
                Student ID: {studentInfo.id}
              </p>
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
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-full text-left p-2 rounded ${
                    index === currentQuestionIndex
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
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
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
                onClick={() => handleNavigation("prev")}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-150 disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150"
                >
                  Review Answers
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("next")}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </main>

        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white p-8 rounded-lg max-w-2xl w-full"
              >
                <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <p className="font-semibold">
                      Question {index + 1}: {question.text}
                    </p>
                    <p
                      className={
                        answers[question.id]
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }
                    >
                      {answers[question.id]
                        ? `Your answer: ${answers[question.id]}`
                        : "Skipped"}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between mt-6">
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default TakeQuiz;
