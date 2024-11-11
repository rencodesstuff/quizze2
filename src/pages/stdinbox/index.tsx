import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text, Flex, Select, SelectItem, Badge, Grid, Button } from "@tremor/react";
import { 
  ClockIcon, 
  AcademicCapIcon, 
  SortAscendingIcon, 
  ChartPieIcon, 
  BookOpenIcon 
} from "@heroicons/react/outline";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";
import { useRouter } from 'next/router';
import { Chart } from "react-google-charts";

// Define types for quiz results and related data
type QuizResult = {
  id: string;
  student_id: string;
  quiz_id: string;
  submitted_at: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  quiz: {
    id: string;
    title: string;
    duration_minutes: number;
  };
};

const StudentQuizHistory: React.FC = () => {
  // State management
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  // Fetch student information and quiz results on component mount
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

  // Fetch quiz results from Supabase
  const fetchQuizResults = async (userId: string) => {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        id,
        student_id,
        quiz_id,
        submitted_at,
        score,
        total_questions,
        correct_answers,
        quiz:quizzes (
          id,
          title,
          duration_minutes
        )
      `)
      .eq('student_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      return;
    }

    const formattedResults: QuizResult[] = data.map((item: any) => ({
      ...item,
      quiz: Array.isArray(item.quiz) ? item.quiz[0] : item.quiz
    }));

    setQuizResults(formattedResults);
  };

  // Sort quiz results based on selected criteria
  const sortedResults = [...quizResults].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "date") return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    return 0;
  });

  // Helper function to determine badge color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500 text-white";
    if (score >= 70) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  // Calculate average score for all quizzes
  const calculateAverageScore = () => {
    if (quizResults.length === 0) return 0;
    const totalScore = quizResults.reduce((sum, quiz) => sum + quiz.score, 0);
    return totalScore / quizResults.length;
  };

  // Prepare data for Google Charts
  const getPerformanceOverviewData = () => {
    return [
      ["Quiz", "Score"],
      ...quizResults.map(result => [result.quiz.title, result.score])
    ];
  };

  const getAverageScoreData = () => {
    const averageScore = calculateAverageScore();
    return [
      ["Category", "Percentage"],
      ["Average Score", averageScore],
      ["Remaining", 100 - averageScore]
    ];
  };

  // Navigation handler for quiz details
  const handleViewDetails = (quizId: string) => {
    router.push(`/stdinbox/${quizId}`);
  };

  // Chart configuration options
  const performanceChartOptions = {
    title: "Performance Overview",
    pieHole: 0.4,
    is3D: true,
    pieStartAngle: 100,
    sliceVisibilityThreshold: 0.02,
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: {
        color: "#233238",
        fontSize: 14,
      },
    },
    colors: ["#8AD1C2", "#9F8AD1", "#D18A99", "#BCD18A", "#D1C28A", "#D1AA8A", "#8AA2D1", "#D18AB4", "#8AD1B4", "#D1CF8A"],
  };

  const averageScoreChartOptions = {
    title: "Average Score",
    pieHole: 0.4,
    is3D: false,
    pieStartAngle: 100,
    slices: {
      0: { color: "#4CAF50" },
      1: { color: "#E0E0E0" }
    },
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: {
        color: "#233238",
        fontSize: 14,
      },
    },
  };

  // Render empty state when no quizzes are available
  const renderEmptyState = () => (
    <Card className="text-center py-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg
          className="w-32 h-32 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <Title className="text-xl font-semibold text-gray-700">No Quizzes Completed Yet</Title>
        <Text className="text-gray-500 max-w-sm">
          You haven't completed any quizzes yet. Start taking quizzes to see your performance analytics here!
        </Text>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => router.push('/available-quizzes')}
          className="mt-4"
        >
          View Available Quizzes
        </Button>
      </div>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Main render
  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <Title className="text-2xl font-bold text-gray-800 mb-2">Quiz History</Title>
        <Text className="text-gray-600 mb-6">View and analyze your quiz performance</Text>

        {quizResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <Flex justifyContent="start" alignItems="center" className="mb-4">
                  <ChartPieIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <Title className="text-lg font-semibold">Performance Overview</Title>
                </Flex>
                <Chart
                  chartType="PieChart"
                  data={getPerformanceOverviewData()}
                  options={performanceChartOptions}
                  width={"100%"}
                  height={"300px"}
                />
              </Card>
              <Card>
                <Flex justifyContent="start" alignItems="center" className="mb-4">
                  <BookOpenIcon className="h-6 w-6 text-green-500 mr-2" />
                  <Title className="text-lg font-semibold">Average Score</Title>
                </Flex>
                <Chart
                  chartType="PieChart"
                  data={getAverageScoreData()}
                  options={averageScoreChartOptions}
                  width={"100%"}
                  height={"300px"}
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
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <Flex justifyContent="between" alignItems="center">
                        <div>
                          <Title className="text-lg font-semibold mb-2">{result.quiz.title}</Title>
                          <Badge 
                            size="xl"
                            className={`${getScoreColor(result.score)} px-3 py-1 rounded-full mb-2`}
                          >
                            Score: {result.score.toFixed(2)}/100 points
                          </Badge>
                        </div>
                        <Button onClick={() => handleViewDetails(result.quiz_id)}>
                          View Details
                        </Button>
                      </Flex>
                      <Flex justifyContent="start" alignItems="center" className="mt-2">
                        <Text className="text-sm text-gray-600 mr-4">
                          <ClockIcon className="inline-block h-4 w-4 mr-1" />
                          {result.quiz.duration_minutes} mins
                        </Text>
                        <Text className="text-sm text-gray-600 mr-4">
                          <AcademicCapIcon className="inline-block h-4 w-4 mr-1" />
                          {result.total_questions} questions
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {new Date(result.submitted_at).toLocaleDateString()}
                        </Text>
                      </Flex>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentQuizHistory;