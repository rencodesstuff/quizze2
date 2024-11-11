// pages/stdquiz/[id].tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
  dragDropText?: string[];
  dragDropAnswers?: string[];
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
  children?: React.ReactNode;
}

// Helper function to safely parse JSON
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

// Simple Modal Component
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 ${isError ? "text-red-600" : "text-green-600"}`}>
          {title}
        </h2>
        <p className="mb-4">{message}</p>
        {children || (
          <button
            onClick={onClose}
            className={`w-full mt-4 px-4 py-2 rounded-md text-white transition duration-200 ${
              isError ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error, errorInfo: React.ErrorInfo) => void }) {
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

// Main Quiz Component
const TakeQuiz: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClient();

  // State declarations
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    isError: false
  });

  // Modal handlers
  const showError = useCallback((title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isError: true,
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isError: false,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Question options validation
  const validateQuestionOptions = useCallback((question: BaseQuestion): string[] | null => {
    let parsedOptions = question.options;

    if (typeof question.options === "string") {
      parsedOptions = safeJSONParse(question.options);
    }

    switch (question.type) {
      case "multiple-choice":
      case "multiple-selection":
        if (Array.isArray(parsedOptions) && parsedOptions.every(opt => typeof opt === "string")) {
          return parsedOptions.map(opt => opt.trim());
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
  }, []);

  // Quiz submission handler
  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string" || isSubmitting || quizSubmitted) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("Authentication error during submission");
      if (!user) throw new Error("No authenticated user found");

      const processedAnswers = Object.entries(answers).reduce<Record<string, any>>(
        (acc, [qId, answer]) => {
          const question = quiz.questions.find((q) => q.id === qId);
          if (!question) return acc;

          let processedAnswer = answer;
          try {
            if (
              typeof answer === "string" &&
              (question.type === "multiple-selection" || question.type === "drag-drop")
            ) {
              processedAnswer = JSON.parse(answer);
            }
          } catch (e) {
            console.error("Error processing answer:", e);
          }

          return { ...acc, [qId]: processedAnswer };
        },
        {}
      );

      // Calculate score
      const score = quiz.questions.reduce((acc, q) => {
        const processedAnswer = processedAnswers[q.id];
        let isCorrect = false;

        switch (q.type) {
          case "multiple-selection":
            const correctAnswers = Array.isArray(q.multiple_correct_answers)
              ? q.multiple_correct_answers
              : typeof q.multiple_correct_answers === "string" && q.multiple_correct_answers
              ? safeJSONParse(q.multiple_correct_answers) || []
              : [];
            isCorrect =
              JSON.stringify(processedAnswer?.sort()) === JSON.stringify(correctAnswers.sort());
            break;

          case "drag-drop":
            const correctDragAnswers = q.dragDropAnswers || [];
            const studentDragAnswers = Array.isArray(processedAnswer)
              ? processedAnswer
              : typeof processedAnswer === "string"
              ? JSON.parse(processedAnswer)
              : [];
            isCorrect =
              JSON.stringify(studentDragAnswers) === JSON.stringify(correctDragAnswers);
            break;

          default:
            isCorrect =
              String(processedAnswer).toLowerCase() === String(q.correct_answer).toLowerCase();
        }

        return acc + (isCorrect ? 1 : 0);
      }, 0);

      const { error: submissionError } = await supabase.from("quiz_submissions").insert({
        student_id: user.id,
        quiz_id: id,
        answers: processedAnswers,
        score: Math.round((score / quiz.questions.length) * 100),
        total_questions: quiz.questions.length,
        correct_answers: score,
      });

      if (submissionError) throw new Error("Failed to submit quiz");

      setQuizSubmitted(true);
      showSuccess("Submission Successful", "Your quiz has been submitted successfully!");

      // Delay redirect
      setTimeout(() => {
        router.push("/stdinbox");
      }, 2000);
    } catch (error) {
      showError(
        "Submission Error",
        `Failed to submit quiz: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  // Quiz data fetching
  useEffect(() => {
    const fetchQuizData = async () => {
      if (typeof id !== "string") {
        showError("Invalid Quiz", "Invalid quiz ID. Please try again.");
        return;
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error("Authentication error");
        if (!user) throw new Error("No authenticated user found");

        const [studentData, quizData] = await Promise.all([
          supabase
            .from("students")
            .select("name, student_id")
            .eq("id", user.id)
            .single(),
          supabase
            .from("quizzes")
            .select(`
              id, title, duration_minutes, release_date, 
              randomize_arrangement, strict_mode, teacher_id,
              questions (id, type, text, options, correct_answer, image_url,
                      explanation, multiple_correct_answers, drag_drop_text, drag_drop_answers)
            `)
            .eq("id", id)
            .single(),
        ]);

        if (studentData.error) throw new Error("Error fetching student data");
        if (quizData.error) throw new Error("Error fetching quiz data");

        setStudentInfo({
          name: studentData.data.name,
          id: studentData.data.student_id,
        });

        let validatedQuestions = quizData.data.questions.map((q: BaseQuestion) => ({
          ...q,
          options: validateQuestionOptions(q),
          dragDropAnswers: q.type === "drag-drop" ? q.drag_drop_answers || [] : undefined,
          dragDropText: q.type === "drag-drop" ? q.drag_drop_text || [] : undefined,
        }));

        setQuiz({
          ...quizData.data,
          questions: validatedQuestions,
        });
        setTimeLeft(quizData.data.duration_minutes * 60);
        setAnswers({});
      } catch (error) {
        showError(
          "Loading Error",
          `An error occurred while loading the quiz: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id, supabase, showError, validateQuestionOptions]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev > 0) {
          const newTime = prev - 1;
          if (newTime === 300) {
            showError(
              "Time Warning",
              "You have 5 minutes remaining to complete the quiz."
            );
          }
          return newTime;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted, showError]);

  // Answer handling
  const handleAnswer = useCallback((questionId: string, answer: AnswerType) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: typeof answer === "string" ? answer : JSON.stringify(answer),
    }));
  }, []);

  // Navigation handling
  const handleNavigation = useCallback((direction: "next" | "prev") => {
    if (!quiz) return;
    
    const newIndex = direction === "next" 
      ? currentQuestionIndex + 1 
      : currentQuestionIndex - 1;
      
    if (newIndex >= 0 && newIndex < quiz.questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  }, [quiz, currentQuestionIndex]);

  // Question rendering
  const renderQuestionOptions = (question: BaseQuestion) => {
    const enhancedQuestion = {
      ...question,
      options: typeof question.options === "string" 
        ? safeJSONParse(question.options) 
        : question.options,
      multiple_correct_answers: Array.isArray(question.multiple_correct_answers)
        ? question.multiple_correct_answers
        : []
    };

    let currentAnswer: AnswerType = answers[question.id] || "";
    if (typeof currentAnswer === "string" && 
        (question.type === "multiple-selection" || question.type === "drag-drop")) {
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
          <p className="text-red-500">No options available for this question.</p>
        );

      case "true-false":
        return <TrueFalse {...commonProps} />;

        case "short-answer":
          return <ShortAnswer {...commonProps} />;
  
        case "multiple-selection":
          return enhancedQuestion.options ? (
            <MultipleSelection {...commonProps} />
          ) : (
            <p className="text-red-500">No options available for this question.</p>
          );
  
        case "drag-drop":
          return <DragDrop {...commonProps} />;
  
        default:
          console.error(`Unexpected question type: ${question.type}`);
          return null;
      }
    };
  
    // Loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }
  
    // Quiz content component
    const QuizContent = () => {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
  
      return (
        <>
          <header className="bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">{quiz?.title}</h1>
              <div className="text-right">
                <p className="text-sm text-gray-600">{studentInfo.name}</p>
                <p className="text-sm text-gray-600">ID: {studentInfo.id}</p>
                {timeLeft !== null && (
                  <p className={`text-sm font-bold ${
                    timeLeft < 300 ? 'text-red-600' : 
                    timeLeft < 600 ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`}>
                    Time left: {formatTime(timeLeft)}
                  </p>
                )}
              </div>
            </div>
          </header>
  
          <main className="flex-grow flex p-4">
            {/* Question Navigation Sidebar */}
            <div className="w-1/4 bg-white shadow-xl rounded-lg p-4 mr-4 h-fit">
              <h2 className="text-lg font-bold mb-4">Questions</h2>
              <div className="space-y-2">
                {quiz?.questions.map((q, index) => {
                  const isAnswered = q.id in answers && answers[q.id] !== "";
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full text-left p-2 rounded transition-colors duration-200 ${
                        index === currentQuestionIndex
                          ? "bg-blue-500 text-white"
                          : isAnswered
                          ? "bg-green-100 hover:bg-green-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <span>Question {index + 1}</span>
                      {isAnswered && <span className="ml-2 text-green-500">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
  
            {/* Main Question Area */}
            <div className="flex-grow">
              <div className="bg-white shadow-xl rounded-lg p-8">
                {quiz?.questions[currentQuestionIndex] && (
                  <>
                    <h2 className="text-xl font-bold mb-4">
                      Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </h2>
  
                    <p className="text-lg mb-6">
                      {quiz.questions[currentQuestionIndex].text}
                    </p>
  
                    {renderQuestionOptions(quiz.questions[currentQuestionIndex])}
  
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
                          disabled={isSubmitting || quizSubmitted}
                          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-150 disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Quiz"}
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
                  </>
                )}
              </div>
            </div>
          </main>
        </>
      );
    };
  
    // Main render
    return (
      <ErrorBoundary onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
        showError(
          "System Error",
          "An unexpected error occurred. Please try refreshing the page."
        );
      }}>
        {/* Error/Success Modal */}
        {modalState.isOpen && (
          <Modal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={modalState.title}
            message={modalState.message}
            isError={modalState.isError}
          />
        )}
  
        {/* Submission Confirmation Modal */}
        {showConfirmation && (
          <Modal
            isOpen={true}
            onClose={() => setShowConfirmation(false)}
            title="Confirm Submission"
            message="Are you sure you want to submit your quiz? This action cannot be undone."
          >
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </Modal>
        )}
  
        {/* Main Quiz Content */}
        {quiz && (
          <div className="min-h-screen bg-gray-100">
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
          </div>
        )}
      </ErrorBoundary>
    );
  };
  
  export default TakeQuiz;