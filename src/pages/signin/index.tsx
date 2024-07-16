import Link from 'next/link';
import Head from 'next/head';
import GradientCanvas from '@/gradient/GradientCanvas';

const SignInPage = () => {
  return (
    <>
      <Head>
        <title>Sign In | Quizze</title>
      </Head>
      <GradientCanvas />
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-black bg-opacity-75 rounded-lg shadow-lg p-4 md:p-10" style={{ maxWidth: '900px', width: '100%' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Welcome Text Container */}
            <div className="flex-1 mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-white mb-4 text-center md:text-left">WELCOME BACK!</h1>
              <p className="text-white text-center md:text-left">Don&apos;t have an account yet?</p>
              <Link legacyBehavior href="/signup">
                <a className="text-lg text-indigo-500 underline hover:text-indigo-400 block text-center md:text-left">
                  Register
                </a>
              </Link>
            </div>
            {/* Sign In Form Container */}
            <div className="flex-1 max-w-md">
              <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In to Quizze</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder='username@student.gmi.edu.my'
                    autoComplete="email"
                    required
                    className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder='*******'
                    autoComplete="current-password"
                    required
                    className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Link legacyBehavior href="/studentdash">
                  <a className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign In
                  </a>
                </Link>
              </div>
              <div className="text-center mt-4">
                <Link legacyBehavior href="/reset">
                  <a className="text-sm text-indigo-500 hover:text-indigo-400">
                    Forgot your password?
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
