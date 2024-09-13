import React, { useState, useEffect } from "react";
import TeacherLayout from "@/comps/teacher-layout";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/component";

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string;
  created_at: string;
  code: string | null;
}

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user found");

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      // Remove the deleted quiz from the state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      // You might want to show an error message to the user here
    }
  };

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
        
        {loading ? (
          <p>Loading quizzes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Duration (minutes)</th>
                  <th className="py-3 px-4 text-left">Release Date</th>
                  <th className="py-3 px-4 text-left">Date Created</th>
                  <th className="py-3 px-4 text-left">Code</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{quiz.title}</td>
                    <td className="py-4 px-4">{quiz.duration_minutes || 'N/A'}</td>
                    <td className="py-4 px-4">{new Date(quiz.release_date).toLocaleString()}</td>
                    <td className="py-4 px-4">{new Date(quiz.created_at).toLocaleString()}</td>
                    <td className="py-4 px-4">{quiz.code || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <Link href={`/editquiz/${quiz.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default MyQuizzes;