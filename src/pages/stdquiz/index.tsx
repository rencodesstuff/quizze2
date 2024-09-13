import React, { useState, useEffect } from "react";
import StudentLayout from "@/comps/student-layout";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, Title, Text, TabList, Tab, TabGroup, TabPanel, TabPanels } from "@tremor/react";
import { createClient } from "../../../utils/supabase/component";

interface Quiz {
  id: string;
  title: string;
  duration_minutes?: number | null;
  release_date: string;
  max_participants?: number | null;
  strict_mode?: boolean | null;
  randomize_arrangement?: boolean | null;
  teacher_id?: string | null;
  created_at?: string | null;
  code?: string | null;
}

const QuizCard: React.FC<{ quiz: Quiz; type: "joined" | "upcoming" | "recent" }> = ({ quiz, type }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-blue-600">{quiz.title}</h3>
        <p className="text-gray-600">
          <span className="font-semibold">Date:</span> {new Date(quiz.release_date).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Time:</span> {new Date(quiz.release_date).toLocaleTimeString()}
        </p>
        {quiz.duration_minutes && (
          <p className="text-gray-600">
            <span className="font-semibold">Duration:</span> {quiz.duration_minutes} minutes
          </p>
        )}
        {type === "joined" && (
          <Link href={`/stdquiz/${quiz.id}`}>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
              View Quiz
            </button>
          </Link>
        )}
        {type === "upcoming" && (
          <Link href={`/stdquiz/${quiz.id}`}>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
              Prepare for Quiz
            </button>
          </Link>
        )}
        {type === "recent" && (
          <Link href={`/stdquiz/${quiz.id}`}>
            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300">
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
  const [joinedQuizzes, setJoinedQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);

  const supabase = createClient();

  const fetchQuizzes = async (userId: string) => {
    try {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
      // Fetch joined quizzes
      const { data: joinedData, error: joinedError } = await supabase
        .from('student_quizzes')
        .select(`
          quiz_id,
          quizzes (*)
        `)
        .eq('student_id', userId);
  
      if (joinedError) throw joinedError;
  
      const allJoinedQuizzes = joinedData
        .flatMap(item => {
          const quizzes = Array.isArray(item.quizzes) ? item.quizzes : [item.quizzes];
          return quizzes.filter((quiz): quiz is Quiz => 
            !!quiz && 
            typeof quiz.id === 'string' &&
            typeof quiz.title === 'string' &&
            typeof quiz.release_date === 'string'
          );
        });
  
      const joined = allJoinedQuizzes.filter(quiz => {
        const quizDate = new Date(quiz.release_date);
        return quizDate > oneWeekFromNow;
      });

      const upcoming = allJoinedQuizzes.filter(quiz => {
        const quizDate = new Date(quiz.release_date);
        return quizDate > now && quizDate <= oneWeekFromNow;
      });

      const recent = allJoinedQuizzes.filter(quiz => {
        const quizDate = new Date(quiz.release_date);
        return quizDate <= now;
      });
  
      setJoinedQuizzes(joined);
      setUpcomingQuizzes(upcoming);
      setRecentQuizzes(recent);
  
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        const { data, error } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('No student data found');

        setStudentName(data.name);
        setStudentId(data.student_id);
        await fetchQuizzes(user.id);
      } catch (err) {
        console.error('Error in fetchStudentInfo:', err);
        // Handle error appropriately (e.g., show error message to user)
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleJoinQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('code', quizCode)
        .single();

      if (quizError) throw quizError;
      if (!quizData) throw new Error('Invalid quiz code');

      const { error: joinError } = await supabase
        .from('student_quizzes')
        .insert({ student_id: user.id, quiz_id: quizData.id });

      if (joinError) throw joinError;

      alert('Successfully joined the quiz!');
      setQuizCode('');
      await fetchQuizzes(user.id);
    } catch (error) {
      console.error('Error in handleJoinQuiz:', error);
      alert(`Failed to join quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
          <Text>Enter the quiz code to join a new quiz</Text>
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
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyQuizzes;