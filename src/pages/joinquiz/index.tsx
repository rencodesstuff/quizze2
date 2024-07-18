import Link from 'next/link';
import { useState } from 'react';

const JoinQuiz = () => {
  const [activeTab, setActiveTab] = useState('code');
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
          <h1 className="text-2xl font-bold">Join Quiz</h1>
          <div className="flex items-center">
            <img src="/ZabirHD.png" alt="User profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">SWE22070001</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Join Quiz Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Join a Quiz</h2>
              <p className="mt-2 text-sm text-gray-600">Enter a code or scan a QR code to join</p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enter Code
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'qr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Scan QR Code
              </button>
            </div>

            {activeTab === 'code' ? (
              <form className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="quiz-code" className="sr-only">Quiz Code</label>
                    <input 
                      id="quiz-code" 
                      name="code" 
                      type="text" 
                      required 
                      className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                      placeholder="Quiz Code" 
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="sr-only">Your Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      required 
                      className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                      placeholder="Your Name" 
                    />
                  </div>
                </div>
                <div>
                  <button 
                    type="submit" 
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Join Quiz
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 space-y-6">
                <div className="flex justify-center items-center h-48 bg-gray-200 rounded-md">
                  <p className="text-gray-500">QR Scanner Placeholder</p>
                </div>
                <p className="text-sm text-gray-600 text-center">Scan the QR code to join the quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;