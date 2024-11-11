import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
// Core interfaces and types
interface QuestionProps {
  question: {
    id: string;
    text: string;
    type: string;
    options?: string[] | null;
    image_url?: string | null;
    explanation?: string;
    correct_answer: string;
    multiple_correct_answers?: string[];
    dragDropText?: string[];
    dragDropAnswers?: string[];
    drag_drop_text?: string[];
    drag_drop_answers?: string[];
  };
  answers: Record<string, any>;
  handleAnswer: (questionId: string, answer: any) => void;
  showExplanation?: boolean;
}

// Utility function to check if an image URL is valid
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObject = new URL(url);
    return Boolean(urlObject);
  } catch {
    return false;
  }
};

// Utility function to load and validate images
const preloadImage = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      resolve(false);
      return;
    }

    const img = document.createElement('img');
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Custom hook for image loading
const useImageLoader = (imageUrl: string | null) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    const loadImage = async () => {
      try {
        const success = await preloadImage(imageUrl);
        setIsLoaded(success);
        setHasError(!success);
      } catch {
        setIsLoaded(false);
        setHasError(true);
      }
    };

    loadImage();
  }, [imageUrl]);

  return { isLoaded, hasError };
};

// Shared Components
const QuestionImage: React.FC<{ imageUrl: string | null }> = ({ imageUrl }) => {
  const [isError, setIsError] = useState(false);
  const { isLoaded, hasError } = useImageLoader(imageUrl);

  if (!imageUrl || isError || hasError || !isLoaded) return null;
  
  return (
    <div className="mb-4">
      <Image
        src={imageUrl}
        alt="Question image"
        width={400}
        height={300}
        className="rounded-lg object-contain mx-auto"
        priority
        onError={() => setIsError(true)}
      />
    </div>
  );
};

const QuestionExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  if (!explanation) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-blue-800">
        <span className="font-semibold">Explanation:</span> {explanation}
      </p>
    </div>
  );
};

export const DragDrop: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation
}) => {
  // Get initial answers from existing answers or create new array
  const initialAnswers = useMemo(() => {
    const blankCount = (question.text.match(/\[answer\]/g) || []).length;
    if (answers[question.id] && Array.isArray(answers[question.id])) {
      return answers[question.id] as string[];
    }
    return new Array(blankCount).fill('') as string[];
  }, [question.id, question.text, answers]);

  // Single useState for all answers
  const [localAnswers, setLocalAnswers] = useState<string[]>(initialAnswers);

  // Handle actual drop
  const onDrop = useCallback((index: number, droppedAnswer: string) => {
    setLocalAnswers((prev: string[]) => {
      const newAnswers = [...prev];
      // Remove from old position
      const oldIndex = newAnswers.findIndex(a => a === droppedAnswer);
      if (oldIndex !== -1) {
        newAnswers[oldIndex] = '';
      }
      // Add to new position
      newAnswers[index] = droppedAnswer;
      handleAnswer(question.id, newAnswers);
      return newAnswers;
    });
  }, [question.id, handleAnswer]);

  // Available answers computation
  const availableAnswers = useMemo(() => {
    const allAnswers = question.drag_drop_answers || [];
    return allAnswers.filter(answer => !localAnswers.includes(answer));
  }, [question.drag_drop_answers, localAnswers]);

  // Draggable answer component
  const DraggableAnswer: React.FC<{ answer: string }> = ({ answer }) => (
    <div
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', answer);
      }}
      className="px-4 py-2 rounded-lg border-2 bg-white border-blue-200 
                 hover:border-blue-300 cursor-grab text-blue-800 font-medium 
                 select-none active:cursor-grabbing"
    >
      {answer}
    </div>
  );

  // Drop zone component
  const DropZone: React.FC<{ index: number; value: string }> = ({ index, value }) => {
    const [isOver, setIsOver] = useState<boolean>(false);

    return (
      <div
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          if (!isOver) setIsOver(true);
        }}
        onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setIsOver(false);
        }}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setIsOver(false);
          const answer = e.dataTransfer.getData('text/plain');
          if (answer) {
            onDrop(index, answer);
          }
        }}
        className={`
          inline-flex min-w-[120px] h-10 mx-2 items-center justify-center
          rounded-lg border-2 border-dashed p-2
          ${isOver 
            ? 'bg-blue-100 border-blue-500' 
            : value 
              ? 'bg-blue-50 border-blue-300' 
              : 'bg-gray-50 border-gray-300'}
          transition-colors duration-200
        `}
      >
        {value ? (
          <span className="text-blue-800 font-medium">{value}</span>
        ) : (
          <span className="text-gray-400">Drop here</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {question.image_url && <QuestionImage imageUrl={question.image_url} />}

      <div className="space-y-8">
        {/* Question text with drop zones */}
        <div className="text-lg text-gray-700 bg-white p-6 rounded-lg border border-gray-200 leading-relaxed">
          {question.text.split('[answer]').map((segment, index, array) => (
            <React.Fragment key={index}>
              {segment}
              {index < array.length - 1 && (
                <DropZone index={index} value={localAnswers[index]} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Available answers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Available Answers:
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableAnswers.map((answer) => (
              <DraggableAnswer key={answer} answer={answer} />
            ))}
            {availableAnswers.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                All answers have been placed
              </p>
            )}
          </div>
        </div>
      </div>

      {showExplanation && <QuestionExplanation explanation={question.explanation || ''} />}
    </div>
  );
};


export const MultipleChoice: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation,
}) => {
  if (!question.options?.length) {
    return <p className="text-red-500">No options available for this question.</p>;
  }

  return (
    <div className="space-y-4">
      {question.image_url && <QuestionImage imageUrl={question.image_url} />}

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
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
        ))}
      </div>

      {showExplanation && <QuestionExplanation explanation={question.explanation || ''} />}
    </div>
  );
};

export const TrueFalse: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation,
}) => {
  return (
    <div className="space-y-4">
      {question.image_url && <QuestionImage imageUrl={question.image_url} />}

      <div className="space-y-2">
        {["True", "False"].map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.toLowerCase()}
              checked={answers[question.id] === option.toLowerCase()}
              onChange={() => handleAnswer(question.id, option.toLowerCase())}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>

      {showExplanation && <QuestionExplanation explanation={question.explanation || ''} />}
    </div>
  );
};

export const ShortAnswer: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback((event: React.FormEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleAnswer(question.id, value);
    }, 100);
  }, [question.id, handleAnswer]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {question.image_url && <QuestionImage imageUrl={question.image_url} />}

      <textarea
        name={`question-${question.id}`}
        defaultValue={answers[question.id] || ''}
        onInput={handleInputChange}
        className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Type your answer here..."
        spellCheck={false}
        autoComplete="off"
      />

      {showExplanation && <QuestionExplanation explanation={question.explanation || ''} />}
    </div>
  );
};

export const MultipleSelection: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation,
}) => {
  const currentAnswers = useMemo(() => {
    const answer = answers[question.id];
    if (!answer) return [];
    try {
      return typeof answer === "string" ? JSON.parse(answer) : answer;
    } catch (e) {
      console.error("Error parsing multiple selection answer:", e);
      return [];
    }
  }, [answers, question.id]);

  const handleCheckboxChange = useCallback((option: string) => {
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    handleAnswer(question.id, newAnswers);
  }, [currentAnswers, handleAnswer, question.id]);

  if (!question.options?.length) {
    return <p className="text-red-500">No options available for this question.</p>;
  }

  return (
    <div className="space-y-4">
      {question.image_url && <QuestionImage imageUrl={question.image_url} />}

      <p className="text-sm text-gray-600 mb-2">Select all that apply:</p>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label
            key={`${question.id}-${index}`}
            className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <input
              type="checkbox"
              checked={currentAnswers.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>

      {showExplanation && <QuestionExplanation explanation={question.explanation || ''} />}
    </div>
  );
};

// Types and Utilities
export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "multiple-selection"
  | "drag-drop";

export const QuestionTypes: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "true-false": "True/False",
  "short-answer": "Short Answer",
  "multiple-selection": "Multiple Selection",
  "drag-drop": "Drag and Drop",
};

