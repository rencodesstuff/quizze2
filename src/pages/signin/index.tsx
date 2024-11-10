import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link';
import Head from 'next/head';
import GradientCanvas from '@/gradient/GradientCanvas';
import { createClient } from '../../../utils/supabase/component';
import { AuthError } from '@supabase/supabase-js';

const SignInPage = () => {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/signin');
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleData) {
          switch(roleData.role) {
            case 'student':
              router.replace('/studentdash');
              break;
            case 'teacher':
              router.replace('/teachdash');
              break;
            case 'admin':
              router.replace('/admindashboard');
              break;
          }
        }
      }
    };

    checkAuth();

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const preventBack = () => {
      window.history.forward();
    };

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = preventBack;
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const getErrorMessage = (error: AuthError | Error): string => {
    if (error.message === 'Invalid login credentials') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (error.message.includes('rate limit')) {
      return 'Too many login attempts. Please try again later.';
    }
    return 'An error occurred during sign in. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate email domain
      if (!email.toLowerCase().endsWith('@student.gmi.edu.my') && 
          !email.toLowerCase().endsWith('@gmi.edu.my')) {
        throw new Error('Please use your GMi email address.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });
      
      if (signInError) throw signInError;

      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (roleError) throw roleError;

        switch(roleData.role) {
          case 'student':
            router.replace('/studentdash');
            break;
          case 'teacher':
            router.replace('/teachdash');
            break;
          case 'admin':
            router.replace('/admindashboard');
            break;
          default:
            throw new Error('Unknown user role');
        }
      }
    } catch (err) {
      console.error('Error during sign in:', err);
      setError(getErrorMessage(err as AuthError | Error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Quizze</title>
      </Head>
      <GradientCanvas />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-black bg-opacity-75 rounded-lg shadow-lg p-4 md:p-10 w-full max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {!isSmallScreen && (
              <div className="flex-1 mb-6 md:mb-0 md:mr-8">
                <h1 className="text-3xl font-bold text-white mb-4">WELCOME BACK!</h1>
                <p className="text-white mb-2">Don&apos;t have an account yet?</p>
                <Link href="/signup" className="text-lg text-indigo-500 underline hover:text-indigo-400">
                  Register
                </Link>
              </div>
            )}
            <div className="flex-1 w-full max-w-md">
              <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In to Quizze</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setError(null);
                      setEmail(e.target.value);
                    }}
                    placeholder='username@student.gmi.edu.my'
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setError(null);
                      setPassword(e.target.value);
                    }}
                    placeholder='*******'
                    autoComplete="current-password"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-white placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              <div className="text-center mt-4">
                <Link href="/reset-password" className="text-sm text-indigo-500 hover:text-indigo-400 transition duration-200">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>
          {isSmallScreen && (
            <div className="mt-8 text-center">
              <p className="text-white mb-2">Don&apos;t have an account yet?</p>
              <Link href="/signup" className="text-lg text-indigo-500 underline hover:text-indigo-400 transition duration-200">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SignInPage;