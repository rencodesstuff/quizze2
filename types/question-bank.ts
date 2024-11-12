// types/question-bank.ts

export type QuestionType = 
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "multiple-selection"
  | "drag-drop";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

// Base interface for creating a question
export interface CreateQuestionBankItem {
  question_text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category: string;
  subcategory: string;
  correct_answer: string;
  options?: string[];
  explanation?: string;
  image_url?: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
}

// Full question interface including database fields
export interface QuestionBankItem extends CreateQuestionBankItem {
  id: string;
  teacher_id: string;
  created_at: string;
  is_active: boolean;
  is_favorite: boolean;  // Added this field
  tags: string[];
}

// Filter interface for the question bank
export interface QuestionBankFilters {
  searchTerm?: string;
  types?: QuestionType[];
  difficulty?: DifficultyLevel | null;
  category?: string | null;
  subcategory?: string | null;
  tags?: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  sort?: 'newest' | 'oldest' | 'difficulty' | 'alphabetical';
  favorites?: boolean;
}