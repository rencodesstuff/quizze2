import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import GradientCanvas from "@/gradient/GradientCanvas";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { createClient } from "../../../utils/supabase/component";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/loading/PageLayout";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
};

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Calculate if input should be disabled
  const isDisabled =
    isLoading ||
    (attempts >= RATE_LIMIT.MAX_ATTEMPTS &&
      lastAttemptTime !== null &&
      Date.now() - lastAttemptTime < RATE_LIMIT.WINDOW_MS);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset error and success messages when email changes
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [email]);

  const validateEmail = (email: string): boolean => {
    const validDomains = ["@student.gmi.edu.my", "@gmi.edu.my"];
    return validDomains.some((domain) => email.toLowerCase().endsWith(domain));
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (lastAttemptTime && attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
      const timeElapsed = now - lastAttemptTime;
      if (timeElapsed < RATE_LIMIT.WINDOW_MS) {
        const minutesLeft = Math.ceil(
          (RATE_LIMIT.WINDOW_MS - timeElapsed) / 60000
        );
        toast.error(
          `Too many attempts. Please try again in ${minutesLeft} minutes.`
        );
        return false;
      }
      // Reset attempts after window expires
      setAttempts(0);
      setLastAttemptTime(null);
      return true;
    }
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Check rate limiting
      if (!checkRateLimit()) {
        setIsLoading(false);
        return;
      }

      // Validate email format
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Validate email domain
      if (!validateEmail(email)) {
        throw new Error("Please use a valid GMI email address");
      }

      // Check user existence
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      if (!studentData && !teacherData) {
        throw new Error(
          "No account found with this email address. Please check your email or contact support."
        );
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (resetError) {
        throw new Error("Failed to send reset email. Please try again later.");
      }

      // Update rate limiting
      setAttempts((prev) => prev + 1);
      setLastAttemptTime(Date.now());

      // Show success message
      const successMsg =
        "Password reset instructions have been sent to your email";
      setSuccessMessage(successMsg);
      toast.success(successMsg, {
        duration: 5000,
        action: {
          label: "Go to Sign In",
          onClick: () => router.push("/signin"),
        },
      });

      // Clear form
      setEmail("");

      // Redirect after delay
      setTimeout(() => {
        router.push("/signin");
      }, 5000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout isLoading={isLoading} loadingType="spinner">
      <Head>
        <title>Reset Password | Quizze</title>
      </Head>
      <GradientCanvas />

      {/* Error Alert - Centered */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-24 -translate-x-1/2 w-full max-w-md px-4 z-50"
          >
            <Alert
              variant="destructive"
              className="bg-red-500 border-2 border-red-600 text-white shadow-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-white" />
                <div className="flex-1">
                  <AlertTitle className="text-lg font-bold mb-1">
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-base text-white">
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
          className="bg-black bg-opacity-75 rounded-lg shadow-lg p-4 md:p-10 w-full max-w-lg md:max-w-4xl"
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
                      <AlertTitle className="text-lg font-bold mb-1">
                        Success
                      </AlertTitle>
                      <AlertDescription className="text-base">
                        {successMessage}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Left side content - Hidden on mobile */}
            <div className="hidden md:block md:flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">
                RESET YOUR PASSWORD
              </h1>
              <p className="text-white mb-2">Remember your password?</p>
              <Link
                href="/signin"
                className="text-lg text-indigo-500 underline hover:text-indigo-400"
              >
                Sign In
              </Link>
            </div>

            {/* Right side content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full md:flex-1 md:max-w-md"
            >
              {/* Mobile header */}
              <div className="block md:hidden text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-sm text-gray-300">
                  Enter your email to reset your password
                </p>
              </div>

              {/* Desktop header */}
              <h2 className="hidden md:block text-3xl font-bold text-center text-white mb-6">
                Reset Password
              </h2>

              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@student.gmi.edu.my"
                      required
                      className={`w-full pl-10 pr-3 py-2 bg-gray-800 border ${
                        errorMessage ? "border-red-500" : "border-gray-700"
                      } rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200`}
                      disabled={isDisabled}
                    />
                  </div>
                  {attempts > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Attempts remaining: {RATE_LIMIT.MAX_ATTEMPTS - attempts}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isDisabled}
                  className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </motion.button>
              </form>

              {/* Back to Sign In link */}
              <div className="text-center mt-6">
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center text-sm text-indigo-500 hover:text-indigo-400 transition duration-200"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Mobile footer */}
          <div className="mt-8 pt-6 border-t border-gray-700 block md:hidden text-center">
            <p className="text-white mb-2">Remember your password?</p>
            <Link
              href="/signin"
              className="text-indigo-500 hover:text-indigo-400 transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
