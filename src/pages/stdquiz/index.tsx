import React, { useState, useEffect } from "react";
import StudentLayout from "@/comps/student-layout";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, Title, Text, TabList, Tab, TabGroup, TabPanel, TabPanels } from "@tremor/react";
import { createClient } from "../../../utils/supabase/component";

interface Quiz {
  id: number;
  name: string;
  date: string;
  time?: string;
  score?: string;
}

const joinedQuizzes: Quiz[] = [
  { id: 1, name: "Advanced Mathematics", date: "2024-08-15", time: "10:00 AM" },
  { id: 2, name: "World History", date: "2024-08-20", time: "2:00 PM" },
  { id: 3, name: "Computer Science Fundamentals", date: "2024-08-25", time: "11:30 AM" },
];

const upcomingQuizzes: Quiz[] = [
  { id: 4, name: "Physics Mechanics", date: "2024-09-05", time: "9:00 AM" },
  { id: 5, name: "English Literature", date: "2024-09-10", time: "1:00 PM" },
];

const recentQuizzes: Quiz[] = [
  { id: 6, name: "Biology", date: "2024-07-30", score: "85%" },
  { id: 7, name: "Chemistry", date: "2024-08-02", score: "92%" },
  { id: 8, name: "Geography", date: "2024-08-07", score: "78%" },
];

const QuizCard: React.FC<{ quiz: Quiz; type: "joined" | "upcoming" | "recent" }> = ({ quiz, type }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-blue-600">{quiz.name}</h3>
        <p className="text-gray-600">
          <span className="font-semibold">Date:</span> {quiz.date}
        </p>
        {quiz.time && (
          <p className="text-gray-600">
            <span className="font-semibold">Time:</span> {quiz.time}
          </p>
        )}
        {quiz.score && (
          <p className="text-gray-600">
            <span className="font-semibold">Score:</span> {quiz.score}
          </p>
        )}
        {type === "joined" && (
          <Link href={`/stdquiz/${quiz.id}`} passHref>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
              Start Quiz
            </button>
          </Link>
        )}
        {type === "recent" && (
          <Link href={`/stdquiz/${quiz.id}`} passHref>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
              View Results
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const MyQuizzes: React.FC = () => {
  const [quizCode, setQuizCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`Error fetching user: ${userError.message}`);
        }

        if (user) {
          const { data, error } = await supabase
            .from('students')
            .select('name, student_id')
            .eq('id', user.id)
            .single();

          if (error) {
            throw new Error(`Error fetching student info: ${error.message}`);
          }

          if (data) {
            setStudentName(data.name);
            setStudentId(data.student_id);
          } else {
            throw new Error('No student data found');
          }
        } else {
          throw new Error('No authenticated user found');
        }
      } catch (err) {
        console.error('Error in fetchStudentInfo:', err);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleJoinQuiz = () => {
    // Placeholder for join quiz functionality
    console.log(`Joining quiz with code: ${quizCode}`);
    // You would typically make an API call here
  };

  const handleScanQRCode = () => {
    // Placeholder for QR code scanning
    const mockScannedCode = "QUIZ123"; // This would be the result of actual QR scanning
    setQuizCode(mockScannedCode);
    console.log("QR Code scanned:", mockScannedCode);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-6">
        <Title>My Quizzes</Title>
        <Text>Manage and view your quizzes</Text>

        <Card className="mt-6">
          <TabGroup>
            <TabList>
              <Tab>Joined Quizzes</Tab>
              <Tab>Upcoming Quizzes</Tab>
              <Tab>Recent Quizzes</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {joinedQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} type="joined" />
                  ))}
                </div>
              </TabPanel>
              <TabPanel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {upcomingQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} type="upcoming" />
                  ))}
                </div>
              </TabPanel>
              <TabPanel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {recentQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} type="recent" />
                  ))}
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>

        <Card className="mt-6">
          <Title>Join a New Quiz</Title>
          <Text>Enter the quiz code or scan QR code to join a new quiz</Text>
          <div className="mt-4 flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Enter quiz code"
              className="flex-grow mr-2 p-2 border border-gray-300 rounded mb-2 md:mb-0"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
            />
            <button 
              onClick={handleJoinQuiz}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Join Quiz
            </button>
          </div>
          {isMobile && (
            <div className="mt-4">
              <button
                onClick={handleScanQRCode}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Scan QR Code
              </button>
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyQuizzes;