import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  useDraggable,
  closestCenter
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface QuestionProps {
  question: {
    id: string;
    text: string;
    type: string;
    options?: string[] | null;
    image_url?: string;
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

const DraggableAnswer = ({ id, answer }: { id: string; answer: string }) => {
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

const DroppableBlank = ({ index, value }: { index: number; value: string }) => {
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

export const DragDrop: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const availableAnswers = useMemo(() => {
    return question.drag_drop_answers || question.dragDropAnswers || [];
  }, [question.drag_drop_answers, question.dragDropAnswers]);

  
  // Initialize currentAnswers with dragDropAnswers
  useEffect(() => {
    if (!answers[question.id] && question.dragDropAnswers) {
      handleAnswer(question.id, question.dragDropAnswers);
    }
  }, [question.dragDropAnswers, question.id, answers, handleAnswer]);

  // Parse the current answers safely
  const currentAnswers = useMemo(() => {
    const answer = answers[question.id];
    if (!answer) return new Array(question.drag_drop_text?.length || 0).fill('');
    try {
      return typeof answer === 'string' ? JSON.parse(answer) : answer;
    } catch {
      return new Array(question.drag_drop_text?.length || 0).fill('');
    }
  }, [answers, question.id, question.drag_drop_text?.length]);

  const textSegments = useMemo(() => {
    return question.drag_drop_text || question.dragDropText || [];
  }, [question.drag_drop_text, question.dragDropText]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const answer = active.id as string;
    const targetId = over.id as string;

    if (targetId.startsWith('blank-')) {
      const blankIndex = parseInt(targetId.split('-')[1]);
      const newAnswers = [...currentAnswers];
      
      // Remove the answer from its previous position if it exists
      const oldIndex = newAnswers.indexOf(answer);
      if (oldIndex !== -1) {
        newAnswers[oldIndex] = '';
      }
      
      // Place the answer in the new position
      newAnswers[blankIndex] = answer;
      
      handleAnswer(question.id, newAnswers);
    }
  };

  const unusedAnswers = useMemo(() => {
    return availableAnswers.filter(answer => !currentAnswers.includes(answer));
  }, [availableAnswers, currentAnswers]);

  return (
    <div className="space-y-6">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {/* Question Text with Blanks */}
          <div className="text-lg text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
            {textSegments.map((segment, index) => (
              <React.Fragment key={index}>
                {segment}
                {index < textSegments.length - 1 && (
                  <DroppableBlank 
                    index={index} 
                    value={currentAnswers[index] || ''}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Available Answers */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Answers:
            </h3>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {unusedAnswers.map((answer) => (
                <DraggableAnswer 
                  key={answer}
                  id={answer}
                  answer={answer}
                />
              ))}
              {unusedAnswers.length === 0 && (
                <p className="text-sm text-gray-500 italic">All answers have been used</p>
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
  if (!question.options || question.options.length === 0) {
    return (
      <p className="text-red-500">No options available for this question.</p>
    );
  }

  return (
    <div className="space-y-4">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}

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

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span>{" "}
            {question.explanation}
          </p>
        </div>
      )}
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
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}

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

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span>{" "}
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export const ShortAnswer: React.FC<QuestionProps> = ({
  question,
  answers,
  handleAnswer,
  showExplanation,
}) => {
  const [localValue, setLocalValue] = useState(answers[question.id] || "");

  useEffect(() => {
    setLocalValue(answers[question.id] || "");
  }, [answers, question.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    handleAnswer(question.id, newValue);
  };

  return (
    <div>
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}

      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={4}
        value={localValue}
        onChange={handleChange}
        placeholder="Type your answer here..."
      />

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span>{" "}
            {question.explanation}
          </p>
        </div>
      )}
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

  const handleCheckboxChange = (option: string) => {
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    handleAnswer(question.id, newAnswers);
  };

  if (!question.options || question.options.length === 0) {
    return (
      <p className="text-red-500">No options available for this question.</p>
    );
  }

  return (
    <div className="space-y-4">
      {question.image_url && (
        <div className="mb-4">
          <Image
            src={question.image_url}
            alt="Question image"
            width={400}
            height={300}
            className="rounded-lg"
            objectFit="contain"
          />
        </div>
      )}

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

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Explanation:</span>{" "}
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

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
        const answers =
          typeof answer === "string" ? JSON.parse(answer) : answer;
        if (!Array.isArray(answers)) return false;
        if (questionType === "drag-drop") {
          // For drag-drop, consider it complete only if all blanks are filled
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
        const selections =
          typeof answer === "string" ? JSON.parse(answer) : answer;
        return Array.isArray(selections)
          ? selections.join(", ")
          : String(answer);

      case "drag-drop":
        const answers =
          typeof answer === "string" ? JSON.parse(answer) : answer;
        return Array.isArray(answers) ? answers.join(" → ") : String(answer);

      default:
        return String(answer);
    }
  } catch (e) {
    console.error("Error formatting answer:", e);
    return String(answer);
  }
};

export type { QuestionProps };

// Helper to validate drag-drop answers
export const validateDragDropAnswer = (
  userAnswers: string[],
  correctAnswers: string[]
): boolean => {
  if (!Array.isArray(userAnswers) || !Array.isArray(correctAnswers))
    return false;
  if (userAnswers.length !== correctAnswers.length) return false;

  return userAnswers.every(
    (answer, index) =>
      answer.toLowerCase() === correctAnswers[index].toLowerCase()
  );
};
// Custom hook for handling drag-drop state
export const useDragDropState = (
  initialAnswers: string[] = [],
  onChange?: (answers: string[]) => void
) => {
  const [answers, setAnswers] = useState<string[]>(initialAnswers);

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

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
