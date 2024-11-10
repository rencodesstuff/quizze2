import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../../utils/supabase/component";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import {
  Pencil,
  Trash2,
  Save,
  Clock,
  Calendar,
  Hash,
  Plus,
  Check,
  Image as ImageIcon,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[] | null;
  correct_answer: string;
  image_url?: string | null;
  explanation: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Fetch quiz and questions
  const fetchQuiz = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) throw quizError;

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id);

      if (questionsError) throw questionsError;

      const parsedQuestions = questionsData?.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined,
        multiple_correct_answers: q.multiple_correct_answers || [],
        drag_drop_text: q.drag_drop_text || [],
        drag_drop_answers: q.drag_drop_answers || [],
      }));

      setQuiz({ ...quizData, questions: parsedQuestions || [] });
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Handle quiz field changes
  const handleQuizChange = (field: string, value: any) => {
    if (quiz) {
      setQuiz({ ...quiz, [field]: value });
    }
  };

  // Handle editing a question
  const startEditingQuestion = (question: Question) => {
    setEditingQuestion(question);
    setImageUrl(question.image_url || null);
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    if (!editingQuestion) return;

    let newQuestion: Question = {
      ...editingQuestion,
      type,
      text: editingQuestion.text,
      explanation: editingQuestion.explanation,
    };

    switch (type) {
      case "multiple-choice":
        newQuestion.options = editingQuestion.options || ["", ""];
        newQuestion.correct_answer = "";
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.drag_drop_text;
        delete newQuestion.drag_drop_answers;
        break;
      case "multiple-selection":
        newQuestion.options = editingQuestion.options || ["", ""];
        newQuestion.multiple_correct_answers = [];
        newQuestion.correct_answer = "";
        delete newQuestion.drag_drop_text;
        delete newQuestion.drag_drop_answers;
        break;
      case "true-false":
        newQuestion.options = ["True", "False"];
        newQuestion.correct_answer = "";
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.drag_drop_text;
        delete newQuestion.drag_drop_answers;
        break;
      case "short-answer":
        newQuestion.correct_answer = "";
        delete newQuestion.options;
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.drag_drop_text;
        delete newQuestion.drag_drop_answers;
        break;
      case "drag-drop":
        newQuestion = {
          ...newQuestion,
          drag_drop_text: [""],
          drag_drop_answers: [],
          correct_answer: "[]",
        };
        delete newQuestion.options;
        delete newQuestion.multiple_correct_answers;
        break;
    }

    setEditingQuestion(newQuestion);
  };

  // Handle input changes for the editing question
  const handleInputChange = (field: keyof Question, value: any) => {
    if (editingQuestion) {
      setEditingQuestion({ ...editingQuestion, [field]: value });
    }
  };

  // Handle option changes
  const handleOptionChange = (index: number, value: string) => {
    if (!editingQuestion?.options) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  // Add/remove options
  const addOption = () => {
    if (!editingQuestion?.options) return;
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, ""],
    });
  };

  const removeOption = (index: number) => {
    if (!editingQuestion?.options) return;
    const newOptions = editingQuestion.options.filter((_, i) => i !== index);
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  // Handle image changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save question changes
  const handleSaveQuestion = async () => {
    if (!editingQuestion || !quiz) return;
    setIsSubmitting(true);

    try {
      const questionData = {
        ...editingQuestion,
        image_url: imageUrl,
        options: editingQuestion.options
          ? JSON.stringify(editingQuestion.options)
          : null,
        quiz_id: quiz.id,
      };

      const { error } = await supabase
        .from("questions")
        .update(questionData)
        .eq("id", editingQuestion.id);

      if (error) throw error;

      // Update local state
      const updatedQuestions = quiz.questions.map((q) =>
        q.id === editingQuestion.id
          ? { ...editingQuestion, image_url: imageUrl }
          : q
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!quiz) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      const updatedQuestions = quiz.questions.filter(
        (q) => q.id !== questionId
      );
      setQuiz({ ...quiz, questions: updatedQuestions });
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Save all quiz changes
  const handleSave = async () => {
    if (!quiz) return;
    try {
      const { error: quizError } = await supabase
        .from("quizzes")
        .update({
          title: quiz.title,
          duration_minutes: quiz.duration_minutes,
          release_date: quiz.release_date,
          code: quiz.code,
        })
        .eq("id", quiz.id);

      if (quizError) throw quizError;
      router.push("/teachquiz");
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </TeacherLayout>
    );
  }

  if (!quiz) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center h-screen">
          Quiz not found
        </div>
      </TeacherLayout>
    );
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
                  onChange={(e) => handleQuizChange("title", e.target.value)}
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
                    value={quiz.duration_minutes || ""}
                    onChange={(e) =>
                      handleQuizChange("duration_minutes", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleQuizChange("release_date", e.target.value)
                    }
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
                    value={quiz.code || ""}
                    onChange={(e) => handleQuizChange("code", e.target.value)}
                    placeholder="Enter quiz code"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingQuestion?.id === question.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Question Type</Label>
                          <Select
                            value={editingQuestion.type}
                            onValueChange={handleQuestionTypeChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="true-false">
                                True/False
                              </SelectItem>
                              <SelectItem value="short-answer">
                                Short Answer
                              </SelectItem>
                              <SelectItem value="multiple-selection">
                                Multiple Selection
                              </SelectItem>
                              <SelectItem value="drag-drop">
                                Drag and Drop
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {editingQuestion.type !== "drag-drop" && (
                          <div>
                            <Label>Question Text</Label>
                            <Input
                              value={editingQuestion.text}
                              onChange={(e) =>
                                handleInputChange("text", e.target.value)
                              }
                              placeholder="Enter question text"
                            />
                          </div>
                        )}
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label>Question Image (optional)</Label>
                        <div className="flex items-center space-x-4">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt="Question"
                              width={64}
                              height={64}
                              className="rounded object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-16 w-16 text-gray-300" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              ref={fileInputRef}
                              className="hidden"
                            />
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="secondary"
                            >
                              Choose Image
                            </Button>
                            {imageUrl && (
                              <Button
                                variant="ghost"
                                onClick={() => setImageUrl(null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Multiple Choice Options */}
                      {editingQuestion.type === "multiple-choice" && (
                        <div className="space-y-4">
                          <Label>Options</Label>
                          {editingQuestion.options?.map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(optionIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      {/* Multiple Selection */}
                      {editingQuestion.type === "multiple-selection" && (
                        <div className="space-y-4">
                          <Label>Options and Correct Answers</Label>
                          {editingQuestion.options?.map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={editingQuestion.multiple_correct_answers?.includes(
                                    option
                                  )}
                                  onChange={(e) => {
                                    const newAnswers = e.target.checked
                                      ? [
                                          ...(editingQuestion.multiple_correct_answers ||
                                            []),
                                          option,
                                        ]
                                      : editingQuestion.multiple_correct_answers?.filter(
                                          (a) => a !== option
                                        ) || [];
                                    handleInputChange(
                                      "multiple_correct_answers",
                                      newAnswers
                                    );
                                  }}
                                  className="w-4 h-4"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(optionIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      {/* Drag and Drop */}
                      {editingQuestion.type === "drag-drop" && (
                        <div className="space-y-4">
                          <Label>Question Text with Blanks</Label>
                          <textarea
                            value={editingQuestion.text}
                            onChange={(e) => {
                              handleInputChange("text", e.target.value);
                              const segments = e.target.value.split("[blank]");
                              handleInputChange("drag_drop_text", segments);
                            }}
                            className="w-full p-2 border rounded-md"
                            rows={4}
                            placeholder="Enter text with [blank] placeholders"
                          />
                          <div>
                            <Label>Drag-Drop Answers</Label>
                            <div className="space-y-2">
                              {editingQuestion.drag_drop_answers?.map(
                                (answer, answerIndex) => (
                                  <div
                                    key={answerIndex}
                                    className="flex items-center space-x-2"
                                  >
                                    <Input
                                      value={answer}
                                      onChange={(e) => {
                                        const newAnswers = [
                                          ...(editingQuestion.drag_drop_answers ||
                                            []),
                                        ];
                                        newAnswers[answerIndex] =
                                          e.target.value;
                                        handleInputChange(
                                          "drag_drop_answers",
                                          newAnswers
                                        );
                                      }}
                                      placeholder={`Answer ${answerIndex + 1}`}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newAnswers =
                                          editingQuestion.drag_drop_answers?.filter(
                                            (_, i) => i !== answerIndex
                                          );
                                        handleInputChange(
                                          "drag_drop_answers",
                                          newAnswers
                                        );
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <MinusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newAnswers = [
                                    ...(editingQuestion.drag_drop_answers ||
                                      []),
                                    "",
                                  ];
                                  handleInputChange(
                                    "drag_drop_answers",
                                    newAnswers
                                  );
                                }}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Answer
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Correct Answer (for non-drag-drop questions) */}
                      {editingQuestion.type !== "drag-drop" && (
                        <div>
                          <Label>Correct Answer</Label>
                          {editingQuestion.type === "true-false" ? (
                            <div className="flex space-x-4">
                              {["True", "False"].map((value) => (
                                <label
                                  key={value}
                                  className="inline-flex items-center"
                                >
                                  <input
                                    type="radio"
                                    value={value.toLowerCase()}
                                    checked={
                                      editingQuestion.correct_answer ===
                                      value.toLowerCase()
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "correct_answer",
                                        e.target.value
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span>{value}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <Input
                              value={editingQuestion.correct_answer}
                              onChange={(e) =>
                                handleInputChange(
                                  "correct_answer",
                                  e.target.value
                                )
                              }
                              placeholder="Enter correct answer"
                            />
                          )}
                        </div>
                      )}

                      <div>
                        <Label>Explanation</Label>
                        <textarea
                          value={editingQuestion.explanation}
                          onChange={(e) =>
                            handleInputChange("explanation", e.target.value)
                          }
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="Enter explanation for the correct answer"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingQuestion(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveQuestion}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          Question {index + 1}: {question.text}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Type: {question.type}
                        </p>

                        {question.image_url && (
                          <Image
                            src={question.image_url}
                            alt="Question image"
                            width={200}
                            height={200}
                            className="rounded-md"
                          />
                        )}

                        {question.type === "multiple-choice" &&
                          question.options && (
                            <div className="ml-4">
                              <p className="font-medium">Options:</p>
                              <ul className="list-disc list-inside">
                                {question.options.map((option, i) => (
                                  <li key={i} className="text-sm">
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {question.type === "multiple-selection" &&
                          question.options && (
                            <div className="ml-4">
                              <p className="font-medium">Options:</p>
                              <ul className="list-disc list-inside">
                                {question.options.map((option, i) => (
                                  <li
                                    key={i}
                                    className="text-sm flex items-center"
                                  >
                                    {option}
                                    {question.multiple_correct_answers?.includes(
                                      option
                                    ) && (
                                      <Check className="h-4 w-4 text-green-500 ml-2" />
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {question.type === "drag-drop" && (
                          <div className="ml-4 space-y-2">
                            <p className="font-medium">Drag-Drop Format:</p>
                            <div className="text-sm">
                              {question.drag_drop_text?.map((segment, idx) => (
                                <React.Fragment key={idx}>
                                  {segment}
                                  {idx <
                                    (question.drag_drop_text?.length || 0) -
                                      1 && (
                                    <span className="mx-1 px-2 py-1 bg-blue-100 rounded">
                                      {question.drag_drop_answers?.[idx] ||
                                        "____"}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">Answers: </span>
                              {question.drag_drop_answers?.join(", ")}
                            </p>
                          </div>
                        )}

                        <p className="text-sm">
                          <span className="font-medium">Correct Answer: </span>
                          {question.correct_answer}
                        </p>

                        <p className="text-sm">
                          <span className="font-medium">Explanation: </span>
                          {question.explanation}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditingQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Question
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteQuestion(question.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.push("/teachquiz")}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default EditQuiz;
