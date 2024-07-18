import Link from 'next/link';
import { useState } from 'react';

const JoinQuiz = () => {
  const [activeTab, setActiveTab] = useState('code');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Join Quiz</h2>
          <p className="mt-2 text-sm text-gray-600">Enter a code or scan a QR code to join</p>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Enter Code
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white'
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
                <input id="quiz-code" name="code" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Quiz Code" />
              </div>
              <div>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input id="name" name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Your Name" />
              </div>
            </div>
            <div>
              <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
  );
};

export default JoinQuiz;