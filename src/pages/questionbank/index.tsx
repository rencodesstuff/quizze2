import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import TeacherLayout from "@/comps/teacher-layout";
import { ShareQuizDialog } from "@/comps/ShareQuiz";
import { useToast } from "../../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Clock,
  Search,
  Calendar,
  Users,
  BookOpen,
  Share2,
  Eye,
  Edit,
  Shield,
  Shuffle,
} from "lucide-react";
import { createClient } from "../../../utils/supabase/component";
import { format } from "date-fns";

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  release_date: string | null;
  max_participants: number | null;
  strict_mode: boolean;
  randomize_arrangement: boolean;
  created_at: string;
  teacher_id: string;
  code: string;
  question_count: number;
  is_shared?: boolean;
  shared_by?: {
    name: string;
    email: string;
  };
  access_code?: string;
}

interface QuizFilters {
  searchTerm: string;
  sortBy: 'newest' | 'oldest' | 'alphabetical';
  view: 'my-quizzes' | 'shared-with-me';
}

const PAGE_SIZE = 12;

const QuizBank = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<QuizFilters>({
    searchTerm: "",
    sortBy: 'newest',
    view: 'my-quizzes'
  });

  const router = useRouter();
  const { toast } = useToast();
  const [ref, inView] = useInView();
  const supabase = createClient();

  const fetchQuizzes = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query;

      if (filters.view === 'shared-with-me') {
        query = supabase
          .from('shared_quizzes')
          .select(`
            access_code,
            quizzes!inner (
              *,
              questions (count)
            ),
            teachers:shared_by (
              name,
              email
            )
          `)
          .eq('shared_with', user.id);

        // Apply search
        if (filters.searchTerm) {
          query = query.ilike('quizzes.title', `%${filters.searchTerm}%`);
        }

        // Apply sort
        switch (filters.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'alphabetical':
            query = query.order('quizzes(title)', { ascending: true });
            break;
        }
      } else {
        query = supabase
          .from('quizzes')
          .select(`
            *,
            questions (count)
          `, { count: 'exact' })
          .eq('teacher_id', user.id);

        if (filters.searchTerm) {
          query = query.ilike('title', `%${filters.searchTerm}%`);
        }

        switch (filters.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'alphabetical':
            query = query.order('title', { ascending: true });
            break;
        }
      }

      query = query.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      let transformedQuizzes: Quiz[];

      if (filters.view === 'shared-with-me') {
        transformedQuizzes = data?.map(item => ({
          ...item.quizzes,
          question_count: item.quizzes.questions[0]?.count || 0,
          shared_by: {
            name: item.teachers.name,
            email: item.teachers.email
          },
          access_code: item.access_code,
          is_shared: true
        })) || [];
      } else {
        transformedQuizzes = data?.map(quiz => ({
          ...quiz,
          question_count: quiz.questions[0]?.count || 0
        })) || [];
      }

      setQuizzes(prev => reset ? transformedQuizzes : [...prev, ...transformedQuizzes]);
      setHasMore(count ? (currentPage + 1) * PAGE_SIZE < count : false);
      setPage(prev => reset ? 1 : prev + 1);

    } catch (err) {
      console.error('Error fetching quizzes:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quizzes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast, supabase]);

  useEffect(() => {
    fetchQuizzes(true);
  }, [fetchQuizzes, filters]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchQuizzes();
    }
  }, [inView, hasMore, loading, fetchQuizzes]);

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {
    const [showShareDialog, setShowShareDialog] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl mb-1">{quiz.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>Code: {quiz.is_shared ? quiz.access_code : quiz.code}</span>
                  <span>•</span>
                  <span>{format(new Date(quiz.created_at), 'MMM d, yyyy')}</span>
                </CardDescription>
                {quiz.is_shared && quiz.shared_by && (
                  <p className="text-sm text-gray-500 mt-1">
                    Shared by: {quiz.shared_by.name}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {quiz.duration_minutes ? `${quiz.duration_minutes} minutes` : 'No time limit'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                {quiz.question_count} questions
              </div>
              {quiz.max_participants && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Max {quiz.max_participants} participants
                </div>
              )}
              {quiz.strict_mode && (
                <div className="flex items-center text-sm text-blue-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Strict Mode Enabled
                </div>
              )}
              {quiz.randomize_arrangement && (
                <div className="flex items-center text-sm text-purple-600">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Question Order
                </div>
              )}
            </div>
            
            <div className="mt-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/quiz/${quiz.id}`)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              {!quiz.is_shared && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareDialog(true)}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/quiz/${quiz.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {!quiz.is_shared && (
          <ShareQuizDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            quizId={quiz.id}
            quizTitle={quiz.title}
          />
        )}
      </motion.div>
    );
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Bank</h1>
            <p className="text-sm text-gray-500 mt-1">
              {quizzes.length} quizzes available
            </p>
          </div>
          
          {filters.view === 'my-quizzes' && (
            <Button
              onClick={() => router.push('/createquiz')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Quiz
            </Button>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <Button
              variant={filters.view === 'my-quizzes' ? 'default' : 'outline'}
              onClick={() => setFilters(prev => ({ ...prev, view: 'my-quizzes' }))}
              className="flex-1 sm:flex-none"
            >
              My Quizzes
            </Button>
            <Button
              variant={filters.view === 'shared-with-me' ? 'default' : 'outline'}
              onClick={() => setFilters(prev => ({ ...prev, view: 'shared-with-me' }))}
              className="flex-1 sm:flex-none"
            >
              Shared with Me
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search quizzes..."
                className="pl-8"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            <select
              className="p-2 border rounded-md"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                sortBy: e.target.value as QuizFilters['sortBy']
              }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </AnimatePresence>
        </div>

        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {filters.view === 'my-quizzes' ? 'No quizzes yet' : 'No shared quizzes'}
            </h3>
            <p className="text-gray-500 mt-2">
              {filters.view === 'my-quizzes' 
                ? 'Create your first quiz to get started'
                : 'No quizzes have been shared with you yet'
              }
            </p>
            {filters.view === 'my-quizzes' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/createquiz')}
              >
                Create a Quiz
              </Button>
            )}
          </div>
        )}

        {!loading && hasMore && (
          <div ref={ref} className="h-10" />
        )}
      </div>
    </TeacherLayout>
  );
};

export default QuizBank;