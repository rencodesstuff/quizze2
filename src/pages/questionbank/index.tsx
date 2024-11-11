// pages/questionbank/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import TeacherLayout from "@/comps/teacher-layout";
import { FilterSection } from "@/comps/FilterSection";
import { QuestionCard } from "@/comps/QuestionCard";
import { questionBankService } from "../../../utils/question-bank";
import { useToast } from "../../hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
    Plus,
    Download,
    Upload,
    Trash,
    Tag,
    Star,
    MoreVertical,
    Search,
  } from "lucide-react";
import { QuestionBankItem, QuestionBankFilters, CreateQuestionBankItem } from "../../../types/question-bank";

const PAGE_SIZE = 20;

const QuestionBank = () => {
  // State
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{show: boolean, ids: string[]}>({
    show: false,
    ids: []
  });
  const [previewQuestion, setPreviewQuestion] = useState<QuestionBankItem | null>(null);

  const [filters, setFilters] = useState<QuestionBankFilters>({
    searchTerm: "",
    types: [],
    difficulty: null,
    subject: null,
    topic: null,
    tags: [],
    dateRange: { from: null, to: null },
    sort: 'newest',
    favorites: false,
  });

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const [ref, inView] = useInView();

  // Fetch questions
  const fetchQuestions = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const response = await questionBankService.fetchQuestions(currentPage, filters);
      
      setQuestions(prev => reset ? response.questions : [...prev, ...response.questions]);
      setHasMore(response.hasMore);
      setPage(prev => reset ? 1 : prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load questions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast]);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchQuestions();
    }
  }, [inView, hasMore, loading, fetchQuestions]);

  // Reset and fetch when filters change
  useEffect(() => {
    fetchQuestions(true);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof QuestionBankFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Selection handlers
  const handleSelect = (id: string, selected: boolean) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedQuestions(
      selected ? new Set(questions.map(q => q.id)) : new Set()
    );
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    try {
      await questionBankService.deleteQuestions(Array.from(selectedQuestions));
      setConfirmDelete({ show: false, ids: [] });
      setSelectedQuestions(new Set());
      fetchQuestions(true);
      toast({
        title: "Success",
        description: "Questions deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete questions",
      });
    }
  };

  const handleBulkTagUpdate = async (tags: string[], operation: 'add' | 'remove' | 'set') => {
    try {
      await questionBankService.bulkUpdateTags(
        Array.from(selectedQuestions),
        tags,
        operation
      );
      fetchQuestions(true);
      toast({
        title: "Success",
        description: "Tags updated successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tags",
      });
    }
  };

  // Individual actions
  const handleEdit = (question: QuestionBankItem) => {
    router.push(`/questionbank/edit/${question.id}`);
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete({ show: true, ids: [id] });
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await questionBankService.toggleFavorite(id, isFavorite);
      setQuestions(prev => 
        prev.map(q => q.id === id ? { ...q, is_favorite: isFavorite } : q)
      );
      toast({
        title: "Success",
        description: isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite status",
      });
    }
  };

  // Export/Import
  const handleExport = () => {
    const selectedData = questions.filter(q => selectedQuestions.has(q.id));
    const data = selectedData.length > 0 ? selectedData : questions;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-bank.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const questions = JSON.parse(content) as CreateQuestionBankItem[];
          
          for (const question of questions) {
            await questionBankService.addQuestion(question);
          }
          
          fetchQuestions(true);
          toast({
            title: "Success",
            description: "Questions imported successfully",
          });
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to import questions",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-sm text-gray-500 mt-1">
              {questions.length} questions available
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectedQuestions.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedQuestions.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestions(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Questions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('import-file')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Questions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmDelete({ 
                    show: true, 
                    ids: Array.from(selectedQuestions) 
                  })}
                  disabled={selectedQuestions.size === 0}
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => router.push('/questionbank/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Questions Grid/List */}
        <div className={`mt-6 ${
          viewMode === 'grid' 
            ? 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }`}>
          <AnimatePresence>
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onSelect={handleSelect}
                isSelected={selectedQuestions.has(question.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Trigger */}
        {!loading && hasMore && (
          <div ref={ref} className="h-10" />
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/questionbank/add')}
            >
              Add Your First Question
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete.show} onOpenChange={(open) => !open && setConfirmDelete({ show: false, ids: [] })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete {confirmDelete.ids.length} 
              {confirmDelete.ids.length === 1 ? ' question' : ' questions'}? 
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete({ show: false, ids: [] })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden file input for import */}
        <input
          type="file"
          id="import-file"
          className="hidden"
          accept=".json"
          onChange={handleImport}
        />
      </div>
    </TeacherLayout>
  );
};

export default QuestionBank;