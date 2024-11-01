// hooks/useQuizzes.ts
import { useState, useCallback, useEffect } from 'react';
import { createClient } from "../../utils/supabase/component";

// Define the quiz interface for validated data
interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string | null;
  code: string | null;
  created_at: string;
}

// Define a base quiz type for type checking
type BaseQuizData = {
  id: unknown;
  title: unknown;
  duration_minutes: unknown;
  release_date: unknown;
  code: unknown;
  created_at: unknown;
}

interface UseQuizzesReturn {
  activeQuizzes: Quiz[];
  upcomingQuizzes: Quiz[];
  completedQuizzes: Quiz[];
  joinQuiz: (quizCode: string) => Promise<void>;
  refreshQuizzes: () => Promise<void>;
  loading: boolean;
}

export const useQuizzes = (): UseQuizzesReturn => {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  // Type guard function
  const isValidQuiz = (quiz: BaseQuizData | null): quiz is Quiz => {
    if (!quiz) return false;
    
    return (
      typeof quiz.id === 'string' &&
      typeof quiz.title === 'string' &&
      (quiz.duration_minutes === null || typeof quiz.duration_minutes === 'number') &&
      (quiz.release_date === null || typeof quiz.release_date === 'string') &&
      (quiz.code === null || typeof quiz.code === 'string') &&
      typeof quiz.created_at === 'string'
    );
  };

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const now = new Date();

      const { data: joinedData, error: joinedError } = await supabase
        .from('student_quizzes')
        .select(`
          quiz_id,
          quizzes (
            id,
            title,
            duration_minutes,
            release_date,
            code,
            created_at
          )
        `)
        .eq('student_id', user.id);

      if (joinedError) throw joinedError;

      const allJoinedQuizzes = joinedData
        .flatMap(item => {
          const quizzes = Array.isArray(item.quizzes) ? item.quizzes : [item.quizzes];
          return quizzes.filter((quiz): quiz is Quiz => isValidQuiz(quiz as BaseQuizData));
        });

      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('quiz_id')
        .eq('student_id', user.id);

      if (submissionError) throw submissionError;

      const submittedQuizIds = new Set(submissionData.map(submission => submission.quiz_id));

      const upcoming = allJoinedQuizzes.filter(quiz => 
        quiz.release_date && new Date(quiz.release_date) > now && !submittedQuizIds.has(quiz.id)
      );

      const active = allJoinedQuizzes.filter(quiz => 
        (quiz.release_date === null || new Date(quiz.release_date) <= now) && !submittedQuizIds.has(quiz.id)
      );

      const completed = allJoinedQuizzes.filter(quiz => submittedQuizIds.has(quiz.id));

      setUpcomingQuizzes(upcoming);
      setActiveQuizzes(active);
      setCompletedQuizzes(completed);

    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setUpcomingQuizzes([]);
      setActiveQuizzes([]);
      setCompletedQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const joinQuiz = async (quizCode: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      await supabase.rpc('set_current_quiz_code', { quiz_code: quizCode });

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .single();

      if (quizError) throw quizError;
      if (!quizData || !isValidQuiz(quizData as BaseQuizData)) {
        throw new Error('Invalid quiz code');
      }

      const { data: existingJoin } = await supabase
        .from('student_quizzes')
        .select('id')
        .eq('student_id', user.id)
        .eq('quiz_id', quizData.id)
        .single();

      if (existingJoin) {
        throw new Error('You have already joined this quiz');
      }

      const { error: joinError } = await supabase
        .from('student_quizzes')
        .insert({ student_id: user.id, quiz_id: quizData.id });

      if (joinError) throw joinError;

      await supabase.rpc('clear_current_quiz_code');
      await fetchQuizzes();
    } catch (error) {
      await supabase.rpc('clear_current_quiz_code');
      console.error('Error joining quiz:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    activeQuizzes,
    upcomingQuizzes,
    completedQuizzes,
    joinQuiz,
    refreshQuizzes: fetchQuizzes,
    loading
  };
};