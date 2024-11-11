import React, { useState, useEffect } from "react";
import TeacherLayout from "@/comps/teacher-layout";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/component";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { FileQuestion, Plus, AlertCircle } from "lucide-react";

// Define interface for Quiz type
interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string | null;
  created_at: string;
  code: string | null;
}

const MyQuizzes = () => {
  // State management for quizzes, loading, and error handling
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const supabase = createClient();

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
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
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete quiz';
      setError(errorMessage);
      setIsErrorModalOpen(true);
    }
  };

  const formatReleaseDate = (date: string | null) => {
    if (!date) return 'None (Always available)';
    return new Date(date).toLocaleString();
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No quizzes created</h3>
      <p className="mt-2 text-sm text-gray-500">Get started by creating your first quiz.</p>
      <div className="mt-6">
        <Link href="/createquiz">
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Create New Quiz
          </button>
        </Link>
      </div>
    </div>
  );

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
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState />
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
                    <td className="py-4 px-4">{formatReleaseDate(quiz.release_date)}</td>
                    <td className="py-4 px-4">{new Date(quiz.created_at).toLocaleString()}</td>
                    <td className="py-4 px-4">{quiz.code || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <Link href={`/teachquiz/editquiz/${quiz.id}`}>
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

        {/* Error Modal */}
        <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Error Occurred
              </AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsErrorModalOpen(false)}>
                Okay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TeacherLayout>
  );
};

export default MyQuizzes;