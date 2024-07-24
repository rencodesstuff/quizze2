import Link from 'next/link';
import { useState, useEffect } from 'react';

const TeacherSettings = () => {
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
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'account', label: 'Account' },
  ];

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
              <Link href="/teachdash" legacyBehavior>
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/createquiz" legacyBehavior>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Quiz
                </a>
              </Link>
            </li>
            <li>
              <Link href="/teachquiz" legacyBehavior>
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
                  My Quizzes
                </a>
              </Link>
            </li>
            <li>
              <Link href="/stdscores" legacyBehavior>
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Student Scores
                </a>
              </Link>
            </li>
            <li>
              <Link href="/teachprofile" legacyBehavior>
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
                  Profile
                </a>
              </Link>
            </li>
            <li>
              <Link href="/teachsettings" legacyBehavior>
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
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
          <button className="md:hidden text-black" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex items-center">
            <img src="/TeacherAvatar.png" alt="Teacher profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">Dr. Smith</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 space-y-4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="drsmith@university.edu"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Software Engineering"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Email notifications</span>
                      <span className="text-sm text-gray-500">Receive email about quiz results</span>
                    </span>
                    <button className="bg-blue-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" role="switch" aria-checked="true">
                      <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900">New quiz alerts</span>
                      <span className="text-sm text-gray-500">Receive notifications when new quizzes are available</span>
                    </span>
                    <button className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" role="switch" aria-checked="false">
                      <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Quiz result visibility</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="privacy-public"
                          name="privacy"
                          type="radio"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="privacy-public" className="ml-3 block text-sm font-medium text-gray-700">
                          Public (visible to all students)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="privacy-private"
                          name="privacy"
                          type="radio"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="privacy-private" className="ml-3 block text-sm font-medium text-gray-700">
                          Private (visible only to the quiz taker)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Change password</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm new password
                        </label>
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;