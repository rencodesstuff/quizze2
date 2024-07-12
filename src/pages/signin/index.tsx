import Link from 'next/link';
import Head from 'next/head';

const SignInPage = () => {
  return (
    <>
      <Head>
        <title>Sign In | Quizze</title>
      </Head>
      <div className="relative min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="z-10 p-8 max-w-md w-full space-y-8 bg-black bg-opacity-75 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center">Sign In to Quizze</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </form>
          <div className="text-center">
            <Link legacyBehavior href="/signup">
              <a className="text-sm font-medium text-indigo-500 hover:text-indigo-400">
                Don't have an account? Sign Up
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
