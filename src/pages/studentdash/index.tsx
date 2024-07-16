import Link from 'next/link';

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
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="flex items-center justify-end bg-white p-4 shadow-md">
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
        <div className="flex-1 p-4 overflow-y-auto">
          <h1 className="text-2xl font-bold text-center mb-4">Welcome to your Dashboard!</h1>

          {/* Upcoming Quizzes Table */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Upcoming Quiz</h2>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">Algebra Quiz</td>
                  <td className="px-6 py-4">Sept 10</td>
                </tr>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">History Quiz</td>
                  <td className="px-6 py-4">Sept 15</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-6 py-4">Science Quiz</td>
                  <td className="px-6 py-4">Sept 20</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recent Quizzes Table */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">Recent Quiz</h2>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Score</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">Math Quiz</td>
                  <td className="px-6 py-4">85%</td>
                  <td className="px-6 py-4">Aug 25</td>
                </tr>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">English Quiz</td>
                  <td className="px-6 py-4">78%</td>
                  <td className="px-6 py-4">Aug 18</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-6 py-4">Physics Quiz</td>
                  <td className="px-6 py-4">90%</td>
                  <td className="px-6 py-4">Aug 12</td>
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
