import Link from 'next/link';
import { useState } from 'react';

const StudentInbox = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30`}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4 space-y-2">
          <ul className="space-y-2">
            <li>
              <Link href="/studentdash" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/stdquiz" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">My Quiz</a>
              </Link>
            </li>
            <li>
              <Link href="/studentprofile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li>
              <Link href="/stdinbox" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Inbox</a>
              </Link>
            </li>
            <li>
              <Link href="/stdsettings" legacyBehavior>
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
          <h1 className="text-2xl font-bold">Inbox</h1>
          <div className="flex items-center">
            <img src="/ZabirHD.png" alt="User profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">SWE22070001</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex mt-4">
          {/* Message List */}
          <div className="w-1/3 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {/* Sample message items */}
              <li className="p-4 hover:bg-gray-50 cursor-pointer font-bold">
                <div className="flex justify-between">
                  <span>Professor Smith</span>
                  <span className="text-sm text-gray-500">2024-07-15</span>
                </div>
                <div className="text-sm text-gray-600">Quiz Reminder</div>
              </li>
              <li className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between">
                  <span>System Notification</span>
                  <span className="text-sm text-gray-500">2024-07-14</span>
                </div>
                <div className="text-sm text-gray-600">New Quiz Available</div>
              </li>
              <li className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between">
                  <span>Study Group</span>
                  <span className="text-sm text-gray-500">2024-07-13</span>
                </div>
                <div className="text-sm text-gray-600">Study Session</div>
              </li>
            </ul>
          </div>

          {/* Message Content */}
          <div className="w-2/3 bg-white rounded-lg shadow-md ml-4 p-6">
            <h2 className="text-xl font-semibold mb-2">Quiz Reminder</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>From: Professor Smith</span>
              <span>2024-07-15</span>
            </div>
            <p className="text-gray-800">Don&apos;t forget about the upcoming quiz on Monday!</p>
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInbox;