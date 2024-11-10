import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../../utils/supabase/component";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from '@/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/ui/alert-dialog";
import { Pencil, Trash2, Save, Clock, Calendar, Hash, Plus } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  text: string;
  options: string[];
  correct_answer: string;
  image_url?: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  release_date: string;
  code: string | null;
  questions: Question[];
}

const EditQuiz = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id);

      if (questionsError) throw questionsError;

      setQuiz({ ...quizData, questions: questionsData || [] });
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (field: string, value: any) => {
    if (quiz) {
      setQuiz({ ...quiz, [field]: value });
    }
  };

  const handleQuestionChange = (questionId: string, field: string, value: any) => {
    if (quiz) {
      const updatedQuestions = quiz.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const handleQuestionTypeChange = (questionId: string, value: string) => {
    handleQuestionChange(questionId, 'type', value);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (quiz) {
      const updatedQuestions = quiz.questions.filter(q => q.id !== questionId);
      setQuiz({ ...quiz, questions: updatedQuestions });
      
      try {
        const { error } = await supabase
          .from('questions')
          .delete()
          .eq('id', questionId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!quiz) return;

    try {
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quiz.title,
          duration_minutes: quiz.duration_minutes,
          release_date: quiz.release_date,
          code: quiz.code,
        })
        .eq('id', quiz.id);

      if (quizError) throw quizError;

      for (const question of quiz.questions) {
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            type: question.type,
            text: question.text,
            options: question.options,
            correct_answer: question.correct_answer,
            image_url: question.image_url,
            explanation: question.explanation,
          })
          .eq('id', question.id);

        if (questionError) throw questionError;
      }

      router.push('/teachquiz');
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  if (loading) {
    return <TeacherLayout><div className="flex justify-center items-center h-screen">Loading...</div></TeacherLayout>;
  }

  if (!quiz) {
    return <TeacherLayout><div className="flex justify-center items-center h-screen">Quiz not found</div></TeacherLayout>;
  }

  return (
    <TeacherLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Pencil className="w-6 h-6" />
              Edit Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => handleQuizChange('title', e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="duration"
                    type="number"
                    className="pl-8"
                    value={quiz.duration_minutes || ''}
                    onChange={(e) => handleQuizChange('duration_minutes', e.target.value)}
                    placeholder="Enter duration"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_date">Release Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="release_date"
                    type="datetime-local"
                    className="pl-8"
                    value={quiz.release_date}
                    onChange={(e) => handleQuizChange('release_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Quiz Code</Label>
                <div className="relative">
                  <Hash className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="code"
                    className="pl-8"
                    value={quiz.code || ''}
                    onChange={(e) => handleQuizChange('code', e.target.value)}
                    placeholder="Enter quiz code"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Questions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-4">
              {quiz.questions.map((question) => (
                <AccordionItem key={question.id} value={question.id} className="border rounded-lg p-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="text-left font-medium">{question.text}</span>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleQuestionTypeChange(question.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                          <SelectItem value="multiple-selection">Multiple Selection</SelectItem>
                          <SelectItem value="drag-drop">Drag and Drop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Input
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        value={question.correct_answer}
                        onChange={(e) => handleQuestionChange(question.id, 'correct_answer', e.target.value)}
                        placeholder="Enter correct answer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Input
                        value={question.explanation || ''}
                        onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                        placeholder="Enter explanation"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default EditQuiz;
