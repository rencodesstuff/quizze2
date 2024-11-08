import React, { useEffect, useState } from "react";
import AdminLayout from "@/comps/admin-layout";
import { createClient } from "../../../utils/supabase/component";
import { Analytics } from "@vercel/analytics/react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import {
  UsersIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/outline";

// ViewBox type for chart
interface ViewBoxType {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  width: number;
  height: number;
}

// Types for statistics
interface ModStats {
  totalUsers: number;
  totalQuizzes: number;
  activeUsers: number;
  reportedViolations: number;
  userTypes: {
    type: string;
    count: number;
    fill: string;
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

const CHART_COLORS = {
  students: "hsl(215, 70%, 50%)", // Blue
  teachers: "hsl(145, 70%, 50%)", // Green
  admins: "hsl(280, 70%, 50%)", // Purple
};

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ModStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchModStats = async () => {
      try {
        setIsLoading(true);

        // Fetch user counts
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: adminCount },
        ] = await Promise.all([
          supabase.from("students").select("*", { count: "exact" }),
          supabase.from("teachers").select("*", { count: "exact" }),
          supabase.from("admins").select("*", { count: "exact" }),
        ]);

        // Process user types with colors
        const userTypesWithColors = [
          {
            type: "Students",
            count: studentCount || 0,
            fill: CHART_COLORS.students,
          },
          {
            type: "Teachers",
            count: teacherCount || 0,
            fill: CHART_COLORS.teachers,
          },
          {
            type: "Administrators",
            count: adminCount || 0,
            fill: CHART_COLORS.admins,
          },
        ].sort((a, b) => b.count - a.count);

        // Fetch other data
        const { data: violations } = await supabase
          .from("quiz_security_violations")
          .select("student_name, quiz_title, violation_type, occurred_at")
          .order("occurred_at", { ascending: false })
          .limit(5);

        const { count: quizCount } = await supabase
          .from("quizzes")
          .select("*", { count: "exact" });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { count: activeCount } = await supabase
          .from("quiz_submissions")
          .select("*", { count: "exact" })
          .gt("submitted_at", yesterday.toISOString());

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: activityData } = await supabase
          .from("quiz_submissions")
          .select("submitted_at")
          .gt("submitted_at", sevenDaysAgo.toISOString());

        const activityByDay = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return {
            date: dayStr,
            submissions: (activityData || []).filter(
              (sub) =>
                new Date(sub.submitted_at).toDateString() ===
                date.toDateString()
            ).length,
          };
        }).reverse();

        setData({
          totalUsers:
            (studentCount || 0) + (teacherCount || 0) + (adminCount || 0),
          totalQuizzes: quizCount || 0,
          activeUsers: activeCount || 0,
          reportedViolations: violations?.length || 0,
          userTypes: userTypesWithColors,
          recentViolations: violations || [],
          activityByDay: activityByDay,
        });
      } catch (err) {
        console.error("Error fetching moderation stats:", err);
        setError("Failed to load analytics data");
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
        <div className="text-center text-destructive p-4">
          {error || "Failed to load data"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Analytics />
      <div className="p-4 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">
            Analytics Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{data.totalUsers}</div>
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{data.totalQuizzes}</div>
                <DocumentTextIcon className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{data.activeUsers}</div>
                <ShieldCheckIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Reported Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
                  {data.reportedViolations}
                </div>
                <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.userTypes}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                    >
                      {data.userTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox) return null;
                          const { cx, cy } = viewBox as ViewBoxType;
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              <tspan
                                x={cx}
                                y={cy - 8}
                                className="text-xl font-bold"
                              >
                                {data.totalUsers}
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 8}
                                className="text-xs fill-muted-foreground"
                              >
                                Total Users
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="font-medium">{data.type}</div>
                              <div className="text-sm text-muted-foreground">
                                {data.count} users (
                                {((data.count / data.totalUsers) * 100).toFixed(
                                  1
                                )}
                                %)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-3 gap-4 w-full">
                {data.userTypes.map((type, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-sm font-medium">{type.type}</div>
                    <div className="text-lg font-bold">{type.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {((type.count / data.totalUsers) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>

          {/* Activity Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>
                Submissions over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityByDay}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Bar
                      dataKey="submissions"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="font-medium">
                                {payload[0].payload.date}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payload[0].value} submissions
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <TrendingUp className="h-4 w-4" />
                {data.activityByDay[6].submissions -
                  data.activityByDay[5].submissions >
                0
                  ? "Trending up"
                  : "Trending down"}{" "}
                from yesterday
              </div>
              <div className="text-xs text-muted-foreground">
                Total submissions:{" "}
                {data.activityByDay.reduce(
                  (acc, day) => acc + day.submissions,
                  0
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Violations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Violations</CardTitle>
            <CardDescription>
              Latest reported security incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentViolations.length > 0 ? (
                data.recentViolations.map((violation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{violation.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {violation.quiz_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-destructive font-medium">
                          {violation.violation_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(violation.occurred_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">No recent violations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
