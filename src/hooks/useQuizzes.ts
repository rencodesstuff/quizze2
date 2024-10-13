import { useState, useCallback, useEffect } from 'react';
import { createClient } from "../../utils/supabase/component";

interface Quiz {
  id: string;
  title: string;
  duration_minutes?: number | null;
  release_date: string | null;
}

export const useQuizzes = () => {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Quiz[]>([]);
  
  const supabase = createClient();

  const fetchQuizzes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const now = new Date();

      const { data: joinedData, error: joinedError } = await supabase
        .from('student_quizzes')
        .select(`
          quiz_id,
          quizzes (*)
        `)
        .eq('student_id', user.id);

      if (joinedError) throw joinedError;

      const allJoinedQuizzes = joinedData
        .flatMap(item => {
          const quizzes = Array.isArray(item.quizzes) ? item.quizzes : [item.quizzes];
          return quizzes.filter((quiz): quiz is Quiz => 
            !!quiz && 
            typeof quiz.id === 'string' &&
            typeof quiz.title === 'string' &&
            (quiz.release_date === null || typeof quiz.release_date === 'string')
          );
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
    }
  }, [supabase]);

  const joinQuiz = async (quizCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Set the current quiz code
      await supabase.rpc('set_current_quiz_code', { quiz_code: quizCode });

      // Query the quizzes table with the set quiz code
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .single();

      if (quizError) throw quizError;
      if (!quizData) throw new Error('Invalid quiz code');

      // Join the quiz
      const { error: joinError } = await supabase
        .from('student_quizzes')
        .insert({ student_id: user.id, quiz_id: quizData.id });

      if (joinError) throw joinError;

      // Clear the current quiz code setting
      await supabase.rpc('clear_current_quiz_code');

      // Refresh quizzes after joining
      await fetchQuizzes();
    } catch (error) {
      // Clear the current quiz code setting in case of error
      await supabase.rpc('clear_current_quiz_code');
      console.error('Error joining quiz:', error);
      throw error;
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
    refreshQuizzes: fetchQuizzes
  };
};