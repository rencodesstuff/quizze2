import Link from 'next/link';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { DayPicker } from 'react-day-picker';

// Registering components for the chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Quiz Scores',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 0.2)',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Monthly Quiz Performance',
    },
  },
};

const StudentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30`}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4 space-y-2">
          <ul className="space-y-2">
            <li>
              <Link href="/" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/profile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li>
              <Link href="/inbox" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Inbox</a>
              </Link>
            </li>
            <li>
              <Link href="/settings" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Settings</a>
              </Link>
            </li>
            <li className="mt-auto">
              <Link href="/signin" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Logout</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          <button className="md:hidden text-black" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center">
            <img src="/ZabirHD.png" alt="User profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">SWE22070001</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Chart and Calendar */}
          <div className="md:col-span-2 bg-white p-4 shadow rounded-lg">
            <Line data={data} options={options} />
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <DayPicker />
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
