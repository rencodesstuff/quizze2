import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text, DonutChart, Flex, Select, SelectItem, Badge, Grid } from "@tremor/react";
import { ClockIcon, AcademicCapIcon, SortAscendingIcon, ChartPieIcon, BookOpenIcon } from "@heroicons/react/outline";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";

type QuizResult = {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  date: string;
  duration: number;
};

const StudentQuizHistory: React.FC = () => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [sortBy, setSortBy] = useState("date");

  const supabase = createClient();

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(`Error fetching user: ${userError.message}`);
        if (user) {
          const { data, error } = await supabase
            .from('students')
            .select('name, student_id')
            .eq('id', user.id)
            .single();
          if (error) throw new Error(`Error fetching student info: ${error.message}`);
          if (data) {
            setStudentName(data.name);
            setStudentId(data.student_id);
            await fetchQuizResults(user.id);
          } else {
            throw new Error('No student data found');
          }
        } else {
          throw new Error('No authenticated user found');
        }
      } catch (err) {
        console.error('Error in fetchStudentInfo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentInfo();
  }, []);

  const fetchQuizResults = async (userId: string) => {
    // Placeholder data
    const mockResults: QuizResult[] = [
      { id: 1, title: "Math Quiz 1", score: 85, totalQuestions: 20, date: "2024-07-15", duration: 30 },
      { id: 2, title: "Science Quiz", score: 92, totalQuestions: 25, date: "2024-07-10", duration: 45 },
      { id: 3, title: "History Test", score: 78, totalQuestions: 30, date: "2024-07-05", duration: 60 },
      { id: 4, title: "English Essay", score: 88, totalQuestions: 1, date: "2024-07-01", duration: 90 },
      { id: 5, title: "Geography Quiz", score: 95, totalQuestions: 15, date: "2024-06-28", duration: 25 },
      // Add more mock results to simulate a longer list
      ...[...Array(10)].map((_, i) => ({
        id: i + 6,
        title: `Additional Quiz ${i + 1}`,
        score: Math.floor(Math.random() * 100),
        totalQuestions: Math.floor(Math.random() * 30) + 10,
        date: new Date(2024, 6, 27 - i).toISOString().split('T')[0],
        duration: Math.floor(Math.random() * 60) + 15
      }))
    ];
    setQuizResults(mockResults);
  };

  const sortedResults = [...quizResults].sort((a, b) => {
    if (sortBy === "score") return (b.score / b.totalQuestions) - (a.score / a.totalQuestions);
    if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return 0;
  });

  const getScoreColor = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return "bg-green-500 text-white";
    if (percentage >= 70) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const calculateAverageScore = () => {
    const totalScore = quizResults.reduce((sum, quiz) => sum + (quiz.score / quiz.totalQuestions), 0);
    return (totalScore / quizResults.length) * 100;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <Title className="text-2xl font-bold text-gray-800 mb-2">Quiz History</Title>
        <Text className="text-gray-600 mb-6">View and analyze your quiz performance</Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <Flex justifyContent="start" alignItems="center" className="mb-4">
              <ChartPieIcon className="h-6 w-6 text-blue-500 mr-2" />
              <Title className="text-lg font-semibold">Performance Overview</Title>
            </Flex>
            <DonutChart
              className="h-48"
              data={sortedResults.map(result => ({
                name: result.title,
                score: (result.score / result.totalQuestions) * 100
              }))}
              category="score"
              index="name"
              valueFormatter={(number) => `${number.toFixed(1)}%`}
              colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
            />
          </Card>
          <Card>
            <Flex justifyContent="start" alignItems="center" className="mb-4">
              <BookOpenIcon className="h-6 w-6 text-green-500 mr-2" />
              <Title className="text-lg font-semibold">Average Score</Title>
            </Flex>
            <DonutChart
              className="h-48"
              data={[
                { name: "Average Score", score: calculateAverageScore() },
                { name: "Remaining", score: 100 - calculateAverageScore() }
              ]}
              category="score"
              index="name"
              valueFormatter={(number) => `${number.toFixed(1)}%`}
              colors={["green", "gray"]}
            />
          </Card>
        </div>

        <Card>
          <Flex justifyContent="between" alignItems="center" className="mb-4">
            <Title className="text-xl font-semibold">Quiz Results</Title>
            <Select value={sortBy} onValueChange={setSortBy} className="w-40">
              <SelectItem value="date" icon={ClockIcon}>Sort by Date</SelectItem>
              <SelectItem value="score" icon={SortAscendingIcon}>Sort by Score</SelectItem>
            </Select>
          </Flex>
          <div className="space-y-4">
            {sortedResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <Flex justifyContent="between" alignItems="start">
                    <div>
                      <Title className="text-lg font-semibold mb-2">{result.title}</Title>
                      <Badge 
                        size="xl"
                        className={`${getScoreColor(result.score, result.totalQuestions)} px-3 py-1 rounded-full mb-2`}
                      >
                        Score: {result.score}/{result.totalQuestions}
                      </Badge>
                    </div>
                    <Text className="text-right text-sm text-gray-500 font-medium">
                      {new Date(result.date).toLocaleDateString()}
                    </Text>
                  </Flex>
                  <Flex justifyContent="start" alignItems="center" className="mt-2">
                    <Text className="text-sm text-gray-600 mr-4">
                      <ClockIcon className="inline-block h-4 w-4 mr-1" />
                      {result.duration} mins
                    </Text>
                    <Text className="text-sm text-gray-600">
                      <AcademicCapIcon className="inline-block h-4 w-4 mr-1" />
                      {result.totalQuestions} questions
                    </Text>
                  </Flex>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentQuizHistory;