import React, { useState } from "react";
import StudentLayout from "@/comps/student-layout";
import { QuizCard } from "@/ui/quiz-card";
import { HoveredLink } from "@/ui/hovered-link";
import WeeklyCalendar from "@/ui/weekly-calendar";
import { Tab } from '@headlessui/react';
import { createClient } from "../../../utils/supabase/server-props";
import type { GetServerSidePropsContext } from "next";

interface Quiz {
  title: string;
  description: string;
  icon: string;
  questions: number;
  duration: string;
  difficulty: string;
  category: string;
}

interface UpcomingQuiz {
  name: string;
  date: string;
}

interface StudentDashboardProps {
  user: any;
  studentName: string;
  studentId: string;
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

const upcomingQuizzes: UpcomingQuiz[] = [
  { name: "JavaScript Advanced", date: "July 15, 2024" },
  { name: "Python for Data Science", date: "July 20, 2024" },
  { name: "React Fundamentals", date: "July 25, 2024" },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, studentName, studentId }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredQuizzes = selectedCategory === "All" 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

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
            {["All", "Web Development", "Computer Science", "Data Science", "Artificial Intelligence"].map(category => (
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
            {filteredQuizzes.map((quiz, index) => (
              <QuizCard key={index} quiz={quiz} />
            ))}
          </div>
        </div>

        {/* Upcoming Quizzes and Recent Results */}
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
                Recent Results
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <ul className="space-y-2">
                  {upcomingQuizzes.map((quiz, index) => (
                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{quiz.name}</span>
                      <span className="text-gray-600">{quiz.date}</span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
              <Tab.Panel>
                <ul className="space-y-2">
                  {[
                    { name: "JavaScript Basics", date: "June 28, 2024", score: 85 },
                    { name: "Python Fundamentals", date: "June 25, 2024", score: 92 },
                    { name: "HTML and CSS", date: "June 20, 2024", score: 78 },
                  ].map((result, index) => (
                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{result.name}</span>
                      <span>{result.date}</span>
                      <span className={`font-semibold ${
                        result.score >= 90 ? 'text-green-600' : 
                        result.score >= 80 ? 'text-blue-600' : 
                        result.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{result.score}%</span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Study Streak */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Study Streak</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-4">7</div>
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

  // Fetch user details from the students table
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('name, student_id')
    .eq('id', user.id)
    .single();

  // Log any errors
  if (studentError) {
    console.error('Error fetching student data:', studentError);
  }

  return {
    props: {
      user: user,
      studentName: studentData?.name || 'Student',
      studentId: studentData?.student_id || '',
    },
  };
}

export default StudentDashboard;