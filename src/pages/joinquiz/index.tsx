// pages/joinquiz/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentLayout from "@/comps/student-layout";
import { createClient } from '../../../utils/supabase/component';
import { Camera } from "lucide-react";
import { Card } from "@tremor/react";
import Modal from "@/comps/Modal";
import dynamic from 'next/dynamic';
import JoinQuizForm from '@/comps/JoinQuizForm';

// Dynamically import QR Scanner
const QRCodeScanner = dynamic(() => import('@/comps/QRCodeScanner'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center mt-4">Loading camera...</p>
      </div>
    </div>
  ),
});

const JoinQuiz = () => {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: '', studentId: '' });
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const supabase = createClient();

  // Fetch student information
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/signin');
          return;
        }

        const { data: studentData, error } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setStudentInfo({
          name: studentData.name,
          studentId: studentData.student_id
        });
      } catch (error) {
        console.error('Error fetching student info:', error);
        setErrorMessage('Failed to load student information');
        setShowErrorModal(true);
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudentInfo();
  }, []);

  const handleJoinQuiz = async () => {    
    if (!quizCode.trim()) {
      setErrorMessage('Please enter a quiz code');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw new Error('Authentication error');
      if (!session) {
        router.push(`/signin?redirect=/joinquiz?code=${quizCode}`);
        return;
      }

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, max_participants, release_date')
        .eq('code', quizCode.toUpperCase())
        .single();

      if (quizError) {
        throw new Error('Invalid quiz code or quiz not found');
      }

      // Check if quiz exists
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Check release date
      if (quiz.release_date && new Date(quiz.release_date) > new Date()) {
        throw new Error(`This quiz is not available yet. It will be released on ${new Date(quiz.release_date).toLocaleString()}`);
      }

      // Check if student already joined
      const { data: existingJoin, error: joinCheckError } = await supabase
        .from('student_quizzes')
        .select('id')
        .eq('student_id', session.user.id)
        .eq('quiz_id', quiz.id)
        .single();

      if (existingJoin) {
        router.push(`/stdquiz/${quiz.id}`);
        return;
      }

      // Check maximum participants if set
      if (quiz.max_participants) {
        const { count, error: countError } = await supabase
          .from('student_quizzes')
          .select('*', { count: 'exact' })
          .eq('quiz_id', quiz.id);

        if (countError) throw countError;

        if (count && count >= quiz.max_participants) {
          throw new Error('This quiz has reached its maximum number of participants');
        }
      }

      // Join the quiz
      const { error: joinError } = await supabase
        .from('student_quizzes')
        .insert([{
          student_id: session.user.id,
          quiz_id: quiz.id
        }]);

      if (joinError) {
        throw new Error('Failed to join quiz');
      }

      // Redirect to quiz
      router.push(`/stdquiz/${quiz.id}`);

    } catch (error) {
      console.error('Error joining quiz:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (scannedCode: string) => {
    try {
      let code = scannedCode;
      // Try to extract code from URL if it's a URL
      try {
        const url = new URL(scannedCode);
        const urlCode = url.searchParams.get('code');
        if (urlCode) code = urlCode;
      } catch {
        // If not a URL, use the code as-is
      }

      setQuizCode(code);
      setShowScanner(false);
      await handleJoinQuiz();
    } catch (error) {
      console.error('Error processing QR code:', error);
      setErrorMessage('Invalid QR code');
      setShowErrorModal(true);
    }
  };

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <StudentLayout studentName={studentInfo.name} studentId={studentInfo.studentId}>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Join Quiz Section */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4">Join a New Quiz</h3>
            <div className="flex flex-col gap-4">
              <JoinQuizForm 
                quizCode={quizCode}
                onQuizCodeChange={setQuizCode}
                onSubmit={handleJoinQuiz}
                isLoading={isLoading}
              />
              
              <button
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan QR Code
              </button>
            </div>
          </div>
        </Card>

        {/* Error Modal */}
        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          message={errorMessage}
          isError
        />

        {/* QR Scanner */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default JoinQuiz;