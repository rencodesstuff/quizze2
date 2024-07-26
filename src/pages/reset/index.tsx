import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import GradientCanvas from '@/gradient/GradientCanvas';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for reset logic
    console.log('Password reset link sent to:', email);
  };

  return (
    <>
      <Head>
        <title>Reset Password | Quizze</title>
      </Head>
      <GradientCanvas />
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black bg-opacity-75 rounded-lg shadow-lg p-4 md:p-10 w-full max-w-4xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            {!isSmallScreen && (
              <div className="flex-1 mb-6 md:mb-0 md:mr-8">
                <h1 className="text-3xl font-bold text-white mb-4">RESET YOUR PASSWORD</h1>
                <p className="text-white mb-2">Remember your password?</p>
                <Link href="/signin" className="text-lg text-indigo-500 underline hover:text-indigo-400">
                  Sign In
                </Link>
              </div>
            )}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex-1 w-full max-w-md"
            >
              <h2 className="text-3xl font-bold text-center text-white mb-6">Reset Password</h2>
              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@student.gmi.edu.my"
                      required
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                >
                  Send Reset Link
                </motion.button>
              </form>
              <div className="text-center mt-4">
                <Link href="/signin" className="flex items-center justify-center text-sm text-indigo-500 hover:text-indigo-400 transition duration-200">
                  <FiArrowLeft className="mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          </div>
          {isSmallScreen && (
            <div className="mt-8 text-center">
              <p className="text-white mb-2">Remember your password?</p>
              <Link href="/signin" className="text-lg text-indigo-500 underline hover:text-indigo-400 transition duration-200">
                Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;