// QuestionTypes.tsx
import React from 'react';
import Image from 'next/image';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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
  };
  answers: Record<string, any>;
  handleAnswer: (questionId: string, answer: any) => void;
  showExplanation?: boolean;
}

// Sortable item component for drag and drop
const SortableAnswer = ({ id, answer }: { id: string; answer: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <span className="text-gray-700">{answer}</span>
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

  const currentAnswers = answers[question.id] ? 
    JSON.parse(answers[question.id]) : 
    question.dragDropAnswers || [];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = currentAnswers.indexOf(active.id);
      const newIndex = currentAnswers.indexOf(over.id);

      const newAnswers = [...currentAnswers];
      newAnswers.splice(oldIndex, 1);
      newAnswers.splice(newIndex, 0, active.id);

      handleAnswer(question.id, JSON.stringify(newAnswers));
    }
  };

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

      <div className="text-lg text-gray-700">
        {question.dragDropText?.map((segment, index) => (
          <React.Fragment key={index}>
            {segment}
            {index < (question.dragDropText?.length || 0) - 1 && (
              <span className="mx-2 px-4 py-1 bg-gray-100 rounded-md inline-block">
                Blank #{index + 1}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Drag to reorder your answers:
        </h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={currentAnswers}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {currentAnswers.map((answer: string) => (
                <SortableAnswer key={answer} id={answer} answer={answer} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

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
  showExplanation 
}) => {
  if (!question.options || question.options.length === 0) {
    return <p className="text-red-500">No options available for this question.</p>;
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
            <span className="font-semibold">Explanation:</span> {question.explanation}
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
  showExplanation 
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
            <span className="font-semibold">Explanation:</span> {question.explanation}
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
  showExplanation 
}) => {
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
        value={answers[question.id] || ""}
        onChange={(e) => handleAnswer(question.id, e.target.value)}
        placeholder="Type your answer here..."
      />
      
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

export const MultipleSelection: React.FC<QuestionProps> = ({ 
  question, 
  answers, 
  handleAnswer, 
  showExplanation 
}) => {
  const currentAnswers = typeof answers[question.id] === 'string' 
    ? JSON.parse(answers[question.id] || '[]') 
    : answers[question.id] || [];

  const handleCheckboxChange = (option: string) => {
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    handleAnswer(question.id, newAnswers);
  };

  if (!question.options || question.options.length === 0) {
    return <p className="text-red-500">No options available for this question.</p>;
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
            <span className="font-semibold">Explanation:</span> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection' | 'drag-drop';

export const QuestionTypes: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True/False',
  'short-answer': 'Short Answer',
  'multiple-selection': 'Multiple Selection',
  'drag-drop': 'Drag and Drop'
};

export const isAnswerComplete = (
  questionType: QuestionType, 
  answer: any
): boolean => {
  if (!answer) return false;

  switch (questionType) {
    case 'multiple-choice':
    case 'true-false':
    case 'short-answer':
      return typeof answer === 'string' && answer.trim() !== '';

    case 'multiple-selection':
    case 'drag-drop':
      try {
        const answers = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return Array.isArray(answers) && answers.length > 0;
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
      case 'multiple-choice':
      case 'true-false':
      case 'short-answer':
        return String(answer);

      case 'multiple-selection':
        const selections = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return Array.isArray(selections) ? selections.join(', ') : String(answer);

      case 'drag-drop':
        const answers = typeof answer === 'string' ? JSON.parse(answer) : answer;
        return Array.isArray(answers) ? answers.join(' → ') : String(answer);

      default:
        return String(answer);
    }
  } catch (e) {
    console.error('Error formatting answer:', e);
    return String(answer);
  }
};

export type { QuestionProps };