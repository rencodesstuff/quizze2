import React, { useState, useEffect } from "react";
import Link from "next/link"; // Import Link from next/link
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";

interface Quiz {
  id: string;
  title: string;
  created_at: string;
  code: string;
}

interface StudentSubmission {
  student_name: string;
  score: number;
  submitted_at: string;
}

// Removed unused SubmissionData interface

const TeacherQuizScores: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, title, created_at, code')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentSubmissions = async (quizId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select(`
          score,
          submitted_at,
          students (name)
        `)
        .eq('quiz_id', quizId);

      if (error) throw error;
      if (data) {
        const submissions: StudentSubmission[] = data.map((submission: any) => ({
          student_name: submission.students[0]?.name || 'Unknown',
          score: submission.score,
          submitted_at: submission.submitted_at
        }));
        setStudentSubmissions(submissions);
      }
    } catch (error) {
      console.error('Error fetching student submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    fetchStudentSubmissions(quiz.id);
  };

  const filteredSubmissions = studentSubmissions.filter(submission =>
    submission.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Quiz Scores</h1>
        
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 mb-4">You haven&apos;t created any quizzes yet.</p>
            <Link href="/createquiz" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`p-4 rounded-lg shadow-md cursor-pointer transition duration-300 ${
                    selectedQuiz?.id === quiz.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleQuizClick(quiz)}
                >
                  <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">Code: {quiz.code}</p>
                  <p className="text-sm text-gray-600">Created: {new Date(quiz.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            {selectedQuiz && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{selectedQuiz.title} - Student Scores</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredSubmissions.length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Score</th>
                        <th className="py-3 px-4 text-left">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">{submission.student_name}</td>
                          <td className="py-4 px-4">{submission.score}%</td>
                          <td className="py-4 px-4">{new Date(submission.submitted_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500">No student submissions found for this quiz.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherQuizScores;