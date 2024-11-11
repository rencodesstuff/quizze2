import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core';
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

// Drag and Drop Components
const DraggableAnswer: React.FC<{ id: string; answer: string }> = ({ id, answer }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: answer,
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex items-center p-3 bg-blue-100 rounded-lg cursor-grab shadow-sm hover:shadow-md border border-blue-200 touch-none select-none"
    >
      <span className="text-blue-800">{answer}</span>
    </div>
  );
};

const DroppableBlank: React.FC<{ index: number; value: string }> = ({ index, value }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `blank-${index}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`inline-flex min-w-[120px] h-8 mx-2 items-center justify-center rounded-md px-3 
        ${isOver ? 'bg-blue-200 border-blue-400' : 
          value ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} 
        border-2 border-dashed transition-colors duration-200`}
    >
      {value ? (
        <span className="text-blue-800">{value}</span>
      ) : (
        <span className="text-gray-400">Drop here</span>
      )}
    </div>
  );
};

// Question Type Components
export const DragDrop: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation
}) => {
  const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
  
  // Initialize on mount
  useEffect(() => {
    const blankCount = (question.text.match(/\[answer\]/g) || []).length;
    const initialAnswers = new Array(blankCount).fill('');
    setCurrentAnswers(initialAnswers);
    handleAnswer(question.id, initialAnswers);
  }, [question.id, question.text, handleAnswer]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedAnswer = active.id as string;
    const targetId = over.id as string;

    if (targetId.startsWith('blank-')) {
      const blankIndex = parseInt(targetId.split('-')[1], 10);
      const newAnswers = [...currentAnswers];
      
      // Remove answer from previous position if it exists
      const oldIndex = newAnswers.findIndex(a => a === draggedAnswer);
      if (oldIndex !== -1) {
        newAnswers[oldIndex] = '';
      }

      // Place answer in new position
      newAnswers[blankIndex] = draggedAnswer;
      
      setCurrentAnswers(newAnswers);
      handleAnswer(question.id, newAnswers);
    }
  };

  const renderAnswerCard = ({ id, text }: { id: string; text: string }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: text
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: isDragging ? 1000 : 1,
      opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className="cursor-grab rounded-lg bg-blue-100 p-3 shadow-sm hover:shadow-md border border-blue-200 
                   text-blue-800 select-none touch-none transition-shadow"
      >
        {text}
      </div>
    );
  };

  const renderDropSlot = (index: number) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `blank-${index}`,
    });

    const value = currentAnswers[index] || '';

    return (
      <div
        ref={setNodeRef}
        className={`
          inline-flex min-w-[120px] h-10 mx-2 items-center justify-center 
          rounded-md px-3 border-2 border-dashed transition-colors duration-200
          ${isOver ? 'bg-blue-100 border-blue-400' : 
            value ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}
        `}
      >
        {value ? (
          <span className="text-blue-800 font-medium">{value}</span>
        ) : (
          <span className="text-gray-400">Drop answer here</span>
        )}
      </div>
    );
  };

  const availableAnswers = useMemo(() => {
    const answers = question.drag_drop_answers || [];
    return answers.filter(answer => !currentAnswers.includes(answer));
  }, [question.drag_drop_answers, currentAnswers]);

  return (
    <div className="space-y-6">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question"
            width={400}
            height={300}
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {/* Question text with drop zones */}
          <div className="text-lg text-gray-700 bg-white p-6 rounded-lg border border-gray-200 leading-relaxed">
            {question.text.split('[answer]').map((segment, index, array) => (
              <React.Fragment key={index}>
                {segment}
                {index < array.length - 1 && renderDropSlot(index)}
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
                <div key={answer}>
                  {renderAnswerCard({ id: answer, text: answer })}
                </div>
              ))}
              {availableAnswers.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  All answers have been placed
                </p>
              )}
            </div>
          </div>
        </div>
      </DndContext>

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
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