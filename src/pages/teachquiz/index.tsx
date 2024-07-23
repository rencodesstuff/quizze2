import Link from 'next/link';
import { useState } from 'react';

const MyQuizzes = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for quizzes
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'Introduction to React', subject: 'Web Development', questions: 15, dateCreated: '2024-07-15' },
    { id: 2, title: 'JavaScript Basics', subject: 'Programming', questions: 20, dateCreated: '2024-07-10' },
    { id: 3, title: 'Data Structures', subject: 'Computer Science', questions: 25, dateCreated: '2024-07-05' },
    { id: 4, title: 'UI/UX Principles', subject: 'Design', questions: 18, dateCreated: '2024-06-30' },
  ]);

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
              <Link href="/teachquiz" legacyBehavior>
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
          <h1 className="text-2xl font-bold">Create Quizzes</h1>
          <div className="flex items-center">
            <img src="/TeacherAvatar.png" alt="Teacher profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">Dr. Smith</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Quiz list */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Your Quizzes</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-indigo-600 truncate">{quiz.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Subject: {quiz.subject} | Questions: {quiz.questions} | Created: {quiz.dateCreated}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Edit
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQuizzes;