import React, { useEffect, useState } from 'react';
import AdminLayout from '@/comps/admin-layout';
import { createClient } from '../../../utils/supabase/component';
import { 
  Card, 
  Title, 
  Text, 
  Grid,
  Flex,
  Metric,
  BarChart,
  DonutChart,
} from '@tremor/react';
import { 
  UsersIcon, 
  ExclamationCircleIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/outline';
import { Analytics } from '@vercel/analytics/react';

interface ModStats {
  totalUsers: number;
  totalQuizzes: number;
  activeUsers: number;
  reportedViolations: number;
  userTypes: {
    type: string;
    count: number;
  }[];
  recentViolations: {
    student_name: string;
    quiz_title: string;
    violation_type: string;
    occurred_at: string;
  }[];
  activityByDay: {
    date: string;
    submissions: number;
  }[];
}

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ModStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchModStats = async () => {
      try {
        setIsLoading(true);

        // Get user counts
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: adminCount }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact' }),
          supabase.from('teachers').select('*', { count: 'exact' }),
          supabase.from('admins').select('*', { count: 'exact' })
        ]);

        // Get recent security violations
        const { data: violations } = await supabase
          .from('quiz_security_violations')
          .select('student_name, quiz_title, violation_type, occurred_at')
          .order('occurred_at', { ascending: false })
          .limit(5);

        // Get quiz count
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact' });

        // Get active users (users who submitted in last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { count: activeCount } = await supabase
          .from('quiz_submissions')
          .select('*', { count: 'exact' })
          .gt('submitted_at', yesterday.toISOString());

        // Get activity by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: activityData } = await supabase
          .from('quiz_submissions')
          .select('submitted_at')
          .gt('submitted_at', sevenDaysAgo.toISOString());

        // Process activity data by day
        const activityByDay = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          return {
            date: dayStr,
            submissions: (activityData || []).filter(
              sub => new Date(sub.submitted_at).toDateString() === date.toDateString()
            ).length
          };
        }).reverse();

        setData({
          totalUsers: (studentCount || 0) + (teacherCount || 0) + (adminCount || 0),
          totalQuizzes: quizCount || 0,
          activeUsers: activeCount || 0,
          reportedViolations: violations?.length || 0,
          userTypes: [
            { 
              type: 'Students', 
              count: studentCount || 0,
            },
            { 
              type: 'Teachers', 
              count: teacherCount || 0,
            },
            { 
              type: 'Administrators', 
              count: adminCount || 0,
            }
          ].sort((a, b) => b.count - a.count),
          recentViolations: violations || [],
          activityByDay: activityByDay
        });

      } catch (err) {
        console.error('Error fetching moderation stats:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModStats();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600 p-4">
          {error || 'Failed to load data'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Analytics />
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Title className="text-2xl font-bold">Analytics Dashboard</Title>
          <Text className="text-gray-500">Last updated: {new Date().toLocaleString()}</Text>
        </div>

        {/* Overview Cards */}
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card 
            className="space-y-2 hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="blue"
          >
            <Flex>
              <div>
                <Text>Total Users</Text>
                <Metric>{data.totalUsers}</Metric>
              </div>
              <UsersIcon className="w-8 h-8 text-blue-500" />
            </Flex>
          </Card>

          <Card 
            className="space-y-2 hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="green"
          >
            <Flex>
              <div>
                <Text>Total Quizzes</Text>
                <Metric>{data.totalQuizzes}</Metric>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-green-500" />
            </Flex>
          </Card>

          <Card 
            className="space-y-2 hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="yellow"
          >
            <Flex>
              <div>
                <Text>Active Users (24h)</Text>
                <Metric>{data.activeUsers}</Metric>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-yellow-500" />
            </Flex>
          </Card>

          <Card 
            className="space-y-2 hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="red"
          >
            <Flex>
              <div>
                <Text>Reported Violations</Text>
                <Metric>{data.reportedViolations}</Metric>
              </div>
              <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
            </Flex>
          </Card>
        </Grid>

        {/* Charts Section */}
        <Grid numItems={1} numItemsLg={2} className="gap-6">
          {/* User Distribution */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <Title>User Distribution</Title>
            <Text className="mt-2 text-gray-500">Breakdown of user types</Text>
            <div className="mt-6 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2">
                <DonutChart
                  data={data.userTypes}
                  category="count"
                  index="type"
                  valueFormatter={(value) => `${value} users`}
                  colors={["blue", "green", "red"]}
                  className="h-80 w-full mt-4"
                  showAnimation={true}
                />
                <div className="mt-4 flex justify-center gap-6">
                  {data.userTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className={`w-4 h-4 rounded-full ${
                          type.type === 'Students' ? 'bg-blue-500' : 
                          type.type === 'Teachers' ? 'bg-green-500' : 
                          'bg-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-600">
                        {type.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-4">
                {data.userTypes.map((type, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 rounded-lg hover:shadow-md transition-all duration-200 border-l-4 ${
                      type.type === 'Students' ? 'border-blue-500 bg-blue-50' :
                      type.type === 'Teachers' ? 'border-green-500 bg-green-50' :
                      'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            type.type === 'Students' ? 'bg-blue-500' :
                            type.type === 'Teachers' ? 'bg-green-500' :
                            'bg-red-500'
                          }`}
                        />
                        <Text 
                          className={`font-semibold text-lg ${
                            type.type === 'Students' ? 'text-blue-700' :
                            type.type === 'Teachers' ? 'text-green-700' :
                            'text-red-700'
                          }`}
                        >
                          {type.type}
                        </Text>
                      </div>
                      <div className="mt-1 ml-5">
                        <div className="flex items-baseline gap-2">
                          <Text 
                            className={`text-2xl font-bold ${
                              type.type === 'Students' ? 'text-blue-700' :
                              type.type === 'Teachers' ? 'text-green-700' :
                              'text-red-700'
                            }`}
                          >
                            {type.count}
                          </Text>
                          <Text className="text-gray-600">
                            users
                          </Text>
                        </div>
                        <Text className="text-sm text-gray-600">
                          {((type.count / data.totalUsers) * 100).toFixed(1)}% of total users
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200">
                    <Text className="text-lg font-semibold">Total Users</Text>
                    <div className="flex items-baseline gap-2 mt-1">
                      <Text className="text-3xl font-bold text-gray-800">
                        {data.totalUsers}
                      </Text>
                      <Text className="text-gray-600">
                        registered users
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Activity Chart */}
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
            <Title>Daily Activity</Title>
            <Text className="mt-2 text-gray-500">Submissions over the last 7 days</Text>
            <BarChart
              className="mt-6 h-[300px]"
              data={data.activityByDay}
              index="date"
              categories={["submissions"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} submissions`}
              showLegend={false}
              showAnimation={true}
              yAxisWidth={48}
            />
          </Card>
        </Grid>

        {/* Recent Violations */}
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <Title>Recent Security Violations</Title>
          <Text className="mt-2 text-gray-500">Latest reported security incidents</Text>
          <div className="mt-6 space-y-4">
            {data.recentViolations.length > 0 ? (
              data.recentViolations.map((violation, index) => (
                <div 
                  key={index}
                  className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-l-4 border-red-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Text className="font-medium">{violation.student_name}</Text>
                      <Text className="text-sm text-gray-600">{violation.quiz_title}</Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-red-600 font-medium">{violation.violation_type}</Text>
                      <Text className="text-sm text-gray-600">
                        {new Date(violation.occurred_at).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Text className="text-gray-500">No recent violations</Text>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;