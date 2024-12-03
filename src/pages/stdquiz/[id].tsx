import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { createClient } from "../../../utils/supabase/component";
import {
  MultipleChoice,
  TrueFalse,
  ShortAnswer,
  MultipleSelection,
  QuestionType,
  DragDrop,
} from "@/comps/QuestionTypes";
import ExamSecurityWrapper from "@/comps/ExamSecurity";
import DeviceControl from "@/comps/DeviceControl";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
  dragDropText?: string[];
  dragDropAnswers?: string[];
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string;
  questions: BaseQuestion[];
  randomize_arrangement: boolean;
  strict_mode: boolean;
  teacher_id: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
  children?: React.ReactNode;
}

interface TimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedirect: () => void;
}

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

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  isError = false,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4">
          <h2
            className={`text-lg font-semibold ${
              isError ? "text-red-600" : "text-gray-900"
            }`}
          >
            {title}
          </h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
        <div className="border-t p-4">
          {children || (
            <button
              onClick={onClose}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isError
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } transition-colors`}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TimeoutModal: React.FC<TimeoutModalProps> = ({
  isOpen,
  onClose,
  onRedirect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-red-600">
            Time&apos;s Up!
          </h2>
          <p className="mt-2 text-gray-600">
            Your quiz time has expired. Your answers will be automatically
            submitted.
          </p>
        </div>
        <div className="border-t p-4">
          <button
            onClick={onRedirect}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    onError: (error: Error, errorInfo: React.ErrorInfo) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Modal
          isOpen={true}
          onClose={() => window.location.reload()}
          title="Error"
          message="Something went wrong. Please try refreshing the page."
          isError={true}
        />
      );
    }
    return this.props.children;
  }
}

const TakeQuiz: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClient();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false,
  });

  const [questionOrder, setQuestionOrder] = useState<string[]>([]);

  const showError = useCallback((title: string, message: string) => {
    setModalState({ isOpen: true, title, message, isError: true });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setModalState({ isOpen: true, title, message, isError: false });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    if (!timeLeft || quizSubmitted || !quiz?.duration_minutes) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return null;
        const newTime = prev - 1;
        if (newTime === 300) {
          showError("Time Warning", "5 minutes remaining");
        }
        return newTime > 0 ? newTime : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted, quiz?.duration_minutes]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const validateQuestionOptions = useCallback(
    (question: BaseQuestion): string[] | null => {
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
        case "drag-drop":
          return null;

        default:
          console.warn(`Unexpected question type: ${question.type}`);
          return null;
      }
    },
    []
  );

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string" || isSubmitting || quizSubmitted)
      return;

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Authentication error");

      // Process answers while maintaining the original question order
      const processedAnswers = Object.entries(answers).reduce<
        Record<string, any>
      >((acc, [qId, answer]) => {
        const question = quiz.questions.find((q) => q.id === qId);
        if (!question) return acc;

        let processedAnswer = answer;
        try {
          if (
            typeof answer === "string" &&
            (question.type === "multiple-selection" ||
              question.type === "drag-drop")
          ) {
            processedAnswer = JSON.parse(answer);
          }
        } catch (e) {
          console.error("Error processing answer:", e);
        }

        return { ...acc, [qId]: processedAnswer };
      }, {});

      // Calculate score using the stored question order
      const score = questionOrder.reduce((acc, qId) => {
        const question = quiz.questions.find((q) => q.id === qId);
        if (!question) return acc;

        const processedAnswer = processedAnswers[qId];
        let isCorrect = false;

        switch (question.type) {
          case "multiple-selection":
            const correctAnswers = Array.isArray(
              question.multiple_correct_answers
            )
              ? question.multiple_correct_answers
              : typeof question.multiple_correct_answers === "string" &&
                question.multiple_correct_answers
              ? safeJSONParse(question.multiple_correct_answers) || []
              : [];
            isCorrect =
              JSON.stringify(processedAnswer?.sort()) ===
              JSON.stringify(correctAnswers.sort());
            break;

          case "drag-drop":
            const correctDragAnswers = question.dragDropAnswers || [];
            const studentDragAnswers = Array.isArray(processedAnswer)
              ? processedAnswer
              : typeof processedAnswer === "string"
              ? JSON.parse(processedAnswer)
              : [];
            isCorrect =
              JSON.stringify(studentDragAnswers) ===
              JSON.stringify(correctDragAnswers);
            break;

          default:
            isCorrect =
              String(processedAnswer).toLowerCase() ===
              String(question.correct_answer).toLowerCase();
        }

        return acc + (isCorrect ? 1 : 0);
      }, 0);

      const { error: submissionError } = await supabase
        .from("quiz_submissions")
        .insert({
          student_id: user.id,
          quiz_id: id,
          answers: processedAnswers,
          score: Math.round((score / quiz.questions.length) * 100),
          total_questions: quiz.questions.length,
          correct_answers: score,
        });

      if (submissionError) throw submissionError;

      setQuizSubmitted(true);
      showSuccess("Success", "Quiz submitted successfully");
      setTimeout(() => router.push("/stdinbox"), 1500);
    } catch (error) {
      showError(
        "Error",
        `Failed to submit quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleTimeoutRedirect = useCallback(() => {
    router.push("/stdinbox");
  }, [router]);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (typeof id !== "string") return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Authentication error");

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
              questions (*)
            `
            )
            .eq("id", id)
            .single(),
        ]);

        if (studentData.error || quizData.error)
          throw new Error("Failed to fetch data");

        setStudentInfo({
          name: studentData.data.name,
          id: studentData.data.student_id,
        });

        const validatedQuestions = quizData.data.questions.map(
          (q: BaseQuestion) => ({
            ...q,
            options: validateQuestionOptions(q),
            dragDropAnswers:
              q.type === "drag-drop" ? q.drag_drop_answers || [] : undefined,
            dragDropText:
              q.type === "drag-drop" ? q.drag_drop_text || [] : undefined,
          })
        );

        // If randomize_arrangement is true, shuffle the questions
        const finalQuestions = quizData.data.randomize_arrangement
          ? shuffleArray(validatedQuestions)
          : validatedQuestions;

        // Store the question order for submission
        setQuestionOrder(finalQuestions.map((q) => q.id));

        setQuiz({
          ...quizData.data,
          questions: finalQuestions,
        });

        if (quizData.data.duration_minutes) {
          setTimeLeft(quizData.data.duration_minutes * 60);
        }
      } catch (error) {
        showError(
          "Error",
          `Failed to load quiz: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id, validateQuestionOptions]);

  const handleAnswer = useCallback((questionId: string, answer: AnswerType) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]:
        typeof answer === "string" ? answer : JSON.stringify(answer),
    }));
  }, []);

  const handleNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (!quiz) return;

      const newIndex =
        direction === "next"
          ? currentQuestionIndex + 1
          : currentQuestionIndex - 1;

      if (newIndex >= 0 && newIndex < quiz.questions.length) {
        setCurrentQuestionIndex(newIndex);
      }
    },
    [quiz, currentQuestionIndex]
  );

  const renderQuestionOptions = (question: BaseQuestion) => {
    const enhancedQuestion = {
      ...question,
      options:
        typeof question.options === "string"
          ? safeJSONParse(question.options)
          : question.options,
      multiple_correct_answers: Array.isArray(question.multiple_correct_answers)
        ? question.multiple_correct_answers
        : [],
    };

    let currentAnswer: AnswerType = answers[question.id] || "";
    if (
      typeof currentAnswer === "string" &&
      (question.type === "multiple-selection" || question.type === "drag-drop")
    ) {
      try {
        currentAnswer = currentAnswer ? JSON.parse(currentAnswer) : [];
      } catch (e) {
        console.error("Error parsing answer:", e);
        currentAnswer = [];
      }
    }

    const commonProps = {
      question: enhancedQuestion,
      answers: { ...answers, [question.id]: currentAnswer } as Answers,
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
      case "drag-drop":
        return <DragDrop {...commonProps} />;
      default:
        console.error(`Unexpected question type: ${question.type}`);
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const QuizContent = () => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!quiz) return null;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Mobile-optimized header */}
        <header className="bg-white shadow-sm p-3 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-800 truncate max-w-[200px]">
                {quiz.title}
              </h1>
              <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-2">
                <span>{studentInfo.name}</span>
                <span>•</span>
                <span>{studentInfo.id}</span>
              </div>
            </div>
            {timeLeft !== null && (
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  timeLeft < 300
                    ? "bg-red-100 text-red-700"
                    : timeLeft < 600
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </header>

        {/* Question navigation */}
        <div className="bg-white border-b p-2 sticky top-[4.5rem] z-10">
          <div className="overflow-auto scrollbar-hide">
            <div className="flex gap-2 min-w-min px-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    h-8 min-w-[2rem] px-2 rounded-full flex items-center justify-center
                    text-sm font-medium transition-colors
                    ${
                      index === currentQuestionIndex
                        ? "bg-blue-500 text-white"
                        : answers[quiz.questions[index].id]
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question content */}
        <main className="flex-1 p-4 pb-24">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </h2>
              <p className="mt-3 text-gray-900">
                {quiz.questions[currentQuestionIndex].text}
              </p>
            </div>

            <div className="p-4">
              {renderQuestionOptions(quiz.questions[currentQuestionIndex])}
            </div>
          </div>
        </main>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center justify-between gap-3">
          <button
            onClick={() => handleNavigation("prev")}
            disabled={currentQuestionIndex === 0}
            className="p-2 rounded-lg disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center text-sm font-medium text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("next")}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Error:", error, errorInfo);
        showError(
          "Error",
          "An unexpected error occurred. Please refresh the page."
        );
      }}
    >
      {modalState.isOpen && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          message={modalState.message}
          isError={modalState.isError}
        />
      )}

      {showConfirmation && (
        <Modal
          isOpen={true}
          onClose={() => setShowConfirmation(false)}
          title="Submit Quiz?"
          message="Are you sure you want to submit? This cannot be undone."
        >
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-blue-500 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </Modal>
      )}

      <TimeoutModal
        isOpen={showTimeoutModal}
        onClose={() => setShowTimeoutModal(false)}
        onRedirect={handleTimeoutRedirect}
      />

      {quiz && !showTimeoutModal && !quizSubmitted && (
        <div className="min-h-screen bg-gray-50">
          {quiz.strict_mode ? (
            <ExamSecurityWrapper
              quizId={id as string}
              teacherId={quiz.teacher_id}
              studentName={studentInfo.name}
              quizTitle={quiz.title}
              strictMode={quiz.strict_mode}
            >
              <DeviceControl strictMode={quiz.strict_mode}>
                <QuizContent />
              </DeviceControl>
            </ExamSecurityWrapper>
          ) : (
            <DeviceControl strictMode={quiz.strict_mode}>
              <QuizContent />
            </DeviceControl>
          )}
        </div>
      )}
    </ErrorBoundary>
  );
};

export default TakeQuiz;
