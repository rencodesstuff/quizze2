// utils/question-bank.ts

import { createClient } from './supabase/component';
import { 
  CreateQuestionBankItem, 
  QuestionBankItem,
  QuestionType,
  DifficultyLevel
} from '../types/question-bank';

export interface QuestionBankFilters {
  searchTerm: string;
  types: QuestionType[];
  difficulty: DifficultyLevel | null;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sort: 'newest' | 'oldest' | 'difficulty' | 'alphabetical';
  favorites: boolean;
}

// Initialize default stats objects
const initializeTypeStats = (): Record<QuestionType, number> => ({
  'multiple-choice': 0,
  'true-false': 0,
  'short-answer': 0,
  'multiple-selection': 0,
  'drag-drop': 0
});

const initializeDifficultyStats = (): Record<DifficultyLevel, number> => ({
  'Easy': 0,
  'Medium': 0,
  'Hard': 0
});

export const defaultQuestionBankFilters: QuestionBankFilters = {
  searchTerm: "",
  types: [],
  difficulty: null,
  category: null,
  subcategory: null,
  tags: [],
  dateRange: {
    from: null,
    to: null
  },
  sort: 'newest',
  favorites: false
};

export const questionBankService = {
  fetchQuestions: async (
    page: number = 0,
    filters: QuestionBankFilters = defaultQuestionBankFilters,
    pageSize: number = 20
  ): Promise<{ questions: QuestionBankItem[]; hasMore: boolean }> => {
    const supabase = createClient();
    let query = supabase
      .from('question_bank')
      .select('*', { count: 'exact' });

    if (filters.searchTerm) {
      query = query.or(`question_text.ilike.%${filters.searchTerm}%,explanation.ilike.%${filters.searchTerm}%`);
    }

    if (filters.types && filters.types.length > 0) {
      query = query.in('type', filters.types);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString());
    }

    if (filters.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString());
    }

    if (filters.favorites) {
      query = query.eq('is_favorite', true);
    }

    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'difficulty':
        query = query.order('difficulty', { ascending: true });
        break;
      case 'alphabetical':
        query = query.order('question_text', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const start = page * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching questions: ${error.message}`);
    }

    return {
      questions: data as QuestionBankItem[],
      hasMore: count ? start + pageSize < count : false
    };
  },

  addQuestion: async (question: CreateQuestionBankItem): Promise<QuestionBankItem> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('question_bank')
      .insert({
        question_text: question.question_text,
        type: question.type,
        difficulty: question.difficulty,
        category: question.category,
        subcategory: question.subcategory,
        correct_answer: question.correct_answer,
        options: question.options,
        explanation: question.explanation,
        image_url: question.image_url,
        multiple_correct_answers: question.multiple_correct_answers,
        drag_drop_text: question.drag_drop_text,
        drag_drop_answers: question.drag_drop_answers,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error adding question: ${error.message}`);
    }

    return data;
  },

  updateQuestion: async (
    id: string,
    updates: Partial<CreateQuestionBankItem>
  ): Promise<QuestionBankItem> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('question_bank')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating question: ${error.message}`);
    }

    return data;
  },

  deleteQuestions: async (ids: string[]): Promise<void> => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('question_bank')
      .delete()
      .in('id', ids);

    if (error) {
      throw new Error(`Error deleting questions: ${error.message}`);
    }
  },

  getQuestionById: async (id: string): Promise<QuestionBankItem> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('question_bank')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching question: ${error.message}`);
    }

    return data;
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('question_bank')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating favorite status: ${error.message}`);
    }
  },

  bulkUpdateTags: async (
    ids: string[],
    tags: string[],
    operation: 'add' | 'remove' | 'set'
  ): Promise<void> => {
    const supabase = createClient();
    
    const { data: questions, error: fetchError } = await supabase
      .from('question_bank')
      .select('id, tags')
      .in('id', ids);

    if (fetchError) {
      throw new Error(`Error fetching questions for tag update: ${fetchError.message}`);
    }

    const updates = questions.map((question: { id: string; tags: string[] }) => {
      let newTags: string[];
      switch (operation) {
        case 'add':
          newTags = [...new Set([...(question.tags || []), ...tags])];
          break;
        case 'remove':
          newTags = (question.tags || []).filter((tag: string) => !tags.includes(tag));
          break;
        case 'set':
          newTags = tags;
          break;
      }

      return {
        id: question.id,
        tags: newTags
      };
    });

    for (const update of updates) {
      const { error } = await supabase
        .from('question_bank')
        .update({ tags: update.tags })
        .eq('id', update.id);

      if (error) {
        throw new Error(`Error updating tags: ${error.message}`);
      }
    }
  },

  getCategories: async (): Promise<string[]> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('question_bank')
      .select('category')
      .then(result => ({
        data: Array.from(new Set(result.data?.map(item => item.category))),
        error: result.error
      }));

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data || [];
  },

  getSubcategories: async (category: string): Promise<string[]> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('question_bank')
      .select('subcategory')
      .eq('category', category)
      .then(result => ({
        data: Array.from(new Set(result.data?.map(item => item.subcategory))),
        error: result.error
      }));

    if (error) {
      throw new Error(`Error fetching subcategories: ${error.message}`);
    }

    return data || [];
  },

  getStatistics: async (): Promise<{
    total: number;
    byType: Record<QuestionType, number>;
    byDifficulty: Record<DifficultyLevel, number>;
    byCategory: Record<string, number>;
  }> => {
    const supabase = createClient();
    
    const [
      countResult,
      typeResult,
      difficultyResult,
      categoryResult
    ] = await Promise.all([
      supabase.from('question_bank').select('*', { count: 'exact', head: true }),
      supabase.from('question_bank').select('type'),
      supabase.from('question_bank').select('difficulty'),
      supabase.from('question_bank').select('category')
    ]);

    const typeStats = initializeTypeStats();
    const difficultyStats = initializeDifficultyStats();
    const categoryStats: Record<string, number> = {};

    typeResult.data?.forEach((item: { type: QuestionType }) => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });

    difficultyResult.data?.forEach((item: { difficulty: DifficultyLevel }) => {
      difficultyStats[item.difficulty] = (difficultyStats[item.difficulty] || 0) + 1;
    });

    categoryResult.data?.forEach((item: { category: string }) => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });

    return {
      total: countResult.count || 0,
      byType: typeStats,
      byDifficulty: difficultyStats,
      byCategory: categoryStats
    };
  }
};