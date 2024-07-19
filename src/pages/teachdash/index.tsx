import Link from 'next/link';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Registering components for the chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
  datasets: [
    {
      label: 'Average Score',
      data: [75, 82, 68, 90, 85],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
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
      text: 'Quiz Performance Overview',
    },
  },
};

const TeacherDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30`}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4 space-y-2">
          <ul className="space-y-2">
            <li>
              <Link href="/teachdash" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/createquiz" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Create Quiz</a>
              </Link>
            </li>
            <li>
              <Link href="/myquizzes" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">My Quizzes</a>
              </Link>
            </li>
            <li>
              <Link href="/stdscores" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Student Scores</a>
              </Link>
            </li>
            <li>
              <Link href="/teachprofile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li>
              <Link href="/teachsettings" legacyBehavior>
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
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center">
            <img src="/TeacherAvatar.png" alt="Teacher profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">Dr. Smith</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-3 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Welcome, Dr. Smith!</h2>
          </div>
          
          {/* Chart and Calendar */}
          <div className="md:col-span-2 bg-white p-4 shadow rounded-lg">
            <Bar data={data} options={options} />
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              editable
              selectable
              events={[
                { title: 'Math Quiz', date: '2024-07-10' },
                { title: 'CS101 Quiz', date: '2024-07-15' },
                { title: 'AI Basics Quiz', date: '2024-07-20' },
              ]}
            />
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Active Quizzes</h3>
              <p className="text-3xl font-bold">5</p>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Draft Quizzes</h3>
              <p className="text-3xl font-bold">3</p>
            </div>
            <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Total Students</h3>
              <p className="text-3xl font-bold">150</p>
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">Avg. Score</h3>
              <p className="text-3xl font-bold">78%</p>
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="md:col-span-2 bg-white shadow rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Recent Quizzes</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Quiz Name</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Math Quiz</td>
                  <td className="p-2">July 10, 2024</td>
                  <td className="p-2"><span className="bg-green-200 text-green-800 px-2 py-1 rounded">Active</span></td>
                  <td className="p-2">
                    <button className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">CS101 Quiz</td>
                  <td className="p-2">July 15, 2024</td>
                  <td className="p-2"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Draft</span></td>
                  <td className="p-2">
                    <button className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button className="text-green-600 hover:underline">Publish</button>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">AI Basics Quiz</td>
                  <td className="p-2">July 20, 2024</td>
                  <td className="p-2"><span className="bg-green-200 text-green-800 px-2 py-1 rounded">Active</span></td>
                  <td className="p-2">
                    <button className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Performing Students */}
          <div className="md:col-span-1 bg-white shadow rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Top Performing Students</h2>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span>Syed Zabir</span>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">95%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Shahmi</span>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">92%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Aiman</span>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">90%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Syasya</span>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">88%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;