import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TeacherLayout from '@/comps/teacher-layout';
import { Card, CardHeader, CardContent, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { createClient } from '../../../utils/supabase/component';
import { useToast } from '../../hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Save, Cone, Calendar } from 'lucide-react';
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

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number | null;
  max_participants: number | null;
  code: string | null;
  strict_mode: boolean;
  randomize_arrangement: boolean;
  teacher_id: string;
  release_date: string | null;
}

interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection' | 'drag-drop';
  text: string;
  options: string | null;
  correct_answer: string;
  explanation: string | null;
  created_at: string;
}

interface CodeModalProps {
  code: string;
  joinUrl: string;
  onClose: () => void;
}

const SharedSettingsCard = ({ quiz, onSave }: { quiz: Quiz; onSave: (settings: Partial<Quiz>) => Promise<void> }) => {
  const [duration, setDuration] = useState(quiz.duration_minutes?.toString() || '');
  const [maxParticipants, setMaxParticipants] = useState(quiz.max_participants?.toString() || '');
  const [strictMode, setStrictMode] = useState(quiz.strict_mode);
  const [randomize, setRandomize] = useState(quiz.randomize_arrangement);
  const [releaseDate, setReleaseDate] = useState(quiz.release_date || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await onSave({
      duration_minutes: duration ? parseInt(duration) : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      strict_mode: strictMode,
      randomize_arrangement: randomize,
      release_date: releaseDate || null
    });
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Customize Quiz Settings</CardTitle>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-opacity-100 hover:bg-opacity-90"
        >
          {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : 'Edit Settings'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              {isEditing ? (
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="No time limit"
                  className="mt-2"
                />
              ) : (
                <p className="mt-2">{duration ? `${duration} minutes` : 'No time limit'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              {isEditing ? (
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="Unlimited"
                  className="mt-2"
                />
              ) : (
                <p className="mt-2">{maxParticipants || 'Unlimited'}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="releaseDate">Release Date and Time</Label>
            {isEditing ? (
              <Input
                id="releaseDate"
                type="datetime-local"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {releaseDate ? new Date(releaseDate).toLocaleString() : 'Not scheduled'}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            {isEditing ? (
              <>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="strictMode" className="font-medium">Strict Mode</Label>
                    <p className="text-sm text-gray-500 mt-1">Prevents tab switching and full screen exit</p>
                  </div>
                  <Switch
                    id="strictMode"
                    checked={strictMode}
                    onCheckedChange={setStrictMode}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="randomize" className="font-medium">Randomize Questions</Label>
                    <p className="text-sm text-gray-500 mt-1">Questions appear in random order for each student</p>
                  </div>
                  <Switch
                    id="randomize"
                    checked={randomize}
                    onCheckedChange={setRandomize}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <p>Strict Mode: <span className="font-medium">{strictMode ? 'Enabled' : 'Disabled'}</span></p>
                <p>Randomize Questions: <span className="font-medium">{randomize ? 'Enabled' : 'Disabled'}</span></p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CodeModal = ({ code, joinUrl, onClose }: CodeModalProps) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {}
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz Code Generated!</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold text-lg mb-2">Quiz Code</h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-700">{code}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex items-center"
                  >
                    {copiedCode ? (
                      <><Check className="w-4 h-4 mr-2" />Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" />Copy Code</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Scan to Join Quiz</h3>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG 
                  value={joinUrl} 
                  size={200} 
                  level="H" 
                  includeMargin={true} 
                  className="mx-auto" 
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="mt-4"
              >
                {copiedUrl ? (
                  <><Check className="w-4 h-4 mr-2" />URL Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" />Copy Join URL</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewQuiz = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [originalTeacherId, setOriginalTeacherId] = useState<string | null>(null);
  const [isSharedQuiz, setIsSharedQuiz] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const supabase = createClient();
  const { toast } = useToast();

  const cloneQuizForTeacher = async (originalQuizId: string, teacherId: string) => {
    try {
      const { data: originalQuiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', originalQuizId)
        .single();

      if (!originalQuiz) {
        throw new Error('Quiz not found');
      }

      const newQuizData = {
        title: originalQuiz.title,
        duration_minutes: originalQuiz.duration_minutes,
        max_participants: originalQuiz.max_participants,
        strict_mode: originalQuiz.strict_mode,
        randomize_arrangement: originalQuiz.randomize_arrangement,
        teacher_id: teacherId,
        code: null,
        release_date: originalQuiz.release_date,
        created_at: new Date().toISOString()
      };

      const { data: newQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(newQuizData)
        .select()
        .single();

      if (quizError) throw quizError;

      const { data: originalQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', originalQuizId);

      if (questionsError) throw questionsError;

      if (originalQuestions && originalQuestions.length > 0) {
        const newQuestions = originalQuestions.map(q => ({
          quiz_id: newQuiz.id,
          type: q.type,
          text: q.text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('questions')
          .insert(newQuestions);

        if (insertError) throw insertError;
      }

      return newQuiz;
    } catch (error) {
      throw error;
    }
  };

  const generateCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('quizzes')
        .update({ code })
        .eq('id', id);

      if (error) throw error;

      setQuiz(prev => prev ? { ...prev, code } : null);
      const newJoinUrl = `${window.location.origin}/joinquiz?code=${code}`;
      setJoinUrl(newJoinUrl);
      setShowCodeModal(true);
      
      toast({
        title: "Success",
        description: "Quiz code generated successfully"
      });
      
      setTimeout(() => {
        router.push('/teachquiz');
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate quiz code"
      });
    }
  };

  const handleSaveSettings = async (settings: Partial<Quiz>) => {
    try {
      let updatedSettings = { ...settings };
      
      if (settings.release_date) {
        updatedSettings.release_date = new Date(settings.release_date).toISOString();
      }

      const { error } = await supabase
        .from('quizzes')
        .update(updatedSettings)
        .eq('id', id);

      if (error) throw error;

      setQuiz(prev => prev ? { ...prev, ...updatedSettings } : null);
      
      toast({
        title: "Success",
        description: "Quiz settings updated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz settings"
      });
    }
  };
  const handleCloneQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const newQuiz = await cloneQuizForTeacher(id as string, user.id);
      router.replace(`/questionbank/${newQuiz.id}`);
      
      toast({
        title: "Success",
        description: "Quiz cloned successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clone quiz"
      });
    }
  };

  const parseOptions = (optionsString: string | null): string[] => {
    if (!optionsString) return [];
    try {
      return JSON.parse(optionsString);
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      return;
    }

    const fetchQuizData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', id)
          .single();

        if (quizError) throw quizError;

        if (quizData.teacher_id !== user.id) {
          setIsSharedQuiz(true);
          setOriginalTeacherId(quizData.teacher_id);
        }

        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', id)
          .order('created_at', { ascending: true });

        if (questionError) throw questionError;

        setQuiz(quizData as Quiz);
        setQuestions(questionData as Question[]);
        
        if (quizData.code) {
          const newJoinUrl = `${window.location.origin}/joinquiz?code=${quizData.code}`;
          setJoinUrl(newJoinUrl);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id, router]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{quiz?.title}</h1>
            {isSharedQuiz && quiz?.release_date && (
              <p className="text-sm text-gray-600 mt-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Release Date: {new Date(quiz.release_date).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.back()}>Back to Quiz Bank</Button>
            {isSharedQuiz && (
              <Button 
                variant="default"
                onClick={() => setShowCloneDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Cone className="w-4 h-4 mr-2" />
                Clone Quiz
              </Button>
            )}
          </div>
        </div>

        {quiz && (
          <SharedSettingsCard quiz={quiz} onSave={handleSaveSettings} />
        )}

        {!isSharedQuiz && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="border-t pt-4">
                {quiz?.code ? (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{quiz.code}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setJoinUrl(`${window.location.origin}/joinquiz?code=${quiz.code}`);
                        setShowCodeModal(true);
                      }}
                    >
                      View QR Code
                    </Button>
                  </div>
                ) : (
                  <Button onClick={generateCode}>Generate Quiz Code</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className={`${
                    index !== questions.length - 1 ? 'border-b border-gray-200' : ''
                  } py-6 first:pt-0`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {question.type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-800 text-lg">{question.text}</p>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div className="space-y-3 mb-6">
                      <p className="font-medium text-gray-700 mb-2">Answer Choices:</p>
                      {parseOptions(question.options).map((option: string, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            option === question.correct_answer
                              ? 'bg-green-50 border-2 border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-gray-700">{option}</span>
                          </div>
                          {option === question.correct_answer && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div className="space-y-3 mb-6">
                      <p className="font-medium text-gray-700 mb-2">Answer Choices:</p>
                      {['true', 'false'].map((option) => (
                        <div
                          key={option}
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            option === question.correct_answer.toString()
                              ? 'bg-green-50 border-2 border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-gray-700 capitalize">{option}</span>
                          </div>
                          {option === question.correct_answer.toString() && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'short-answer' && (
                    <div className="mb-6">
                      <p className="font-medium text-gray-700 mb-2">Correct Answer:</p>
                      <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                        <span className="text-gray-700">{question.correct_answer}</span>
                      </div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                      <p className="text-blue-800 whitespace-pre-line">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {showCodeModal && quiz?.code && (
          <CodeModal
            code={quiz.code}
            joinUrl={joinUrl}
            onClose={() => setShowCodeModal(false)}
          />
        )}

        <AlertDialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
          <AlertDialogContent className="bg-white border-2 border-gray-200">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Clone Quiz?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700 text-base">
                This will create a copy of the quiz for your use. You&apos;ll be able to modify settings,
                generate your own quiz code, and make any other changes you need.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCloneQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clone Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TeacherLayout>
  );
};

export default ViewQuiz;