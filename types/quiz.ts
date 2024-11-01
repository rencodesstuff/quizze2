
export interface Question {
    id: string;
    type: string;
    text: string;
    options?: string[] | null;
    correct_answer: string;
    image_url?: string;
    explanation?: string;
    multiple_correct_answers?: string[];
    drag_drop_pairs?: string | { [key: string]: string };
    blank_positions?: string | { [key: string]: string };
  }
  
  export interface QuestionProps {
    question: Question;
    answers: Record<string, any>;
    handleAnswer: (questionId: string, answer: any) => void;
    showExplanation?: boolean;
  }
  
  export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection' | 'drag-drop' | 'fill-blanks';
  
  export const QuestionTypes: Record<QuestionType, string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
    'multiple-selection': 'Multiple Selection',
    'drag-drop': 'Drag and Drop',
    'fill-blanks': 'Fill in the Blanks'
  };