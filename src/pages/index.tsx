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
    img: "/Syasya.jpg",
  },
];

const words = [
  { text: "Challenge", className: "text-white" },
  { text: "your", className: "text-white" },
  { text: "knowledge", className: "text-white" },
  { text: "and", className: "text-white" },
  { text: "expand", className: "text-white" },
  { text: "your", className: "text-white" },
  { text: "mind", className: "text-blue-500" },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "features", "team", "description", "testimonials"];
      const currentSection = sections.find((section) => {
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
    <div className="min-h-screen flex flex-col bg-white text-black">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Quizze</h1>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            {["Features", "Team", "About", "Testimonials"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className={`hover:text-blue-500 ${
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
          className="md:hidden text-blue-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16">
          <nav className="p-4">
            <ul className="space-y-4">
              {["Features", "Team", "About", "Testimonials"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block hover:text-blue-500"
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
        <section
          id="hero"
          className="relative flex items-center justify-center h-screen bg-cover bg-center"
          style={{ backgroundImage: "url(/hero-image.jpg)" }}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>
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
                <a className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md shadow-md hover:bg-gray-100 transition">
                  Sign Up
                </a>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-24 sm:py-32">
  <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
    <h2 className="text-center text-base font-semibold text-blue-600">Why Choose Quizze?</h2>
    <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
      Everything you need for the ultimate quiz experience.
    </p>
    <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
      <div className="relative lg:row-span-2">
        <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
          <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
            <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
              Diverse Topics
            </p>
            <p className="mt-2 max-w-lg text-sm text-gray-600 max-lg:text-center">
              Explore quizzes across various subjects, from science to history and everything in between.
            </p>
          </div>
          <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
            <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
              <img
                className="size-full object-cover object-top"
                src="/topic.jpg"
                alt="Diverse Topics"
              />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
      </div>
      <div className="relative max-lg:row-start-1">
        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
          <div className="px-8 pt-8 sm:px-10 sm:pt-10">
            <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
              Challenging Questions
            </p>
            <p className="mt-2 max-w-lg text-sm text-gray-600 max-lg:text-center">
              Test your knowledge with tough questions designed to push your limits.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
            <img
              className="w-full max-lg:max-w-xs"
              src="/questions.jpg"
              alt="Challenging Questions"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
      </div>
      <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
        <div className="absolute inset-px rounded-lg bg-white"></div>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
          <div className="px-8 pt-8 sm:px-10 sm:pt-10">
            <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Interactive Experience</p>
            <p className="mt-2 max-w-lg text-sm text-gray-600 max-lg:text-center">
              Enjoy an engaging and interactive quiz experience that makes learning fun.
            </p>
          </div>
          <div className="flex flex-1 items-center [container-type:inline-size] max-lg:py-6 lg:pb-2">
            <img
              className="h-[min(152px,40cqw)] object-cover object-center"
              src="/interactive.jpg"
              alt="Interactive Experience"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
      </div>
      <div className="relative lg:row-span-2">
        <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
          <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
            <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
              Performance Tracking
            </p>
            <p className="mt-2 max-w-lg text-sm text-gray-600 max-lg:text-center">
              Track your progress and see how you improve over time with detailed performance analytics.
            </p>
          </div>
          <div className="relative min-h-[30rem] w-full grow">
            <div className="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
              <img
                className="size-full object-cover object-top"
                src="/performance.jpg"
                alt="Performance Tracking"
              />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
      </div>
    </div>
  </div>
</section>

        <section id="team" className="py-12 bg-white">
          <div className="container mx-auto text-center px-4">
            <h3 className="text-3xl font-bold text-blue-600">Meet Our Team</h3>
            <p className="mt-4 text-lg text-gray-700">
              Our team is dedicated to providing you with the best quiz
              experience.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="p-6 bg-blue-50 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <Image
                    src={member.img}
                    alt={member.name}
                    width={144}
                    height={160}
                    className="w-36 h-40 rounded mx-auto mb-4 object-cover"
                  />
                  <h4 className="text-xl font-semibold text-center text-blue-600">
                    {member.name}
                  </h4>
                  <p className="mt-2 text-gray-700 text-center">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="description" className="flex flex-wrap items-center justify-between p-12 bg-blue-50">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-4xl font-bold text-blue-600">Interactive Quiz Platform</h2>
            <p className="mt-4 text-lg text-gray-700">
              Engage, learn, and excel. At Quizze, we believe there is a better way to
              meet our clients&apos; needs. We&apos;re a company that exists to help you
              achieve more than you ever thought possible.
            </p>
            <p className="mt-4 text-gray-600">
              Understanding all the unique touch-points of each client is
              essential to our business. We focus on building reliable
              connections, amazing results, and trusted experiences that are as
              useful as they are memorable.
            </p>
            <p className="mt-4 mb-6 text-gray-600">
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

        <section id="testimonials" className="py-12 bg-white">
          <div className="container mx-auto text-center px-4">
            <h3 className="text-3xl font-bold text-blue-600">What Our Users Say</h3>
            <p className="mt-4 text-lg text-gray-700">
              Hear from our satisfied users who love Quizze.
            </p>
            <div className="mt-8">
              <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 bg-blue-600 text-center">
        <p className="text-white">
          &copy; 2024 Quizze. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
