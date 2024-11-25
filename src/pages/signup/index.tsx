import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import Head from "next/head";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createClient } from "../../../utils/supabase/component";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";

// Slider settings for the image carousel
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  cssEase: "linear",
};

// Slider content
const slides = [
  {
    image: "/notes.jpg",
    alt: "Explore, Learn, and Excel",
    text: "Discover the thrill of learning with endless topics and resources."
  },
  {
    image: "/study.jpg",
    alt: "Study Strategies",
    text: "Enhance your study habits with expert tips and strategies."
  },
  {
    image: "/wb.jpg",
    alt: "Whiteboard Sessions",
    text: "Collaborate and visualize your ideas with interactive sessions."
  }
];

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  // State management
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic form validation
      if (!name || !studentId || !email || !password) {
        throw new Error("All fields are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@student\.gmi\.edu\.my$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format. Only @student.gmi.edu.my emails are allowed");
      }

      // Password strength check
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            student_id: studentId,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("User creation failed");

      // Insert student data
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: authData.user.id,
          name,
          student_id: studentId,
          email,
        });

      if (studentError) {
        console.error("Error inserting student data:", studentError);
      }

      // Insert user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          id: authData.user.id,
          role: 'student',
        });

      if (roleError && !roleError.message.includes('duplicate key value')) {
        console.error("Error inserting user role:", roleError);
      }

      setIsSuccessModalOpen(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Student Sign Up | Quizze</title>
      </Head>
      <div className="min-h-screen flex flex-wrap relative">
        {/* Slider Side */}
        <div className="w-full md:w-1/2 hidden md:block relative">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index} className="relative h-screen">
                <img 
                  src={slide.image} 
                  alt={slide.alt} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center p-10 bg-black bg-opacity-30">
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold">{slide.alt}</h2>
                    <p className="text-xl mt-2">{slide.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white relative z-10">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-6">Create a Student Account</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="studentID" className="block text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="text"
                  id="studentID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="your.email@student.gmi.edu.my"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">Only @student.gmi.edu.my emails are allowed</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md rounded-lg bg-white p-6 shadow-xl z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been created successfully. You will be redirected to the sign-in page in a few seconds...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/signin')}>
              Go to Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SignUpPage;