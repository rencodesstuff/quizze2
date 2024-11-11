// types/filters.ts
import { QuestionType, DifficultyLevel } from './question-bank';

export type SortOption = 'newest' | 'oldest' | 'difficulty-asc' | 'difficulty-desc' | 'type';

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