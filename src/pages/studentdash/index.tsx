// pages/studentdash/index.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  HomeIcon,
  ClipboardCheckIcon,
  InboxIcon,
  UserIcon,
  CogIcon,
  ArrowLeftIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/outline";

import { QuizCard } from "@/ui/quiz-card";
import { HoveredLink } from "@/ui/hovered-link";
import WeeklyCalendar from "@/ui/weekly-calendar";

import { createClient } from "../../../utils/supabase/server-props";
import { createClient as createClientComp } from "../../../utils/supabase/component";
import type { GetServerSidePropsContext } from "next";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

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

const quizzes: Quiz[] = [
  {
    title: "Web Development Basics",
    description: "Test your knowledge of HTML, CSS, and JavaScript fundamentals",
    icon: "/web-dev-icon.png",
    questions: 20,
    duration: "30 minutes",
    difficulty: "Beginner",
    category: "Web Development",
  },
  {
    title: "Data Structures",
    description: "Challenge yourself with questions on arrays, linked lists, trees, and more",
    icon: "/data-structures-icon.png",
    questions: 25,
    duration: "45 minutes",
    difficulty: "Intermediate",
    category: "Computer Science",
  },
  {
    title: "Machine Learning Concepts",
    description: "Explore your understanding of ML algorithms and techniques",
    icon: "/ml-icon.png",
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

const StudentDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const supabasecomp = createClientComp();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabasecomp.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      router.push("/signin");
    }
  };

  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", href: "/studentdash", icon: HomeIcon },
    { name: "Student Quiz", href: "/stdquiz", icon: ClipboardCheckIcon },
    { name: "Student Inbox", href: "/stdinbox", icon: InboxIcon },
    { name: "Student Profile", href: "/studentprofile", icon: UserIcon },
    { name: "Student Settings", href: "/stdsettings", icon: CogIcon },
  ];

  const SidebarItem: React.FC<{ item: SidebarItem; isActive: boolean; isOpen: boolean }> = ({ item, isActive, isOpen }) => (
    <Link href={item.href} passHref>
      <div
        className={`flex items-center p-2 rounded-lg cursor-pointer ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100 text-gray-700"
        } transition-colors duration-200`}
        onClick={() => {
          setActiveItem(item.name.toLowerCase());
          if (isMobile) setIsSidebarOpen(false);
        }}
      >
        <item.icon className="w-6 h-6" />
        <span className={`ml-3 ${isOpen ? 'block' : 'hidden'}`}>{item.name}</span>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-20 bg-white p-2 rounded-md shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? isSidebarOpen
              ? "fixed inset-y-0 left-0 z-10 w-64"
              : "hidden"
            : "relative"
        } md:block transition-all duration-300 ease-in-out`}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
      >
        <div
          className={`h-full bg-white shadow-md transition-all duration-300 ease-in-out ${
            isSidebarOpen || isMobile ? "w-64" : "w-16"
          } flex flex-col justify-between`}
        >
          {isMobile && (
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XIcon className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center justify-center h-16 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
            </div>
            <nav className="flex flex-col space-y-2 px-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.name}
                  item={item}
                  isActive={activeItem === item.name.toLowerCase()}
                  isOpen={isSidebarOpen || isMobile}
                />
              ))}
            </nav>
          </div>
          <div className="px-2 mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-6 h-6" />
              <span className={`ml-3 ${isSidebarOpen || isMobile ? 'block' : 'hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col p-4 overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Quiz Dashboard</h1>
          <div className="flex items-center">
            <Image
              src="/ZabirHD.png"
              alt="User profile"
              width={40}
              height={40}
              className="rounded-full mr-4"
            />
            <div>
              <div className="font-bold">Syed Zabir</div>
              <div className="text-gray-600">SWE22070167</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
          {/* Welcome Message and Calendar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome back, John!
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
              <HoveredLink href="#">All</HoveredLink>
              <HoveredLink href="#">Web Development</HoveredLink>
              <HoveredLink href="#">Computer Science</HoveredLink>
              <HoveredLink href="#">Data Science</HoveredLink>
              <HoveredLink href="#">Artificial Intelligence</HoveredLink>
            </div>
          </div>

          {/* Available Quizzes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <QuizCard key={index} quiz={quiz} />
              ))}
            </div>
          </div>

          {/* Combined Upcoming Quizzes and Recent Quiz Results */}
          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Upcoming Quizzes and Recent Results</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Quiz Name</th>
                  <th className="text-left">Date</th>
                  <th className="text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {upcomingQuizzes.map((quiz, index) => (
                  <tr key={`upcoming-${index}`}>
                    <td>{quiz.name}</td>
                    <td>{quiz.date}</td>
                    <td>Upcoming</td>
                  </tr>
                ))}
                <tr>
                  <td>JavaScript Basics</td>
                  <td>June 28, 2024</td>
                  <td>85%</td>
                </tr>
                <tr>
                  <td>Python Fundamentals</td>
                  <td>June 25, 2024</td>
                  <td>92%</td>
                </tr>
                <tr>
                  <td>HTML and CSS</td>
                  <td>June 20, 2024</td>
                  <td>78%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Study Streak */}
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
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
      </div>
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
}

export default StudentDashboard;