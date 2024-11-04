// pages/stdquiz/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentLayout from "@/comps/student-layout";
import { Card, Title, Text } from "@tremor/react";
import { Camera, Clock, Calendar, CheckCircle } from "lucide-react";
import Modal from "@/comps/Modal";
import dynamic from 'next/dynamic';
import JoinQuizForm from '@/comps/JoinQuizForm';
import QuizCard from '@/comps/QuizCard';
import TabComponent from '@/comps/TabComponent';
import { useQuizzes } from "../../hooks/useQuizzes";
import { useStudentInfo } from "../../hooks/useStudentInfo";

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

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string | null;
  code: string | null;
  created_at: string;
}

const StudentQuizzes = () => {
  const router = useRouter();
  const { studentName, studentId, loading: studentLoading } = useStudentInfo();
  const { activeQuizzes, upcomingQuizzes, completedQuizzes, joinQuiz } = useQuizzes();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Set loading to false once we have the data
    if (activeQuizzes || upcomingQuizzes || completedQuizzes) {
      setIsLoading(false);
    }
  }, [activeQuizzes, upcomingQuizzes, completedQuizzes]);

  const handleJoinQuiz = async (quizCode: string) => {
    setIsJoining(true);
    try {
      await joinQuiz(quizCode);
      router.push('/stdinbox');
    } catch (error) {
      console.error('Error in handleJoinQuiz:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setShowErrorModal(true);
    } finally {
      setIsJoining(false);
      setShowScanner(false);
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
      await handleJoinQuiz(code);
    } catch (error) {
      console.error('Error processing QR code:', error);
      setErrorMessage('Invalid QR code');
      setShowErrorModal(true);
    }
  };

  const tabs = [
    { 
      name: "Active Quizzes", 
      icon: Clock, 
      content: activeQuizzes || [],
      description: "Currently available quizzes ready to take"
    },
    { 
      name: "Upcoming Quizzes", 
      icon: Calendar, 
      content: upcomingQuizzes || [],
      description: "Scheduled quizzes that will be available soon"
    },
    { 
      name: "Completed Quizzes", 
      icon: CheckCircle, 
      content: completedQuizzes || [],
      description: "Quizzes you have already taken"
    },
  ];

  if (studentLoading || isLoading) {
    return (
      <StudentLayout studentName="" studentId="">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Title className="text-2xl sm:text-3xl font-bold text-gray-800">Student Quizzes</Title>
          <Text className="text-gray-600">Join and view your quizzes</Text>
        </div>

        {/* Join Quiz Section */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4">Join a New Quiz</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow">
                  <JoinQuizForm 
                    onSubmit={handleJoinQuiz}
                    isLoading={isJoining}
                  />
                </div>
              </div>
              
              {isMobile && (
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Scan QR Code
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Quiz Lists */}
        <Card className="flex-grow flex flex-col overflow-hidden">
          <TabComponent 
            tabs={tabs} 
            renderContent={(content, activeTab) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4">
                {content.map((quiz: Quiz) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    status={tabs[activeTab].name.split(' ')[0].toLowerCase() as "active" | "upcoming" | "completed"} 
                  />
                ))}
                {content.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Text className="text-gray-500">
                      No {tabs[activeTab].name.toLowerCase()} at the moment.
                    </Text>
                    <Text className="text-sm text-gray-400 mt-2">
                      {tabs[activeTab].description}
                    </Text>
                  </div>
                )}
              </div>
            )} 
          />
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

export default StudentQuizzes;