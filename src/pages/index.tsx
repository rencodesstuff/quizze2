// src/pages/index.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TypewriterEffect } from "@/ui/typewriter-effect";
import { InfiniteMovingCards } from "@/ui/infinite-moving-cards";

const testimonials = [
  {
    quote: "Quizze has completely transformed my study routine. The quizzes are engaging and cover a wide range of topics. Highly recommend it to all students!",
    name: "Mohamed Fawwaz",
    title: "Software Engineering",
  },
  {
    quote: "The interactive quizzes on Quizze make learning fun and effective. It's a great way to test your knowledge and prepare for exams.",
    name: "Zarif Danish",
    title: "Process and Instrumental Control",
  },
  {
    quote: "I love how Quizze offers quizzes on various subjects. It's a perfect tool for self-assessment and improvement. A must-have for every student!",
    name: "Aadam Sahib",
    title: "Sound Engineering",
  },
  {
    quote: "Quizze helped me ace my exams! The diverse topics and challenging questions are exactly what I needed to stay on top of my studies.",
    name: "Fawwaz Amin",
    title: "Creative Multimedia",
  },
  {
    quote: "The quizzes are not only fun but also very informative. Quizze is my go-to platform for quick revision and self-evaluation.",
    name: "Shahmi Naufal",
    title: "Network Security",
  },
];

const teamMembers = [
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
    img: "/ShahmiHD.png",
  },
  {
    name: "Syasya",
    role: "Head QA",
    img: "/path/to/bob.jpg"
  },
];

const words = [
  { text: "Challenge" },
  { text: "your" },
  { text: "knowledge" },
  { text: "and" },
  { text: "expand" },
  { text: "your" },
  { text: "mind", className: "text-blue-500 dark:text-blue-500" },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "features", "team", "description", "testimonials"];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-white dark:bg-gray-900 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quizze
        </h1>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            {["Features", "Team", "About", "Testimonials"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className={`text-gray-600 dark:text-gray-300 hover:text-blue-500 ${
                    activeSection === item.toLowerCase() ? "text-blue-500 font-bold" : ""
                  }`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-16">
          <nav className="p-4">
            <ul className="space-y-4">
              {["Features", "Team", "About", "Testimonials"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-600 dark:text-gray-300 hover:text-blue-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative flex items-center justify-center h-screen bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-image.jpg)" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative text-center text-white p-8">
            <h2 className="text-5xl font-extrabold mb-4">The Ultimate Quiz Experience</h2>
            <TypewriterEffect words={words} />
            <div className="mt-6 space-x-4">
              <Link href="/signin" legacyBehavior>
                <a className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
                  Sign In
                </a>
              </Link>
              <Link href="/signup" legacyBehavior>
                <a className="inline-block px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition">
                  Sign Up
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto text-center px-4">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Quizze?
            </h3>
            <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">
              Quizze offers a variety of topics, challenging questions, and an
              interactive experience.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {["Diverse Topics", "Challenging Questions", "Interactive Experience"].map((feature, index) => (
                <div key={index} className="p-8 bg-white dark:bg-gray-900 rounded-md shadow-md transform hover:scale-105 transition-transform duration-300">
                  <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {feature}
                  </h4>
                  <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                    {index === 0 && "Explore quizzes across various subjects."}
                    {index === 1 && "Test your knowledge with tough questions."}
                    {index === 2 && "Enjoy an engaging and interactive quiz experience."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto text-center px-4">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meet Our Team
            </h3>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Our team is dedicated to providing you with the best quiz
              experience.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <Image
                    src={member.img}
                    alt={member.name}
                    width={144}
                    height={160}
                    className="w-36 h-40 rounded mx-auto mb-4 object-cover"
                  />
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                    {member.name}
                  </h4>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 text-center">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Description */}
        <section id="description" className="flex flex-wrap items-center justify-between p-12 bg-white dark:bg-gray-800">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Interactive Quiz Platform
            </h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Engage, learn, and excel. At Quizze, we believe there is a better way to
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
            <Link href="/contact" legacyBehavior>
              <a className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
                Get in Touch
              </a>
            </Link>
          </div>
          <div className="w-full lg:w-1/2">
            <Image
              src="/gmi.jpg"
              alt="Cityscape"
              width={800}
              height={600}
              className="w-full h-auto rounded-md shadow-lg"
            />
          </div>
        </section>

        {/* Testimonial Section */}
        <section id="testimonials" className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto text-center px-4">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              What Our Users Say
            </h3>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Hear from our satisfied users who love Quizze.
            </p>
            <div className="mt-8">
              <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
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
