// pages/stdinbox/index.tsx
import React, { useState, useEffect } from "react";
import StudentLayout from "@/comps/student-layout";
import { Card, Title, Text } from "@tremor/react";
import { Clock, Calendar, CheckCircle, Camera } from "lucide-react";
import dynamic from 'next/dynamic';
import QuizCard from "@/comps/QuizCard";
import JoinQuizForm from "@/comps/JoinQuizForm";
import TabComponent from "@/comps/TabComponent";
import Modal from "@/comps/Modal";
import { useQuizzes } from "../../hooks/useQuizzes";
import { useStudentInfo } from "../../hooks/useStudentInfo";

// Dynamically import QR Scanner to avoid SSR issues
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

const MyQuizzes: React.FC = () => {
  const { studentName, studentId, loading: studentLoading } = useStudentInfo();
  const { activeQuizzes, upcomingQuizzes, completedQuizzes, joinQuiz } = useQuizzes();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Handle joining quiz
  const handleJoinQuiz = async (quizCode: string) => {
    try {
      await joinQuiz(quizCode);
      setModalMessage(`Successfully joined the quiz`);
      setShowSuccessModal(true);
      setShowScanner(false);
    } catch (error) {
      console.error('Error in handleJoinQuiz:', error);
      setModalMessage(`Failed to join quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorModal(true);
      setShowScanner(false);
    }
  };

  // Tab configuration
  const tabs = [
    { 
      name: "Active Quizzes", 
      icon: Clock, 
      content: activeQuizzes,
      description: "Currently available quizzes ready to take"
    },
    { 
      name: "Upcoming Quizzes", 
      icon: Calendar, 
      content: upcomingQuizzes,
      description: "Scheduled quizzes that will be available soon"
    },
    { 
      name: "Completed Quizzes", 
      icon: CheckCircle, 
      content: completedQuizzes,
      description: "Quizzes you have already taken"
    },
  ];

  // Loading state
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
      <div className="p-4 sm:p-6 max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">My Quizzes</Title>
          <Text className="text-gray-600">Manage and view your quizzes</Text>
        </div>

        {/* Join Quiz Section */}
        <Card className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-grow w-full">
              <JoinQuizForm onJoinQuiz={handleJoinQuiz} />
            </div>
            {isMobile && (
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                aria-label="Scan QR Code to join quiz"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan QR Code
              </button>
            )}
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

        {/* Success Modal */}
        <Modal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
          title="Success!" 
          message={modalMessage}
        />

        {/* Error Modal */}
        <Modal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title="Error" 
          message={modalMessage}
          isError
        />

        {/* QR Code Scanner */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleJoinQuiz}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default MyQuizzes;