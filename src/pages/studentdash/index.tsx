import Link from "next/link";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Registering components for the chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      label: "Quiz Scores",
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      backgroundColor: "rgb(75, 192, 192)",
      borderColor: "rgba(75, 192, 192, 0.2)",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Monthly Quiz Performance",
    },
  },
};

const StudentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("click", handleClickOutside, true);
    } else {
      document.removeEventListener("click", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isSidebarOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (!event.target) return;
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.sidebar') && !targetElement.closest('.menu-button')) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30 shadow-lg`}
      >
        <div className="p-6 text-2xl font-bold border-b border-gray-700 flex items-center">
          <svg
            className="w-8 h-8 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Quizze
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <ul className="space-y-2">
            <li>
              <Link href="/studentdash" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12h18M3 6h18M3 18h18"
                    />
                  </svg>
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/stdquiz" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5v14m-7-7h14M5 19h14M5 5h14"
                    />
                  </svg>
                  My Quiz
                </a>
              </Link>
            </li>

            <li>
              <Link href="/studentprofile" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                  </svg>
                  Profile
                </a>
              </Link>
            </li>
            <li>
              <Link href="/stdinbox" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Inbox
                </a>
              </Link>
            </li>
            <li>
              <Link href="/stdsettings" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 17a4 4 0 100-8 4 4 0 000 8zm7.92-5.62a9.05 9.05 0 00-.34-1.42l2.39-1.87a1 1 0 00.15-1.33l-2.54-3.1a1 1 0 00-1.31-.18l-2.8 1.1a8.93 8.93 0 00-1.58-.91L14 2.1a1 1 0 00-1-.1l-3.16 1.35a1 1 0 00-.57 1.28l1.1 2.8a9.05 9.05 0 00-.91 1.58L4.61 9.88a1 1 0 00-.18 1.31l2.54 3.1a1 1 0 001.33.18l2.39-1.87a9.05 9.05 0 001.42.34V18a1 1 0 001 1h3.09a1 1 0 001-1v-2.07a9.05 9.05 0 001.58-.91l2.8 1.1a1 1 0 001.31-.18l2.54-3.1a1 1 0 00-.18-1.31l-2.39-1.87z"
                    />
                  </svg>
                  Settings
                </a>
              </Link>
            </li>
            <li className="mt-auto">
              <Link href="/signin" legacyBehavior>
                <a className="flex items-center p-2 rounded hover:bg-gray-700 transition duration-150">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12H3m12 0l-4-4m4 4l-4 4m13 2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2z"
                    />
                  </svg>
                  Logout
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          <button
            className="md:hidden text-black menu-button"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center">
            <img
              src="/ZabirHD.png"
              alt="User profile"
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <div className="font-bold">SWE22070001</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-3 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Welcome to your Dashboard!</h2>
            <Link href="/joinquiz" legacyBehavior>
              <button className="py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Join Quiz
              </button>
            </Link>
          </div>
          {/* Chart and Calendar */}
          <div className="md:col-span-2 bg-white p-4 shadow rounded-lg">
            <Line data={data} options={options} />
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              editable
              selectable
              events={[
                { title: "Math Quiz", date: "2024-07-10" },
                { title: "Chemistry Quiz", date: "2024-07-15" },
                { title: "Physics Quiz", date: "2024-07-20" },
              ]}
            />
          </div>

          {/* Tables */}
          <div className="md:col-span-2 bg-white shadow rounded-lg p-4">
            <h2 className="font-semibold text-lg">Upcoming Quizzes</h2>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Math Quiz</td>
                  <td className="p-2">Sept 10</td>
                </tr>
                <tr>
                  <td className="p-2">Chemistry Quiz</td>
                  <td className="p-2">Sept 15</td>
                </tr>
                <tr>
                  <td className="p-2">Physics Quiz</td>
                  <td className="p-2">Sept 20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="md:col-span-1 bg-white shadow rounded-lg p-4">
            <h2 className="font-semibold text-lg">Recent Quizzes</h2>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">History Quiz</td>
                  <td className="p-2">85%</td>
                  <td className="p-2">Aug 25</td>
                </tr>
                <tr>
                  <td className="p-2">Literature Quiz</td>
                  <td className="p-2">78%</td>
                  <td className="p-2">Aug 20</td>
                </tr>
                <tr>
                  <td className="p-2">Geography Quiz</td>
                  <td className="p-2">90%</td>
                  <td className="p-2">Aug 15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
