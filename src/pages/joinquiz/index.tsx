import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StudentLayout from "@/comps/student-layout";
import { createClient } from '../../../utils/supabase/component';
import Modal from "@/comps/Modal";
import dynamic from 'next/dynamic';

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
  const [activeTab, setActiveTab] = useState('code');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
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

  const handleJoinQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      <div className="flex-1 flex flex-col p-4">
        {/* Join Quiz Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Join a Quiz</h2>
              <p className="mt-2 text-sm text-gray-600">Enter a code or scan a QR code to join</p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => {
                  setActiveTab('code');
                  setShowScanner(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enter Code
              </button>
              <button
                onClick={() => {
                  setActiveTab('qr');
                  setShowScanner(true);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'qr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Scan QR Code
              </button>
            </div>

            {activeTab === 'code' ? (
              <form className="mt-8 space-y-6" onSubmit={handleJoinQuiz}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="quiz-code" className="sr-only">Quiz Code</label>
                    <input 
                      id="quiz-code" 
                      value={quizCode}
                      onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                      type="text" 
                      required 
                      maxLength={6}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                      placeholder="Enter 6-digit Quiz Code" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    'Join Quiz'
                  )}
                </button>
              </form>
            ) : (
              <div className="mt-8 space-y-6">
                {showScanner ? (
                  <QRCodeScanner
                    onScan={handleQRScan}
                    onClose={() => {
                      setShowScanner(false);
                      setActiveTab('code');
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Camera access required for QR scanning</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Modal */}
        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          message={errorMessage}
          isError
        />
      </div>
    </StudentLayout>
  );
};

export default JoinQuiz;