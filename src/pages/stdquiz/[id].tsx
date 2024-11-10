// pages/stdquiz/[id].tsx
import React, { useState, useEffect, ErrorInfo, ReactNode, useCallback } from "react";
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
  DragDrop,
} from "@/comps/QuestionTypes";
import Modal from "@/comps/Modal";
import ExamSecurityWrapper from "@/comps/ExamSecurity";

// Type definitions for quiz components
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

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isError: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
  children?: React.ReactNode; // Added this line to accept children
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
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [hasAnimatedModal, setHasAnimatedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Modal states
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    isError: false,
  });
  const [confirmationModal, setConfirmationModal] = useState<ModalState>({
    isOpen: false,
    title: "Confirm Submission",
    message: "Are you sure you want to submit your quiz?",
    isError: false,
  });

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

  // Hash function for randomization
  const hashCode = useCallback((str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }, []);

  // Shuffle array with seed
  const shuffleArray = useCallback(<T,>(array: T[], seed: number): T[] => {
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
  }, []);

  // Handle error from error boundary
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    showError(
      "System Error",
      "An unexpected error occurred. Please try refreshing the page."
    );
    console.error("Error caught by boundary:", error, errorInfo);
  }, [showError]);

  useEffect(() => {
    const fetchQuizAndStudentInfo = async () => {
      if (typeof id !== "string") {
        showError("Invalid Quiz", "Invalid quiz ID. Please try again.");
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

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
            .select(
              `
              id, title, duration_minutes, release_date, 
              randomize_arrangement, strict_mode, teacher_id,
              questions (id, type, text, options, correct_answer, image_url,
                      explanation, multiple_correct_answers, drag_drop_text, drag_drop_answers)
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
            dragDropAnswers:
              q.type === "drag-drop" ? q.drag_drop_answers || [] : undefined,
            dragDropText:
              q.type === "drag-drop" ? q.drag_drop_text || [] : undefined,
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

        const initialAnswers: Answers = {};
        setAnswers(initialAnswers);
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

    fetchQuizAndStudentInfo();
  }, [id, supabase, hashCode, shuffleArray, showError]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizSubmitted) return;

    const timer = setInterval(
      () => setTimeLeft((prev) => {
        if (prev !== null && prev > 0) {
          const newTime = prev - 1;
          if (newTime === 300) { // 5 minutes warning
            showError(
              "Time Warning",
              "You have 5 minutes remaining to complete the quiz."
            );
          }
          return newTime;
        }
        return 0;
      }),
      1000
    );

    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted, showError]);

  const validateQuestionOptions = useCallback((question: BaseQuestion): string[] | null => {
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
  }, []);

  const handleAnswer = useCallback((questionId: string, answer: AnswerType) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]:
        typeof answer === "string" ? answer : JSON.stringify(answer),
    }));
  }, []);

  const handleNavigation = useCallback((direction: "next" | "prev") => {
    if (!quiz) return;
    const newIndex =
      direction === "next"
        ? currentQuestionIndex + 1
        : currentQuestionIndex - 1;
    if (newIndex >= 0 && newIndex < quiz.questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  }, [quiz, currentQuestionIndex]);

  const handleSubmitQuiz = async () => {
    if (!quiz || typeof id !== "string") {
      showError("Submission Error", "Unable to submit quiz. Please try again.");
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
              (question.type === "multiple-selection" ||
                question.type === "drag-drop")
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
              : typeof q.multiple_correct_answers === "string" &&
                q.multiple_correct_answers
              ? safeJSONParse(q.multiple_correct_answers) || []
              : [];
            isCorrect =
              JSON.stringify(processedAnswer?.sort()) ===
              JSON.stringify(correctAnswers.sort());
            break;

          case "drag-drop":
            const correctDragAnswers = q.dragDropAnswers || [];
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
              String(q.correct_answer).toLowerCase();
        }

        return acc + (isCorrect ? 1 : 0);
      }, 0);

      // Submit to database
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

      if (submissionError) throw new Error("Failed to submit quiz");

      showSuccess(
        "Submission Successful",
        "Your quiz has been submitted successfully!"
      );
      setQuizSubmitted(true);
      
      // Delay redirect to show success message
      setTimeout(() => {
        router.push(`/stdinbox`);
      }, 2000);
    } catch (error) {
      showError(
        "Submission Error",
        `Failed to submit quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render functions...
// Render functions for quiz page
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

    case "drag-drop":
      return <DragDrop {...commonProps} />;

    default:
      showError(
        "Question Error",
        `Unexpected question type: ${question.type}`
      );
      return null;
  }
};

const formatAnswer = (question: BaseQuestion, answer: any): string => {
  try {
    if (
      typeof answer === "string" &&
      (question.type === "multiple-selection" || question.type === "drag-drop")
    ) {
      const parsed = JSON.parse(answer);
      return Array.isArray(parsed) ? parsed.join(", ") : answer;
    }
    return String(answer);
  } catch (e) {
    console.error("Error formatting answer:", e);
    return String(answer);
  }
};

const renderAnswerReview = (question: BaseQuestion, index: number) => {
  const answer = answers[question.id];
  const formattedAnswer = answer ? formatAnswer(question, answer) : "Not answered";

  return (
    <div key={question.id} className="p-4 bg-gray-50 rounded-lg mb-4">
      <p className="font-semibold">Question {index + 1}: {question.text}</p>
      <p className={`mt-2 ${answer ? "text-blue-600" : "text-yellow-600"}`}>
        Your answer: {formattedAnswer}
      </p>
    </div>
  );
};

const renderConfirmationContent = () => {
  if (!quiz) return null;

  const answeredQuestions = quiz.questions.filter(q => q.id in answers && answers[q.id] !== "");
  const unansweredQuestions = quiz.questions.filter(q => !(q.id in answers) || answers[q.id] === "");

  return (
    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div className="mb-4">
        <p className="font-semibold text-lg mb-2">Quiz Summary:</p>
        <p>Total Questions: {quiz.questions.length}</p>
        <p className="text-green-600">Answered: {answeredQuestions.length}</p>
        <p className="text-yellow-600">Unanswered: {unansweredQuestions.length}</p>
      </div>

      {unansweredQuestions.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="font-semibold text-yellow-700">Warning:</p>
          <p className="text-yellow-600">
            You have {unansweredQuestions.length} unanswered {
              unansweredQuestions.length === 1 ? "question" : "questions"
            }. Are you sure you want to submit?
          </p>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold mb-2">Your Answers:</p>
        {quiz.questions.map((question, index) => 
          renderAnswerReview(question, index)
        )}
      </div>
    </div>
  );
};

const renderTimeRemaining = () => {
  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const timeClass = minutes < 5 
    ? "text-red-600"
    : minutes < 10 
      ? "text-yellow-600" 
      : "text-blue-600";

  return (
    <p className={`text-sm font-bold ${timeClass}`}>
      Time remaining: {minutes}:{seconds.toString().padStart(2, "0")}
    </p>
  );
};

const renderQuestionNavigation = () => {
  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const currentProgress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        <span>{Math.round(currentProgress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
    </div>
  );
};

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  isError = false,
  children 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={`text-2xl font-bold mb-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>{title}</h2>
          <p className="mb-4">{message}</p>
          {children} {/* Added this line to render children */}
          {!children && ( // Only show default button if no children are provided
            <button
              onClick={onClose}
              className={`w-full mt-4 px-4 py-2 rounded-md text-white transition duration-200 ${
                isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Close
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const isAnswerEmpty = (answer: AnswerType): boolean => {
  if (!answer) return true;
  if (typeof answer === "string") {
    try {
      const parsedAnswer = JSON.parse(answer);
      if (Array.isArray(parsedAnswer)) {
        return parsedAnswer.length === 0;
      }
      return answer.trim() === "";
    } catch {
      return answer.trim() === "";
    }
  }
  if (Array.isArray(answer)) return answer.length === 0;
  return true;
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Return statement with error boundary
  return (
<ErrorBoundary onError={handleError}>
      {modalState.isOpen && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          message={modalState.message}
          isError={modalState.isError}
        />
      )}

      {confirmationModal.isOpen && (
        <Modal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          title="Confirm Submission"
          message="Are you sure you want to submit your quiz? Make sure you have reviewed all your answers."
          isError={false}
        >
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </button>
          </div>
        </Modal>
      )}

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

  function QuizContent() {
    return (
      <>
        <header className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{quiz?.title}</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">{studentInfo.name}</p>
              <p className="text-sm text-gray-600">ID: {studentInfo.id}</p>
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
                    {isAnswered && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
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
                className="bg-white shadow-xl rounded-lg p-8"
              >
                <h2 className="text-xl font-bold mb-4">
                  Question {currentQuestionIndex + 1} of {quiz?.questions.length}
                </h2>
                
                {quiz?.questions[currentQuestionIndex] && (
                  <>
                    <p className="text-lg mb-6">
                      {quiz.questions[currentQuestionIndex].text}
                    </p>

                    {quiz.questions[currentQuestionIndex].image_url && (
                      <div className="mb-6">
                        <Image
                          src={quiz.questions[currentQuestionIndex].image_url}
                          alt={`Question ${currentQuestionIndex + 1} image`}
                          width={400}
                          height={300}
                          objectFit="contain"
                        />
                      </div>
                    )}

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
                          onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: true }))}
                          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-150"
                        >
                          Submit Quiz
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
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </>
    );
  }
};

export default TakeQuiz;