// types/question-bank.ts
export type QuestionType = 
  | 'multiple-choice' 
  | 'true-false' 
  | 'short-answer' 
  | 'multiple-selection' 
  | 'drag-drop';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'difficulty-asc' 
  | 'difficulty-desc' 
  | 'type';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface QuestionBankFilters {
  searchTerm: string;
  types: QuestionType[];
  difficulty: DifficultyLevel | null;
  subject: string | null;
  topic: string | null;
  tags: string[];
  dateRange: DateRange;
  sort: SortOption;
  favorites: boolean;
}

export interface QuestionBankItem {
  id: string;
  teacher_id: string;
  question_text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  subject: string;
  topic: string;
  options?: string[];
  correct_answer: string;
  multiple_correct_answers?: string[];
  explanation?: string;
  image_url?: string;
  created_at: string;
  is_active: boolean;
  tags: string[];
  is_favorite: boolean;
}

export interface FetchQuestionsResponse {
  questions: QuestionBankItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface CreateQuestionBankItem {
  question_text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  subject: string;
  topic: string;
  options?: string[];
  correct_answer: string;
  multiple_correct_answers?: string[];
  explanation?: string;
  image_url?: string;
  tags?: string[];
}