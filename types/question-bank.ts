// types/question-bank.ts

export type QuestionType = 
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "multiple-selection"
  | "drag-drop";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export interface CreateQuestionBankItem {
  question_text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category: string;        // Added this line
  subcategory: string;     // Added this line
  correct_answer: string;
  options?: string[];
  explanation?: string;
  image_url?: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
}

export interface QuestionBankItem extends CreateQuestionBankItem {
  id: string;
  teacher_id: string;
  created_at: string;
  is_active: boolean;
  tags: string[];
}