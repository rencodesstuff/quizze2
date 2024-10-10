import React, { useState } from "react";
import StudentLayout from "@/comps/student-layout";
import { Card, Title, Text } from "@tremor/react";
import { Clock, Calendar, CheckCircle } from "lucide-react";
import QuizCard from "@/comps/QuizCard";
import JoinQuizForm from "@/comps/JoinQuizForm";
import TabComponent from "@/comps/TabComponent";
import Modal from "@/comps/Modal";
import { useQuizzes } from "../../hooks/useQuizzes";
import { useStudentInfo } from "../../hooks/useStudentInfo";

const MyQuizzes: React.FC = () => {
  const { studentName, studentId, loading } = useStudentInfo();
  const { activeQuizzes, upcomingQuizzes, completedQuizzes, joinQuiz } = useQuizzes();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleJoinQuiz = async (quizCode: string) => {
    try {
      await joinQuiz(quizCode);
      setModalMessage(`Successfully joined the quiz`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in handleJoinQuiz:', error);
      setModalMessage(`Failed to join quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorModal(true);
    }
  };

  const tabs = [
    { name: "Active Quizzes", icon: Clock, content: activeQuizzes },
    { name: "Upcoming Quizzes", icon: Calendar, content: upcomingQuizzes },
    { name: "Completed Quizzes", icon: CheckCircle, content: completedQuizzes },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-8">
          <Title className="text-2xl font-bold text-gray-800 mb-2">My Quizzes</Title>
          <Text className="text-gray-600">Manage and view your quizzes</Text>
        </div>

        <Card className="mb-8">
          <JoinQuizForm onJoinQuiz={handleJoinQuiz} />
        </Card>

        <Card className="flex-grow flex flex-col overflow-hidden">
          <TabComponent tabs={tabs} renderContent={(content, activeTab) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {content.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} status={tabs[activeTab].name.split(' ')[0].toLowerCase() as "active" | "upcoming" | "completed"} />
              ))}
              {content.length === 0 && <Text>No {tabs[activeTab].name.toLowerCase()} at the moment.</Text>}
            </div>
          )} />
        </Card>

        <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Success!" message={modalMessage} />
        <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error" message={modalMessage} isError />
      </div>
    </StudentLayout>
  );
};

export default MyQuizzes;