import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../../utils/supabase/component';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import GradientCanvas from '@/gradient/GradientCanvas';
import PageLayout from '@/loading/PageLayout';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const PasswordUpdate = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check if there's a valid session when the component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
// Check if we have the recovery token in the URL
const fragment = new URLSearchParams(window.location.hash.substring(1));
const type = fragment.get('type');

if (error) {
  console.error('Session check error:', error);
  toast.error('Error checking authentication status');
  router.push('/reset-password');
  return;
}

if (!session || type !== 'recovery') {
  toast.error('Invalid or expired reset link. Please request a new one.');
  router.push('/reset-password');
  return;
}
};

checkSession();
}, [router]);

// Password validation rules
const validatePassword = (password: string): { isValid: boolean; message: string } => {
if (password.length < 8) {
return { isValid: false, message: 'Password must be at least 8 characters long' };
}
if (!/[A-Z]/.test(password)) {
return { isValid: false, message: 'Password must contain at least one uppercase letter' };
}
if (!/[a-z]/.test(password)) {
return { isValid: false, message: 'Password must contain at least one lowercase letter' };
}
if (!/[0-9]/.test(password)) {
return { isValid: false, message: 'Password must contain at least one number' };
}
if (!/[!@#$%^&*]/.test(password)) {
return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
}
return { isValid: true, message: '' };
};

// Check password strength and return appropriate color
const getPasswordStrengthColor = (password: string): string => {
const validations = [
password.length >= 8,
/[A-Z]/.test(password),
/[a-z]/.test(password),
/[0-9]/.test(password),
/[!@#$%^&*]/.test(password)
];
const strength = validations.filter(Boolean).length;

switch (strength) {
case 0:
case 1:
  return 'bg-red-500';
case 2:
case 3:
  return 'bg-yellow-500';
case 4:
  return 'bg-blue-500';
case 5:
  return 'bg-green-500';
default:
  return 'bg-gray-500';
}
};

const handlePasswordUpdate = async (e: React.FormEvent) => {
e.preventDefault();
setIsLoading(true);
setErrorMessage(null);
setSuccessMessage(null);

try {
// Get the current session
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Your session has expired. Please request a new password reset link.');
}

// Validate password
const { isValid, message } = validatePassword(password);
if (!isValid) {
  throw new Error(message);
}

// Check if passwords match
if (password !== confirmPassword) {
  throw new Error('Passwords do not match');
}

// Update the password
const { error } = await supabase.auth.updateUser({ 
  password: password 
});

if (error) {
  throw new Error(error.message);
}

// Log successful password change
await supabase
  .from('email_logs')
  .insert({
    email: session.user.email,
    type: 'password_update',
    status: 'success'
  });

// Show success message
const successMsg = 'Password updated successfully! Redirecting to sign in...';
setSuccessMessage(successMsg);
toast.success(successMsg);

// Sign out the user
await supabase.auth.signOut();

// Clear form
setPassword('');
setConfirmPassword('');

// Redirect to sign in page after a delay
setTimeout(() => {
  router.push('/signin');
}, 3000);

} catch (error) {
console.error('Password Update Error:', error);
const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';

// Log failed password change attempt
const { data: { session } } = await supabase.auth.getSession();
if (session?.user?.email) {
  await supabase
    .from('email_logs')
    .insert({
      email: session.user.email,
      type: 'password_update',
      status: 'failed',
      error: errorMsg
    });
}

setErrorMessage(errorMsg);
toast.error(errorMsg);
} finally {
setIsLoading(false);
}
};

return (
<PageLayout isLoading={isLoading} loadingType="spinner">
<Head>
  <title>Update Password | Quizze</title>
</Head>
<GradientCanvas />

{/* Error Alert */}
<AnimatePresence mode="wait">
  {errorMessage && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 md:w-full md:max-w-md"
    >
      <Alert variant="destructive" className="bg-red-500 border-red-600 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <AlertTitle className="text-lg font-bold mb-1">Error</AlertTitle>
            <AlertDescription className="text-base">
              {errorMessage}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </motion.div>
  )}
</AnimatePresence>

<div className="flex items-center justify-center min-h-screen p-4">
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-black bg-opacity-75 rounded-lg shadow-lg p-6 md:p-8 w-full max-w-md"
  >
    {/* Success Alert */}
    <AnimatePresence mode="wait">
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          <Alert className="bg-green-500 border-green-600 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <AlertTitle className="text-lg font-bold mb-1">Success</AlertTitle>
                <AlertDescription className="text-base">
                  {successMessage}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>

    <h2 className="text-2xl font-bold text-center text-white mb-6">
      Update Your Password
    </h2>

    <form onSubmit={handlePasswordUpdate} className="space-y-6">
      {/* New Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            )}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {password && (
          <div className="mt-2">
            <div className={`h-1 rounded-full ${getPasswordStrengthColor(password)}`} />
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            )}
          </button>
        </div>
        {/* Password match indicator */}
        {confirmPassword && (
          <p className={`mt-1 text-sm ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
            {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="text-sm text-gray-400 space-y-1">
        <p>Password must contain:</p>
        <ul className="list-none space-y-1">
          {[
            { check: password.length >= 8, text: 'At least 8 characters' },
            { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
            { check: /[a-z]/.test(password), text: 'One lowercase letter' },
            { check: /[0-9]/.test(password), text: 'One number' },
            { check: /[!@#$%^&*]/.test(password), text: 'One special character (!@#$%^&*)' }
          ].map((requirement, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className={`text-lg ${requirement.check ? 'text-green-500' : 'text-gray-500'}`}>
                {requirement.check ? '✓' : '○'}
              </span>
              <span>{requirement.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Updating Password...' : 'Update Password'}
      </motion.button>
    </form>

    {/* Back to Sign In */}
    <div className="mt-6 text-center">
      <Link 
        href="/signin"
        className="text-sm text-indigo-400 hover:text-indigo-300 transition duration-200"
      >
        Back to Sign In
      </Link>
    </div>
  </motion.div>
</div>
</PageLayout>
);
};

export default PasswordUpdate;