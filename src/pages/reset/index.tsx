import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    // Placeholder for reset logic
    console.log('Password reset link sent to:', email);
  };

  return (
    <>
      <Head>
        <title>Reset Password | Quizze</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Send Reset Link
              </button>
            </div>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            Remembered your password? <Link legacyBehavior href="/signin">
              <a className="font-medium text-blue-600 hover:text-blue-500">Sign In</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
