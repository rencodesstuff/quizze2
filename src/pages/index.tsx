import Link from "next/link";
import { TypewriterEffect } from "@/ui/typewriter-effect";
import Image from "next/image";

export default function Home() {

  {/* Typewriter Words */ }
  const words = [
    { text: "Challenge" },
    { text: "your" },
    { text: "knowledge" },
    { text: "and" },
    { text: "expand" },
    { text: "your" },
    { text: "mind", className: "text-blue-500 dark:text-blue-500" },
  ];


  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quizze
        </h1>
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative flex items-center justify-center h-screen bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-image.jpg)" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative text-center text-white p-8">
            <h2 className="text-5xl font-extrabold mb-4">The Ultimate Quiz Experience</h2>
            <TypewriterEffect words={words} />
            <div className="mt-6 space-x-4">

              <Link legacyBehavior href="/signin">
                <a className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
                  Sign In
                </a>
              </Link>
              <Link legacyBehavior href="/signup">
                <a className="inline-block px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition">
                  Sign Up
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Quizze?
            </h3>
            <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">
              Quizze offers a variety of topics, challenging questions, and an
              interactive experience.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 bg-white dark:bg-gray-900 rounded-md shadow-md">
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Diverse Topics
                </h4>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                  Explore quizzes across various subjects.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-gray-900 rounded-md shadow-md">
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Challenging Questions
                </h4>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                  Test your knowledge with tough questions.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-gray-900 rounded-md shadow-md">
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Interactive Experience
                </h4>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                  Enjoy an engaging and interactive quiz experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meet Our Team
            </h3>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Our team is dedicated to providing you with the best quiz
              experience.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Danish Aiman",
                  role: "Head Software Engineer",
                  img: "/AimanHD.png",
                },
                {
                  name: "Syed Zabir",
                  role: "Head UI/UX Designer",
                  img: "/ZabirHD.png",
                },
                {
                  name: "Shahmi",
                  role: "Head Software Tester",
                  img: "/path/to/alice.jpg",
                },
                {
                  name: "Syasya",
                  role: "Head QA",
                  img: "/path/to/bob.jpg"
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
                >
                  <Image
                    src={member.img}
                    alt={member.name}
                    width={500}
                    height={500}
                    className="w-36 h-40 rounded mx-auto mb-4"
                  />
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </h4>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="flex flex-wrap items-center justify-between p-12 bg-white dark:bg-gray-800">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Interactive Quiz Platform
            </h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Engage, learn, and excel. At , we believe there is a better way to
              meet our clients&apos; needs. We&apos;re a company that exists to help you
              achieve more than you ever thought possible.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Understanding all the unique touch-points of each client is
              essential to our business. We focus on building reliable
              connections, amazing results, and trusted experiences that are as
              useful as they are memorable.
            </p>
            <p className="mt-4 mb-6 text-gray-600 dark:text-gray-400">
              Let&apos;s do great things together. We can&apos;t wait to work with you.
            </p>
            <Link legacyBehavior href="/contact">
              <a className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
                Get in Touch
              </a>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <img
              src="/gmi.jpg"
              alt="Cityscape"
              className="w-full h-auto rounded-md shadow-lg"
            />
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              What Our Users Say
            </h3>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Hear from our satisfied users who love Quizze.
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <p className="text-gray-700 dark:text-gray-300">
                &quot;The attention and effort Quizze puts into creating engaging
                quizzes is unmatched. I love the variety of topics and the
                challenging questions. It&apos;s my go-to for a fun and educational
                experience!&quot;
              </p>
              <div className="mt-4 text-red-500">★★★★★</div>
              <p className="mt-2 text-gray-900 dark:text-white font-semibold">
                - Best Quiz Ever
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 bg-gray-100 dark:bg-gray-800 text-center">
        <p className="text-gray-700 dark:text-gray-300">
          &copy; 2024 Quizze. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