export const isAnswerComplete = (
  questionType: QuestionType,
  answer: any
): boolean => {
  if (!answer) return false;

  switch (questionType) {
    case "multiple-choice":
    case "true-false":
    case "short-answer":
      return typeof answer === "string" && answer.trim() !== "";

    case "multiple-selection":
    case "drag-drop":
      try {
        const answers = typeof answer === "string" ? JSON.parse(answer) : answer;
        if (!Array.isArray(answers)) return false;
        if (questionType === "drag-drop") {
          return answers.length > 0 && !answers.includes("");
        }
        return answers.length > 0;
      } catch {
        return false;
      }

    default:
      return false;
  }
};

export const formatAnswer = (
  questionType: QuestionType,
  answer: any
): string => {
  try {
    switch (questionType) {
      case "multiple-choice":
      case "true-false":
      case "short-answer":
        return String(answer);

      case "multiple-selection":
        const selections = typeof answer === "string" ? JSON.parse(answer) : answer;
        return Array.isArray(selections) ? selections.join(", ") : String(answer);

      case "drag-drop":
        const answers = typeof answer === "string" ? JSON.parse(answer) : answer;
        return Array.isArray(answers) ? answers.join(" → ") : String(answer);

      default:
        return String(answer);
    }
  } catch (e) {
    console.error("Error formatting answer:", e);
    return String(answer);
  }
};

// Helper to validate drag-drop answers
export const validateDragDropAnswer = (
  userAnswers: string[],
  correctAnswers: string[]
): boolean => {
  if (!Array.isArray(userAnswers) || !Array.isArray(correctAnswers)) return false;
  if (userAnswers.length !== correctAnswers.length) return false;

  return userAnswers.every(
    (answer, index) => answer.toLowerCase() === correctAnswers[index].toLowerCase()
  );
};

// Custom hook for handling drag-drop state
export const useDragDropState = (
  initialAnswers: string[] = [],
  onChange?: (answers: string[]) => void
) => {
  const [answers, setAnswers] = useState<string[]>(initialAnswers);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      const oldIndex = answers.findIndex((answer) => answer === active.id);
      const newIndex = answers.findIndex((answer) => answer === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newAnswers = Array.from(answers);
      const [movedItem] = newAnswers.splice(oldIndex, 1);
      newAnswers.splice(newIndex, 0, movedItem);

      setAnswers(newAnswers);
      onChange?.(newAnswers);
    } catch (error) {
      console.error("Error in drag and drop:", error);
    }
  }, [answers, onChange]);

  return {
    answers,
    setAnswers,
    handleDragEnd,
  };
};

// Utility function to prepare drag-drop question data
export const prepareDragDropQuestion = (
  text: string,
  answers: string[]
): { dragDropText: string[]; dragDropAnswers: string[] } => {
  const segments = text.split("[blank]");
  return {
    dragDropText: segments,
    dragDropAnswers: answers,
  };
};

// Utility function to shuffle answers for drag-drop questions
export const shuffleAnswers = (answers: string[]): string[] => {
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Create a named object for all exports
const QuestionTypeComponents = {
  MultipleChoice,
  TrueFalse,
  ShortAnswer,
  MultipleSelection,
  DragDrop,
  QuestionTypes,
  isAnswerComplete,
  formatAnswer,
  validateDragDropAnswer,
  useDragDropState,
  prepareDragDropQuestion,
  shuffleAnswers,
  isValidImageUrl,
  preloadImage,
  useImageLoader,
};

// Export individual components and types
export type { QuestionProps };

// Default export
export default QuestionTypeComponents;