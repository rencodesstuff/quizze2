import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/ui/card';

// Type definitions that match your main quiz file
export type QuestionType = 
  | "multiple-choice"
  | "true-false" 
  | "short-answer"
  | "multiple-selection"
  | "drag-drop";

export interface BaseQuestion {
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
}

export interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string;
  questions: BaseQuestion[];
  randomize_arrangement: boolean;
  strict_mode: boolean;
  teacher_id: string;
}

interface StudentInfo {
  name: string;
  id: string;
}

type AnswerType = string | string[];

interface Answers {
  [questionId: string]: AnswerType;
}

interface QuizContentProps {
  quiz: Quiz;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answers: Answers;
  timeLeft: number | null;
  studentInfo: StudentInfo;
  handleNavigation: (direction: "next" | "prev") => void;
  setShowConfirmation: (show: boolean) => void;
  isSubmitting: boolean;
  quizSubmitted: boolean;
  renderQuestionOptions: (question: BaseQuestion) => React.ReactNode;
}

const QuizContent: React.FC<QuizContentProps> = ({ 
  quiz, 
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  timeLeft,
  studentInfo,
  handleNavigation,
  setShowConfirmation,
  isSubmitting,
  quizSubmitted,
  renderQuestionOptions 
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-bold text-gray-800 truncate">{quiz?.title}</h1>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{studentInfo.name}</p>
              {timeLeft !== null && (
                <div className={`flex items-center text-sm font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 
                  timeLeft < 600 ? 'text-yellow-600' : 
                  'text-blue-600'
                }`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Question Navigation Drawer */}
      {showSidebar && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Questions</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {quiz?.questions.map((q: BaseQuestion, index: number) => {
                const isAnswered = q.id in answers && answers[q.id] !== "";
                
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center justify-between ${
                      index === currentQuestionIndex
                        ? "bg-blue-500 text-white"
                        : isAnswered
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <span>Question {index + 1}</span>
                    {isAnswered && <CheckCircle className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-1/4 max-w-xs bg-white shadow-xl p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Questions</h2>
        <div className="space-y-2">
          {quiz?.questions.map((q: BaseQuestion, index: number) => {
            const isAnswered = q.id in answers && answers[q.id] !== "";
            
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center justify-between ${
                  index === currentQuestionIndex
                    ? "bg-blue-500 text-white"
                    : isAnswered
                    ? "bg-green-100 hover:bg-green-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span>Question {index + 1}</span>
                {isAnswered && <CheckCircle className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-1/4 p-4">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-4">
            <CardContent className="p-6">
              {quiz?.questions[currentQuestionIndex] && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">
                      Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </h2>
                    <p className="text-lg">{quiz.questions[currentQuestionIndex].text}</p>
                  </div>

                  {renderQuestionOptions(quiz.questions[currentQuestionIndex])}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6 gap-4">
                    <button
                      onClick={() => handleNavigation("prev")}
                      disabled={currentQuestionIndex === 0}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <button
                        onClick={() => setShowConfirmation(true)}
                        disabled={isSubmitting || quizSubmitted}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Submit Quiz
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigation("next")}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 flex items-center justify-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ 
            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default QuizContent;