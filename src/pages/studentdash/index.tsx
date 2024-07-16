import Link from 'next/link';
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
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4">
          <ul>
            <li className="mb-2">
              <Link href="/" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/profile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/inbox" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Inbox</a>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/settings" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Settings</a>
              </Link>
            </li>
            <li className="mt-auto mb-2">
              <Link href="/" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Logout</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
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
