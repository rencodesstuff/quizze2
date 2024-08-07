import React from "react";
import TeacherLayout from "@/comps/teacher-layout";
import { Tab } from '@headlessui/react';
import { FaClipboardList, FaUserGraduate, FaBell, FaCalendarAlt } from 'react-icons/fa';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome back, Dr. Smith!
            </h2>
            <p className="text-gray-600">
              Here's what's happening in your classes today.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition">
            Create New Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Active Quizzes", value: "5", color: "bg-blue-100 text-blue-800", icon: <FaClipboardList /> },
            { title: "Total Students", value: "150", color: "bg-green-100 text-green-800", icon: <FaUserGraduate /> },
            { title: "Pending Grading", value: "23", color: "bg-yellow-100 text-yellow-800", icon: <FaBell /> },
            { title: "Upcoming Events", value: "3", color: "bg-purple-100 text-purple-800", icon: <FaCalendarAlt /> },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg p-6 flex items-center`}>
              <div className="text-3xl mr-4">{stat.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{stat.title}</h3>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-4">
              {[
                { action: "Quiz submitted", subject: "Math 101", student: "John Doe", time: "2 hours ago" },
                { action: "Assignment graded", subject: "Physics 202", student: "Jane Smith", time: "5 hours ago" },
                { action: "Discussion post", subject: "Literature 301", student: "Alice Johnson", time: "1 day ago" },
              ].map((activity, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">{activity.action} - {activity.subject}</p>
                    <p className="text-sm text-gray-600">{activity.student} • {activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
            <ul className="space-y-4">
              {[
                { subject: "Math 101", time: "09:00 AM", room: "Room 301" },
                { subject: "Physics 202", time: "11:00 AM", room: "Lab 2" },
                { subject: "Computer Science 303", time: "02:00 PM", room: "Room 405" },
              ].map((class_, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{class_.subject}</p>
                    <p className="text-sm text-gray-600">{class_.time}</p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">{class_.room}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <Tab.Group>
            <Tab.List className="flex space-x-4 border-b">
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`
              }>
                Recent Quizzes
              </Tab>
              <Tab className={({ selected }) =>
                `py-2 px-4 font-medium focus:outline-none ${
                  selected ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`
              }>
                Top Performing Students
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <ul className="space-y-2">
                  {[
                    { name: "Math Quiz", date: "July 10, 2024", status: "Active" },
                    { name: "CS101 Quiz", date: "July 15, 2024", status: "Draft" },
                    { name: "AI Basics Quiz", date: "July 20, 2024", status: "Active" },
                  ].map((quiz, index) => (
                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{quiz.name}</span>
                      <span>{quiz.date}</span>
                      <span className={`px-2 py-1 rounded ${
                        quiz.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {quiz.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
              <Tab.Panel>
                <ul className="space-y-2">
                  {[
                    { name: "Syed Zabir", score: 95 },
                    { name: "Shahmi", score: 92 },
                    { name: "Aiman", score: 90 },
                    { name: "Syasya", score: 88 },
                  ].map((student, index) => (
                    <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span>{student.name}</span>
                      <span className={`font-semibold ${
                        student.score >= 90 ? 'text-green-600' : 
                        student.score >= 80 ? 'text-blue-600' : 
                        student.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{student.score}%</span>
                    </li>
                  ))}
                </ul>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;