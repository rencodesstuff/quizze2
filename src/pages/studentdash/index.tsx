import React, { useState, useEffect } from "react";
import StudentLayout from "@/comps/student-layout";
import { HoveredLink } from "@/ui/hovered-link";
import WeeklyCalendar from "@/ui/weekly-calendar";
import { Tab } from '@headlessui/react';
import { createClient } from "../../../utils/supabase/server-props";
import { createClient as createClientBrowser } from "../../../utils/supabase/component";
import type { GetServerSidePropsContext } from "next";
import { QuizCard } from "@/ui/quiz-card";

interface Quiz {
  title: string;
  description: string;
  icon: string;
  questions: number;
  duration: string;
  difficulty: string;
  category: string;
}

interface QuizSubmission {
  quiz_title: string;
  submitted_at: string;
}

interface UpcomingQuiz {
  id: string;
  title: string;
  release_date: string | null;
}

interface DatabaseQuizResult {
  submitted_at: string;
  score: number;
  total_questions: number;
  quizzes: {
    title: string;
  } | null;
}

interface StudentDashboardProps {
  user: any;
  studentName: string;
  studentId: string;
  recentQuizzes: QuizSubmission[];
  upcomingQuizzes: UpcomingQuiz[];
  studyStreak: number;
}

const quizzes: Quiz[] = [
  {
    title: "Web Development Basics",
    description: "Test your knowledge of HTML, CSS, and JavaScript fundamentals",
    icon: "/web.jpg",
    questions: 20,
    duration: "30 minutes",
    difficulty: "Beginner",
    category: "Web Development",
  },
  {
    title: "Data Structures",
    description: "Challenge yourself with questions on arrays, linked lists, trees, and more",
    icon: "/ds.jpg",
    questions: 25,
    duration: "45 minutes",
    difficulty: "Intermediate",
    category: "Computer Science",
  },
  {
    title: "Machine Learning Concepts",
    description: "Explore your understanding of ML algorithms and techniques",
    icon: "/20945347.jpg",
    questions: 30,
    duration: "60 minutes",
    difficulty: "Advanced",
    category: "Artificial Intelligence",
  },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, 
  studentName, 
  studentId, 
  recentQuizzes = [],
  upcomingQuizzes = [],
  studyStreak: initialStudyStreak = 0
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [studyStreak, setStudyStreak] = useState(initialStudyStreak);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateLoginStreak = async () => {
      const supabase = createClientBrowser();
      
      try {
        setIsLoading(true);
        // Get current user's last login
        const { data: streakData, error: streakError } = await supabase
          .from('login_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (streakError && streakError.code === 'PGRST116') {
          // No streak record exists, create first one
          const { data: newStreak } = await supabase
            .from('login_streaks')
            .insert([{
              user_id: user.id,
              last_login_date: today.toISOString(),
              current_streak: 1
            }])
            .select()
            .single();
            
          if (newStreak) {
            setStudyStreak(1);
          }
          return;
        }

        if (streakData) {
          const lastLogin = new Date(streakData.last_login_date);
          lastLogin.setHours(0, 0, 0, 0);

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          // Only update if the last login was not today
          if (lastLogin.getTime() !== today.getTime()) {
            let newStreak;
            if (lastLogin.getTime() === yesterday.getTime()) {
              // If last login was yesterday, increment streak
              newStreak = streakData.current_streak + 1;
            } else {
              // If last login was before yesterday, reset streak to 0
              newStreak = 0;
            }

            const { data: updatedStreak } = await supabase
              .from('login_streaks')
              .update({
                last_login_date: today.toISOString(),
                current_streak: newStreak
              })
              .eq('user_id', user.id)
              .select()
              .single();
              
            if (updatedStreak) {
              setStudyStreak(newStreak);
            }
          }
        }
      } catch (error) {
        console.error('Error updating login streak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      updateLoginStreak();
    }
  }, [user?.id]);

  const categories = ["All", ...new Set(quizzes.map(quiz => quiz.category))];

  const filteredQuizzes = selectedCategory === "All" 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Updated loading state to match flashcards page
  if (isLoading) {
    return (
      <StudentLayout studentName="" studentId="">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
        {/* Welcome Message and Calendar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome back, {studentName}!
            </h2>
            <p className="text-gray-600">
              Ready to challenge yourself with some quizzes today?
            </p>
          </div>
          <WeeklyCalendar />
        </div>

        {/* Quiz Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quiz Categories</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <HoveredLink 
                key={category} 
                href="#" 
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "text-blue-600 font-bold" : ""}
              >
                {category}
              </HoveredLink>
            ))}
          </div>
        </div>

        {/* Available Quizzes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard 
                key={quiz.title} 
                quiz={quiz}
              />
            ))}
            {filteredQuizzes.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No quizzes available in this category yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Quizzes and Upcoming Quizzes */}
        <div className="mb-8">
          <Tab.Group>
            <Tab.List className="flex space-x-4 border-b">
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`
              }>
                Upcoming Quizzes
              </Tab>
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`
              }>
                Recent Quizzes
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <ul className="space-y-2">
                  {(upcomingQuizzes || []).map((quiz) => (
                    <li key={quiz.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{quiz.title}</span>
                      <span className="text-gray-600">
                        {quiz.release_date ? formatDate(quiz.release_date) : 'Date not set'}
                      </span>
                    </li>
                  ))}
                  {(!upcomingQuizzes || upcomingQuizzes.length === 0) && (
                    <li className="text-gray-500 text-center py-4">
                      No upcoming quizzes at the moment
                    </li>
                  )}
                </ul>
              </Tab.Panel>
              <Tab.Panel>
                <ul className="space-y-2">
                  {(recentQuizzes || []).map((result, index) => (
                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{result.quiz_title}</span>
                      <span className="text-gray-600">{formatDate(result.submitted_at)}</span>
                    </li>
                  ))}
                  {(!recentQuizzes || recentQuizzes.length === 0) && (
                    <li className="text-gray-500 text-center py-4">
                      No recent quizzes
                    </li>
                  )}
                </ul>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Study Streak */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Study Streak</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-4">{studyStreak}</div>
            <div>
              <p className="font-semibold">Days in a row</p>
              <p className="text-gray-600">Keep it up!</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  // Fetch student details
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('name, student_id')
    .eq('id', user.id)
    .single();

  if (studentError) {
    console.error('Error fetching student data:', studentError);
  }

  // Fetch upcoming quizzes
  const { data: upcomingQuizzes = [], error: upcomingError } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      release_date
    `)
    .gt('release_date', new Date().toISOString())
    .order('release_date', { ascending: true })
    .limit(5);

  // Fetch recent quiz submissions
  const { data: rawResults = [], error: resultsError } = await supabase
    .from('quiz_submissions')
    .select(`
      submitted_at,
      quizzes!inner (
        title
      )
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(5);

  // Transform quiz submissions data with proper typing
  const formattedResults: QuizSubmission[] = (rawResults || []).map((result: any) => ({
    quiz_title: result.quizzes?.title || 'Unknown Quiz',
    submitted_at: result.submitted_at
  }));

  // Fetch current login streak
  const { data: streakData = { current_streak: 0 }, error: streakError } = await supabase
    .from('login_streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .single();

  if (streakError && streakError.code !== 'PGRST116') {
    console.error('Error fetching streak data:', streakError);
  }

  return {
    props: {
      user,
      studentName: studentData?.name || 'Student',
      studentId: studentData?.student_id || '',
      recentQuizzes: formattedResults,
      upcomingQuizzes: upcomingQuizzes || [],
      studyStreak: streakData?.current_streak || 0
    },
  };
}

export default StudentDashboard;