// pages/stdquiz/[id].tsx
import React, { useState, useEffect, ErrorInfo, ReactNode } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "../../../utils/supabase/component";
import {
  MultipleChoice,
  TrueFalse,
  ShortAnswer,
  MultipleSelection,
  QuestionType,
} from "@/comps/QuestionTypes";
import ErrorModal from "@/comps/ErrorModal";
import ExamSecurityWrapper from "@/comps/ExamSecurity";

// Type definitions
type AnswerType = string | string[];

interface Answers {
  [questionId: string]: AnswerType;
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: string | string[] | null;
  correct_answer: string;
  image_url?: string;
  explanation?: string;
  multiple_correct_answers?: string[];
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: BaseQuestion[];
  randomize_arrangement: boolean;
  strict_mode: boolean;
  teacher_id: string;
}

// Helper function to safely parse JSON strings
const safeJSONParse = (str: string | null) => {
  if (!str) return null;
  try {
    const cleanStr = str.replace(/\\"/g, '"').replace(/^"|"$/g, "");
    return JSON.parse(cleanStr);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return null;
  }
};

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

const TakeQuiz: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [hasAnimatedModal, setHasAnimatedModal] = useState(false);
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
              id, title, duration_minutes, release_date, 
              randomize_arrangement, strict_mode, teacher_id,
              questions (id, type, text, options, correct_answer, image_url,
                      explanation, multiple_correct_answers)
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

        const seed = hashCode(
          `${studentData.data.student_id}-${quizData.data.id}`
        );
        setRandomSeed(seed);

        let validatedQuestions = quizData.data.questions.map(
          (q: BaseQuestion) => ({
            ...q,
            options: validateQuestionOptions(q),
          })
        );

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

  // Timer effect
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

    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    while (0 !== currentIndex) {
      randomIndex = Math.floor(seededRandom() * currentIndex);
      currentIndex -= 1;
      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  };

  const validateQuestionOptions = (question: BaseQuestion): string[] | null => {
    let parsedOptions = question.options;

    if (typeof question.options === "string") {
      parsedOptions = safeJSONParse(question.options);
    }

    switch (question.type) {
      case "multiple-choice":
      case "multiple-selection":
        if (
          Array.isArray(parsedOptions) &&
          parsedOptions.every((opt) => typeof opt === "string")
        ) {
          return parsedOptions.map((opt) => opt.trim());
        }
        return null;

      case "true-false":
        return ["True", "False"];

      case "short-answer":
        return null;

      default:
        console.warn(`Unexpected question type: ${question.type}`);
        return null;
    }
  };

  const handleAnswer = (questionId: string, answer: AnswerType) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]:
        typeof answer === "object" ? JSON.stringify(answer) : answer,
    }));
  };

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

      const processedAnswers = Object.entries(answers).reduce<
        Record<string, any>
      >((acc, [qId, answer]) => {
        const question = quiz.questions.find((q) => q.id === qId);
        if (!question) return acc;

        let processedAnswer = answer;
        try {
          if (
            typeof answer === "string" &&
            question.type === "multiple-selection"
          ) {
            processedAnswer = JSON.parse(answer);
          }
        } catch (e) {
          console.error("Error processing answer:", e);
        }

        return { ...acc, [qId]: processedAnswer };
      }, {});

      const score = quiz.questions.reduce((acc, q) => {
        const processedAnswer = processedAnswers[q.id];
        let isCorrect = false;

        switch (q.type) {
          case "multiple-selection":
            const correctAnswers = Array.isArray(q.multiple_correct_answers)
              ? q.multiple_correct_answers
              : typeof q.multiple_correct_answers === "string" &&
                q.multiple_correct_answers
              ? safeJSONParse(q.multiple_correct_answers) || []
              : [];
            isCorrect =
              JSON.stringify(processedAnswer?.sort()) ===
              JSON.stringify(correctAnswers.sort());
            break;

          default:
            isCorrect =
              String(processedAnswer).toLowerCase() ===
              String(q.correct_answer).toLowerCase();
        }

        return acc + (isCorrect ? 1 : 0);
      }, 0);

      const { error } = await supabase.from("quiz_submissions").insert({
        student_id: user.id,
        quiz_id: id,
        answers: processedAnswers,
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
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionOptions = (question: BaseQuestion) => {
    const enhancedQuestion = {
      ...question,
      options:
        typeof question.options === "string"
          ? safeJSONParse(question.options)
          : question.options,
      multiple_correct_answers: (() => {
        if (Array.isArray(question.multiple_correct_answers)) {
          return question.multiple_correct_answers;
        }
        if (
          typeof question.multiple_correct_answers === "string" &&
          question.multiple_correct_answers
        ) {
          return safeJSONParse(question.multiple_correct_answers) || [];
        }
        return [];
      })(),
    };

    let currentAnswer: AnswerType = answers[question.id] || "";
    if (
      typeof currentAnswer === "string" &&
      question.type === "multiple-selection"
    ) {
      try {
        currentAnswer = JSON.parse(currentAnswer);
      } catch (e) {
        console.error("Error parsing answer:", e);
        currentAnswer = [];
      }
    }

    const commonProps = {
      question: enhancedQuestion,
      answers: {
        ...answers,
        [question.id]: currentAnswer,
      } as Answers,
      handleAnswer,
      showExplanation: false,
    };

    switch (question.type) {
      case "multiple-choice":
        return enhancedQuestion.options ? (
          <MultipleChoice {...commonProps} />
        ) : (
          <p className="text-red-500">
            No options available for this question.
          </p>
        );

      case "true-false":
        return <TrueFalse {...commonProps} />;

      case "short-answer":
        return <ShortAnswer {...commonProps} />;

      case "multiple-selection":
        return enhancedQuestion.options ? (
          <MultipleSelection {...commonProps} />
        ) : (
          <p className="text-red-500">
            No options available for this question.
          </p>
        );

      default:
        console.warn(`Unexpected question type: ${question.type}`);
        return null;
    }
  };

  const formatAnswer = (question: BaseQuestion, answer: any): string => {
    try {
      if (
        typeof answer === "string" &&
        question.type === "multiple-selection"
      ) {
        const parsed = JSON.parse(answer);
        return Array.isArray(parsed) ? parsed.join(", ") : answer;
      }
      return String(answer);
    } catch (e) {
      return String(answer);
    }
  };

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("Caught an error:", error, errorInfo);
    setErrorMessage(
      "An unexpected error occurred. Please try refreshing the page."
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

  if (!quiz) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const isAnswerEmpty = (answer: AnswerType): boolean => {
    if (!answer) return true;
    if (typeof answer === "string") return answer.trim() === "";
    if (Array.isArray(answer)) return answer.length === 0;
    return true;
  };

  const QuizContent = () => (
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
            {quiz.questions.map((q, index) => {
              const hasAnswer =
                q.id in answers && !isAnswerEmpty(answers[q.id]);

              return (
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
                  {hasAnswer && <span className="ml-2 text-green-500">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-grow relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-xl rounded-lg p-8 absolute inset-0"
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
                    objectFit="contain"
                  />
                </div>
              )}
              <div className="question-options">
                {renderQuestionOptions(currentQuestion)}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => handleNavigation("prev")}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50"
                >
                  Previous
                </button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-150"
                  >
                    Review Answers
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation("next")}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150"
                  >
                    Next
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence mode="wait" initial={false}>
  {showConfirmation && (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50"
        key="modal-backdrop"
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          key="modal-content"
          initial={hasAnimatedModal ? false : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => setHasAnimatedModal(true)}
          className="bg-white rounded-lg max-w-2xl w-full"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              {quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <p className="font-semibold">
                    Question {index + 1}: {question.text}
                  </p>
                  <p
                    className={
                      question.id in answers
                        ? "text-blue-600 mt-2"
                        : "text-yellow-600 mt-2"
                    }
                  >
                    {question.id in answers
                      ? `Your answer: ${formatAnswer(
                          question,
                          answers[question.id]
                        )}`
                      : "Not answered"}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setHasAnimatedModal(false);  // Reset animation state when closing
                }}
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
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>
    </div>
  );

  return (
    <ErrorBoundary onError={handleError}>
      {quiz.strict_mode ? (
        <ExamSecurityWrapper
          quizId={id as string}
          teacherId={quiz.teacher_id}
          studentName={studentInfo.name}
          quizTitle={quiz.title}
          strictMode={quiz.strict_mode}
        >
          <QuizContent />
        </ExamSecurityWrapper>
      ) : (
        <QuizContent />
      )}
    </ErrorBoundary>
  );
};

export default TakeQuiz;
