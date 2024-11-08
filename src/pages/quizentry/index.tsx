import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../../../utils/supabase/component';

const JoinQuizPage = () => {
  const router = useRouter();
  const { code } = router.query;
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndJoin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not logged in, redirect to sign in page with return URL
        router.push(`/signin?redirect=/joinquiz?code=${code}`);
        return;
      }

      if (code) {
        try {
          // Get quiz details
          const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('id')
            .eq('code', code)
            .single();

          if (quizError) throw quizError;

          if (quiz) {
            // Check if already joined
            const { data: existingJoin } = await supabase
              .from('student_quizzes')
              .select('id')
              .eq('student_id', session.user.id)
              .eq('quiz_id', quiz.id)
              .single();

            if (!existingJoin) {
              // Join the quiz
              const { error: joinError } = await supabase
                .from('student_quizzes')
                .insert([{
                  student_id: session.user.id,
                  quiz_id: quiz.id
                }]);

              if (joinError) throw joinError;
            }

            // Redirect to student quiz page
            router.push(`/stdquiz/${quiz.id}`);
          } else {
            throw new Error('Quiz not found');
          }
        } catch (error) {
          console.error('Error joining quiz:', error);
          alert('Failed to join quiz. Please try again or enter the code manually.');
          router.push('/stdquiz');
        }
      }
    };

    if (code) {
      checkAuthAndJoin();
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Joining quiz...</p>
      </div>
    </div>
  );
};

export default JoinQuizPage;