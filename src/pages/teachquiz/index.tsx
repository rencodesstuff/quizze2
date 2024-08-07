import React, { useState } from "react";
import TeacherLayout from "@/comps/teacher-layout";
import Link from "next/link";

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'Introduction to React', subject: 'Web Development', questions: 15, dateCreated: '2024-07-15', status: 'Active' },
    { id: 2, title: 'JavaScript Basics', subject: 'Programming', questions: 20, dateCreated: '2024-07-10', status: 'Draft' },
    { id: 3, title: 'Data Structures', subject: 'Computer Science', questions: 25, dateCreated: '2024-07-05', status: 'Active' },
    { id: 4, title: 'UI/UX Principles', subject: 'Design', questions: 18, dateCreated: '2024-06-30', status: 'Archived' },
  ]);

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
          <Link href="/createquiz" passHref>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
              Create New Quiz
            </button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Subject</th>
                <th className="py-3 px-4 text-left">Questions</th>
                <th className="py-3 px-4 text-left">Date Created</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{quiz.title}</td>
                  <td className="py-4 px-4">{quiz.subject}</td>
                  <td className="py-4 px-4">{quiz.questions}</td>
                  <td className="py-4 px-4">{quiz.dateCreated}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${quiz.status === 'Active' ? 'bg-green-200 text-green-800' :
                        quiz.status === 'Draft' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default MyQuizzes;