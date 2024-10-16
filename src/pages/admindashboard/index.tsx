import React, { useState, useEffect } from 'react';
import AdminLayout from "@/comps/admin-layout";
import { UserIcon, ClipboardListIcon, AcademicCapIcon, ChartBarIcon } from '@heroicons/react/outline';
import { Tab } from '@headlessui/react';
import {
  Card,
  Title,
  Text,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  List,
  ListItem,
  Bold,
  ProgressBar,
  Grid,
  Col
} from "@tremor/react";
import { createClient } from '../../../utils/supabase/component';

interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  activeTeachers: number;
  completedQuizzes: number;
}

interface RecentActivity {
  action: string;
  subject: string;
  time: string;
}

interface TopPerformingQuiz {
  name: string;
  completions: number;
  avgScore: number;
}

interface RecentUser {
  name: string;
  email: string;
  role: string;
}

interface RecentQuiz {
  name: string;
  creator: string;
  status: string;
}

interface QuizSubmission {
  quiz_id: string;
  quizzes: {
    title: string;
  };
  score: number;
}

interface QuizData {
  title: string;
  teachers: {
    name: string;
  } | null;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuizzes: 0,
    activeTeachers: 0,
    completedQuizzes: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [topQuizzes, setTopQuizzes] = useState<TopPerformingQuiz[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Fetch total users (students + teachers)
      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentError) throw studentError;

      const { count: teacherCount, error: teacherError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teacherError) throw teacherError;

      const totalUsers = (studentCount || 0) + (teacherCount || 0);

