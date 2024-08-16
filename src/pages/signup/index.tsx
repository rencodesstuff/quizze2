import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import Head from "next/head";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createClient } from "../../../utils/supabase/component";

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

const SignUpPage = () => {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic form validation
    if (!name || !studentId || !email || !password) {
      setError("All fields are required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    // Password strength check (example: at least 8 characters)
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
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

      if (authData.user) {
        console.log("User created in auth:", authData.user);

        // Insert user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            id: authData.user.id,
            role: 'student',
          });

        if (roleError) {
          console.error("Error inserting user role:", roleError);
          throw roleError;
        }

        console.log("User role inserted:", roleData);

        // Insert student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({
            id: authData.user.id,
            name,
            student_id: studentId,
            email,
          });

        if (studentError) {
          console.error("Error inserting student data:", studentError);
          throw studentError;
        }

        console.log("Student data inserted:", studentData);

        // Registration successful
        alert("Registration successful! Please check your email to confirm your account.");
        router.push('/signin');
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during registration");
      }
    }
  };

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

  return (
    <>
      <Head>
        <title>Student Sign Up | Quizze</title>
      </Head>
      <div className="flex flex-wrap min-h-screen items-center justify-center">
        {/* Slider and Information Side */}
        <div className="w-full md:w-1/2 hidden md:block">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index} className="relative w-full h-screen">
                <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
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
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-6">Create a Student Account</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="studentID" className="text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="text"
                  id="studentID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account? <Link href="/signin" legacyBehavior>
                <a className="font-medium text-blue-600 hover:text-blue-500">Login</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;