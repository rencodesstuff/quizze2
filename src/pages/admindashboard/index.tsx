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

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuizzes: 0,
    activeTeachers: 0,
    completedQuizzes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

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
              {[
                { action: "New user registered", subject: "John Doe", time: "2 hours ago" },
                { action: "Quiz created", subject: "Advanced Mathematics", time: "5 hours ago" },
                { action: "Course updated", subject: "Introduction to AI", time: "1 day ago" },
              ].map((activity, index) => (
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
                {[
                  { name: "Web Development Basics", completions: 789, avgScore: 85 },
                  { name: "Data Structures", completions: 654, avgScore: 78 },
                  { name: "Machine Learning Concepts", completions: 542, avgScore: 92 },
                ].map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-right text-gray-700">{item.completions}</TableCell>
                    <TableCell className="text-right">
                      <Badge color="green" className="text-white font-medium">
                        {item.avgScore}%
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
              <Bold>Daily Active Users:</Bold> 2,546
            </Text>
          </Flex>
          <ProgressBar value={45} className="mt-2" />
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
                    {[
                      { name: "Alice Johnson", email: "alice@example.com", role: "Student" },
                      { name: "Bob Smith", email: "bob@example.com", role: "Teacher" },
                      { name: "Charlie Brown", email: "charlie@example.com", role: "Student" },
                    ].map((user) => (
                      <TableRow key={user.name}>
                        <TableCell className="text-gray-900">{user.name}</TableCell>
                        <TableCell className="text-gray-700">{user.email}</TableCell>
                        <TableCell>
                          <Badge color={user.role === 'Student' ? 'blue' : 'green'} className="text-white font-medium">
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
                    {[
                      { name: "JavaScript Fundamentals", creator: "Dr. Smith", status: "Active" },
                      { name: "Python for Beginners", creator: "Prof. Johnson", status: "Draft" },
                      { name: "Advanced Database Concepts", creator: "Dr. Davis", status: "Active" },
                    ].map((quiz) => (
                      <TableRow key={quiz.name}>
                        <TableCell className="text-gray-900">{quiz.name}</TableCell>
                        <TableCell className="text-gray-700">{quiz.creator}</TableCell>
                        <TableCell>
                          <Badge color={quiz.status === 'Active' ? 'green' : 'yellow'} className="text-white font-medium">
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