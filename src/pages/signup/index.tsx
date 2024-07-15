import Link from "next/link";
import Head from "next/head";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  return (
    <>
      <Head>
        <title>Sign Up | Quizze</title>
      </Head>
      <div className="flex flex-wrap min-h-screen items-center justify-center">
        {/* Slider and Information Side */}
        <div className="w-full md:w-1/2">
          <Slider {...settings}>
            <div style={{ backgroundImage: "url('./notes.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh' }}>
              <div className="p-10 text-white text-center h-full flex items-center justify-center">
                {/* Words */}
              </div>
            </div>
            <div style={{ backgroundImage: "url('./study.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh' }}>
              <div className="p-10 text-white text-center h-full flex items-center justify-center">
                {/* Words ez */}
              </div>
            </div>
            <div style={{ backgroundImage: "url('./wb.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh' }}>
              <div className="p-10 text-white text-center h-full flex items-center justify-center">
                {/* words zezez */}
              </div>
            </div>
          </Slider>
        </div>
        {/* Form Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-6">
              Create a free account now
            </h1>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  autoComplete="name"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="studentID" className="text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="studentID"
                  id="studentID"
                  autoComplete="new-studentID"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <Link legacyBehavior href="/signin">
                <a className="font-medium text-blue-600 hover:text-blue-500">
                  Login
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
