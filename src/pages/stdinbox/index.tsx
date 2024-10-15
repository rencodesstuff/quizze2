import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text, Flex, Select, SelectItem, Badge, Grid, Button } from "@tremor/react";
import { ClockIcon, AcademicCapIcon, SortAscendingIcon, ChartPieIcon, BookOpenIcon } from "@heroicons/react/outline";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";
import { useRouter } from 'next/router';
import { Chart } from "react-google-charts";

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
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const router = useRouter();

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

  const sortedResults = [...quizResults].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "date") return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    return 0;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500 text-white";
    if (score >= 70) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const calculateAverageScore = () => {
    if (quizResults.length === 0) return 0;
    const totalScore = quizResults.reduce((sum, quiz) => sum + quiz.score, 0);
    return totalScore / quizResults.length;
  };

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

  const handleViewDetails = (quizId: string) => {
    router.push(`/stdinbox/${quizId}`);
  };

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
      </div>
    </StudentLayout>
  );
};

export default StudentQuizHistory;