      // Fetch total quizzes
      const { count: totalQuizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });
      
      if (quizError) throw quizError;

      // Fetch active teachers (assuming all teachers in the table are active)
      const activeTeachers = teacherCount || 0;

      // Fetch completed quizzes (unique quiz submissions)
      const { count: completedQuizzes, error: submissionError } = await supabase
        .from('quiz_submissions')
        .select('quiz_id', { count: 'exact', head: true })
        .not('score', 'is', null);
      
      if (submissionError) throw submissionError;

      setStats({
        totalUsers,
        totalQuizzes: totalQuizzes || 0,
        activeTeachers,
        completedQuizzes: completedQuizzes || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const activities: RecentActivity[] = data.map(activity => ({
        action: activity.action,
        subject: activity.subject,
        time: formatRelativeTime(activity.created_at)
      }));

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchTopPerformingQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select(`
          quiz_id,
          quizzes (title),
          score
        `)
        .order('score', { ascending: false })
        .limit(30);
  
      if (error) throw error;
  
      const quizzes: TopPerformingQuiz[] = (data as unknown as QuizSubmission[]).reduce((acc, submission) => {
        const quizTitle = submission.quizzes.title;
        const existingQuiz = acc.find(q => q.name === quizTitle);
        if (existingQuiz) {
          existingQuiz.completions++;
          existingQuiz.avgScore = (existingQuiz.avgScore * (existingQuiz.completions - 1) + submission.score) / existingQuiz.completions;
        } else {
          acc.push({
            name: quizTitle,
            completions: 1,
            avgScore: submission.score
          });
        }
        return acc;
      }, [] as TopPerformingQuiz[]);
  
      setTopQuizzes(quizzes.slice(0, 3));
    } catch (error) {
      console.error('Error fetching top performing quizzes:', error);
    }
  };

  const fetchDailyActiveUsers = async () => {
    try {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
      const { count, error } = await supabase
        .from('user_activities')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', yesterday)
        .limit(1);

      if (error) throw error;

      setDailyActiveUsers(count || 0);
    } catch (error) {
      console.error('Error fetching daily active users:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const usersData = await Promise.all(data.map(async (user) => {
        const { data: userData, error: userError } = await supabase
          .from(user.role === 'student' ? 'students' : 'teachers')
          .select('name, email')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        return {
          name: userData.name,
          email: userData.email,
          role: user.role
        };
      }));

      setRecentUsers(usersData);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  const fetchRecentQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          title,
          teachers (name),
          status
        `)
        .order('created_at', { ascending: false })
        .limit(5);
  
      if (error) throw error;
  
      const quizzes: RecentQuiz[] = (data as unknown as QuizData[]).map(quiz => ({
        name: quiz.title,
        creator: quiz.teachers?.name || 'Unknown',
        status: quiz.status
      }));
  
      setRecentQuizzes(quizzes);
    } catch (error) {
      console.error('Error fetching recent quizzes:', error);
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (error || !data) {
          console.error('User is not an admin:', error);
          // Handle non-admin user (e.g., redirect to login page)
        } else {
          fetchDashboardStats();
          fetchRecentActivities();
          fetchTopPerformingQuizzes();
          fetchDailyActiveUsers();
          fetchRecentUsers();
          fetchRecentQuizzes();
        }
      } else {
        console.error('No user authenticated');
        // Handle unauthenticated user (e.g., redirect to login page)
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
        {/* Welcome Message and Create Quiz Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome back, Admin!
            </h2>
            <p className="text-gray-600">
              Here&apos;s an overview of the platform&apos;s performance.
            </p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition">
            Create New Quiz
          </button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <p>Loading stats...</p>
        ) : (
          <Grid numItemsLg={4} className="gap-6 mb-8">
            {[
              { title: "Total Users", value: stats.totalUsers, icon: UserIcon, color: "blue" },
              { title: "Total Quizzes", value: stats.totalQuizzes, icon: ClipboardListIcon, color: "green" },
              { title: "Active Teachers", value: stats.activeTeachers, icon: AcademicCapIcon, color: "yellow" },
              { title: "Completed Quizzes", value: stats.completedQuizzes, icon: ChartBarIcon, color: "rose" },
            ].map((item) => (
              <Card key={item.title} decoration="top" decorationColor={item.color}>
                <Flex justifyContent="start" className="space-x-4">
                  <item.icon className="h-8 w-8" />
                  <div className="truncate">
                    <Text className="text-gray-700">{item.title}</Text>
                    <Title className="text-gray-900">{item.value}</Title>
                  </div>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}

        {/* Recent Activity and Top Performing Quizzes */}
        <Grid numItemsLg={2} className="gap-8 mb-8">
          <Card>
            <Title className="text-gray-900">Recent Activity</Title>
            <List className="mt-4">
              {recentActivities.map((activity, index) => (
                <ListItem key={index}>
                  <Flex justifyContent="start" className="truncate space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="truncate">
                      <Text className="truncate font-semibold text-gray-900">
                        {activity.action}
                      </Text>
                      <Text className="truncate text-gray-600">
                        {activity.subject} • {activity.time}
                      </Text>
                    </div>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Card>

          <Card>
            <Title className="text-gray-900">Top Performing Quizzes</Title>
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-gray-900">Quiz Name</TableHeaderCell>
                  <TableHeaderCell className="text-right text-gray-900">Completions</TableHeaderCell>
                  <TableHeaderCell className="text-right text-gray-900">Avg. Score</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topQuizzes.map((quiz) => (
                  <TableRow key={quiz.name}>
                    <TableCell className="text-gray-900">{quiz.name}</TableCell>
                    <TableCell className="text-right text-gray-700">{quiz.completions}</TableCell>
                    <TableCell className="text-right">
                      <Badge color="green" className="text-white font-medium">
                        {quiz.avgScore.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* User Engagement */}
        <Card className="mb-8">
          <Title className="text-gray-900">User Engagement</Title>
          <Flex className="mt-4">
            <Text className="text-gray-700">
              <Bold>Daily Active Users:</Bold> {dailyActiveUsers}
            </Text>
          </Flex>
          <ProgressBar value={dailyActiveUsers / stats.totalUsers * 100} className="mt-2" />
        </Card>

        {/* Recent Users and Quizzes */}
        <Card>
          <Tab.Group>
          <Tab.List className="flex space-x-4 border-b">
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-gray-900'
                }`
              }>
                Recent Users
              </Tab>
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-gray-900'
                }`
              }>
                Recent Quizzes
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-gray-900">Name</TableHeaderCell>
                      <TableHeaderCell className="text-gray-900">Email</TableHeaderCell>
                      <TableHeaderCell className="text-gray-900">Role</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell className="text-gray-900">{user.name}</TableCell>
                        <TableCell className="text-gray-700">{user.email}</TableCell>
                        <TableCell>
                          <Badge color={user.role === 'student' ? 'blue' : 'green'} className="text-white font-medium">
                            {user.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Tab.Panel>
              <Tab.Panel>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-gray-900">Quiz Name</TableHeaderCell>
                      <TableHeaderCell className="text-gray-900">Creator</TableHeaderCell>
                      <TableHeaderCell className="text-gray-900">Status</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentQuizzes.map((quiz) => (
                      <TableRow key={quiz.name}>
                        <TableCell className="text-gray-900">{quiz.name}</TableCell>
                        <TableCell className="text-gray-700">{quiz.creator}</TableCell>
                        <TableCell>
                          <Badge color={quiz.status === 'active' ? 'green' : 'yellow'} className="text-white font-medium">
                            {quiz.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;