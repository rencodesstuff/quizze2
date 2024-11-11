// utils/question-bank.ts
import { createClient } from './supabase/component';
import { 
  QuestionBankItem, 
  QuestionBankFilters, 
  FetchQuestionsResponse,
  CreateQuestionBankItem
} from '../types/question-bank';
import { PostgrestError } from '@supabase/supabase-js';

const PAGE_SIZE = 20;

export const questionBankService = {
  async fetchQuestions(
    page: number,
    filters: QuestionBankFilters
  ): Promise<FetchQuestionsResponse> {
    const supabase = createClient();
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;

    let query = supabase
      .from('question_bank')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (filters.searchTerm) {
      query = query.or(
        `question_text.ilike.%${filters.searchTerm}%,subject.ilike.%${filters.searchTerm}%,topic.ilike.%${filters.searchTerm}%`
      );
    }

    if (filters.types.length > 0) {
      query = query.in('type', filters.types);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }

    if (filters.topic) {
      query = query.eq('topic', filters.topic);
    }

    if (filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters.dateRange.from && filters.dateRange.to) {
      query = query
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString());
    }

    if (filters.favorites) {
      query = query.eq('is_favorite', true);
    }

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'difficulty-asc':
        query = query.order('difficulty', { ascending: true });
        break;
      case 'difficulty-desc':
        query = query.order('difficulty', { ascending: false });
        break;
      case 'type':
        query = query.order('type', { ascending: true });
        break;
    }

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      questions: data as QuestionBankItem[],
      totalCount: count || 0,
      hasMore: count ? start + PAGE_SIZE < count : false
    };
  },

  async addQuestion(questionData: CreateQuestionBankItem): Promise<QuestionBankItem> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('question_bank')
      .insert([{ ...questionData, teacher_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuestion(id: string, updates: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_bank')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuestions(ids: string[]): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('question_bank')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<QuestionBankItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_bank')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTags(id: string, tags: string[]): Promise<QuestionBankItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('question_bank')
      .update({ tags })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkUpdateTags(
    ids: string[], 
    tags: string[], 
    operation: 'add' | 'remove' | 'set'
  ): Promise<void> {
    const supabase = createClient();
    
    if (operation === 'set') {
      const { error } = await supabase
        .from('question_bank')
        .update({ tags })
        .in('id', ids);

      if (error) throw error;
      return;
    }

    const { data: questions, error: fetchError } = await supabase
      .from('question_bank')
      .select('id, tags')
      .in('id', ids);

    if (fetchError) throw fetchError;

    const updates = questions.map((question: { id: string; tags: string[] }) => ({
      id: question.id,
      tags: operation === 'add'
        ? [...new Set([...(question.tags || []), ...tags])]
        : (question.tags || []).filter(tag => !tags.includes(tag))
    }));

    const { error: updateError } = await supabase
      .from('question_bank')
      .upsert(updates);

    if (updateError) throw updateError;
  },

  formatError(error: PostgrestError | Error): string {
    if ('code' in error) {
      switch (error.code) {
        case '23505':
          return 'A question with these details already exists.';
        case '23503':
          return 'Referenced record does not exist.';
        default:
          return error.message;
      }
    }
    return error.message;
  }
};