// AddQuestions.tsx
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  getQuestionTypeComponent,
  ImageUploadComponent,
} from '@/comps/questionform';

// Types
interface DatabaseQuestion {
  id?: string;
  quiz_id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "multiple-selection" | "drag-drop";
  text: string;
  options: any | null;
  correct_answer: string;
  image_url: string | null;
  explanation: string | null;
  multiple_correct_answers: string[] | null;
  drag_drop_text: string[] | null;
  drag_drop_answers: string[] | null;
  is_in_bank: boolean; // New field
}


interface Question {
  id?: string;
  type: string;
  text: string;
  options?: string[] | null;
  correct_answer: string;
  image_url?: string;
  explanation: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
}

// Main AddQuestions Component
const AddQuestions: React.FC = memo(() => {
  const router = useRouter();
  const { quizId } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    type: "multiple-choice",
    text: "",
    options: ["", ""],
    correct_answer: "",
    explanation: "",
    multiple_correct_answers: [],
  });
  const [quizTitle, setQuizTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const fetchQuizTitle = useCallback(async () => {
    if (!quizId) return;

    const { data, error } = await supabase
      .from("quizzes")
      .select("title")
      .eq("id", quizId)
      .single();

    if (error) {
      console.error("Error fetching quiz title:", error);
    } else if (data) {
      setQuizTitle(data.title);
    }
  }, [quizId, supabase]);

  const fetchQuestions = useCallback(async () => {
    if (!quizId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
    } else if (data) {
      const parsedQuestions = data.map((q) => {
        if (q.type === "drag-drop") {
          return {
            ...q,
            drag_drop_text: q.drag_drop_text || [],
            drag_drop_answers: q.drag_drop_answers || [],
          };
        }
        return {
          ...q,
          options: q.options ? JSON.parse(q.options) : undefined,
          multiple_correct_answers: q.multiple_correct_answers || [],
        };
      });
      setQuestions(parsedQuestions);
    }
    setIsLoading(false);
  }, [quizId, supabase]);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (quizId) {
        await fetchQuizTitle();
        await fetchQuestions();
      }
    };

    initializeQuiz();
  }, [quizId, fetchQuizTitle, fetchQuestions]);

  const handleQuestionTypeChange = useCallback(
    (type: string) => {
      let newQuestion: Question = {
        ...currentQuestion,
        type,
        text: "",
        explanation: currentQuestion.explanation,
      };

      switch (type) {
        case "multiple-choice":
          newQuestion.options = ["", ""];
          newQuestion.correct_answer = "";
          delete newQuestion.multiple_correct_answers;
          delete newQuestion.drag_drop_text;
          delete newQuestion.drag_drop_answers;
          break;
        case "multiple-selection":
          newQuestion.options = ["", ""];
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
            text: "",
            drag_drop_text: [""],
            drag_drop_answers: [],
            correct_answer: "[]",
          };
          delete newQuestion.options;
          delete newQuestion.multiple_correct_answers;
          break;
      }

      setCurrentQuestion(newQuestion);
    },
    [currentQuestion]
  );

  const handleInputChange = useCallback(
    (field: keyof Question, value: string) => {
      setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (currentQuestion.type === "drag-drop") {
        const answerCount = (currentQuestion.text.match(/\[answer\]/g) || [])
          .length;
        const providedAnswers = currentQuestion.drag_drop_answers?.length || 0;

        if (answerCount !== providedAnswers) {
          alert(
            `Question has ${answerCount} placeholders but ${providedAnswers} answers. Please match the number of answers to placeholders.`
          );
          return;
        }
      }
      await addQuestion();
    },
    [currentQuestion]
  );

  const addQuestion = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (!quizId || typeof quizId !== "string") {
        throw new Error("Quiz ID is not available or invalid");
      }
  
      let questionData: DatabaseQuestion = {
        quiz_id: quizId,
        type: currentQuestion.type as DatabaseQuestion["type"],
        text: currentQuestion.text,
        image_url: imageUrl,
        explanation: currentQuestion.explanation || null,
        options: null,
        correct_answer: currentQuestion.correct_answer,
        multiple_correct_answers: null,
        drag_drop_text: null,
        drag_drop_answers: null,
        is_in_bank: true, // Automatically add to question bank
      };
  
      if (currentQuestion.type === "drag-drop") {
        questionData = {
          ...questionData,
          drag_drop_answers: currentQuestion.drag_drop_answers || [],
          correct_answer: JSON.stringify(
            currentQuestion.drag_drop_answers || []
          ),
        };
      } else if (currentQuestion.type === "multiple-selection") {
        questionData = {
          ...questionData,
          options: currentQuestion.options
            ? JSON.stringify(currentQuestion.options)
            : null,
          multiple_correct_answers:
            currentQuestion.multiple_correct_answers || [],
          correct_answer: JSON.stringify(
            currentQuestion.multiple_correct_answers || []
          ),
        };
      } else {
        questionData = {
          ...questionData,
          options: currentQuestion.options
            ? JSON.stringify(currentQuestion.options)
            : null,
          correct_answer: currentQuestion.correct_answer,
        };
      }
  
      const { data, error } = await supabase
        .from("questions")
        .insert([questionData])
        .select();
  
      if (error) throw error;
  
      if (data) {
        const newQuestion =
          data[0].type === "drag-drop"
            ? {
                ...data[0],
                dragDropText: data[0].drag_drop_text,
                dragDropAnswers: data[0].drag_drop_answers,
              }
            : {
                ...data[0],
                options: data[0].options
                  ? JSON.parse(data[0].options)
                  : undefined,
              };
  
        setQuestions((prev) => [...prev, newQuestion]);
  
        // Reset form
        setCurrentQuestion({
          type: "multiple-choice",
          text: "",
          options: ["", ""],
          correct_answer: "",
          explanation: "",
          multiple_correct_answers: [],
        });
        setImageUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, quizId, imageUrl, supabase]);

  const formatMultipleSelectionAnswer = (answer: string) => {
    try {
      const parsedAnswers = JSON.parse(answer);
      if (Array.isArray(parsedAnswers)) {
        return parsedAnswers.join(", ");
      }
      return answer;
    } catch {
      return answer;
    }
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Add Questions to {quizTitle}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Add New Question
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="multiple-selection">Multiple Selection</option>
                  <option value="drag-drop">Drag and Drop</option>
                </select>
              </div>
            </div>

            <ImageUploadComponent
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              fileInputRef={fileInputRef}
            />

            {(() => {
              const QuestionTypeComponent = getQuestionTypeComponent(currentQuestion.type);
              return (
                <QuestionTypeComponent
                  currentQuestion={currentQuestion}
                  setCurrentQuestion={setCurrentQuestion}
                  handleInputChange={handleInputChange}
                />
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explanation for Correct Answer
              </label>
              <textarea
                value={currentQuestion.explanation}
                onChange={(e) =>
                  handleInputChange("explanation", e.target.value)
                }
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <Check size={20} className="mr-2" />
                    Add Question
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Added Questions
            </h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="font-semibold text-lg text-gray-800">
                      Q{index + 1}:{" "}
                      {q.type === "drag-drop" ? "Drag and Drop Question" : q.text}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Type: {q.type}</p>
  
                    {q.image_url && (
                      <div className="mt-2">
                        <Image
                          src={q.image_url}
                          alt="Question image"
                          width={128}
                          height={128}
                          className="object-cover rounded"
                        />
                      </div>
                    )}
  
                    {q.type === "drag-drop" && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          Question Format:
                        </p>
                        <div className="text-sm text-gray-600 mt-1">
                          {q.text.split("[answer]").map((segment, idx, arr) => (
                            <React.Fragment key={idx}>
                              {segment}
                              {idx < arr.length - 1 && (
                                <span className="mx-1 px-4 py-1 bg-blue-100 rounded">
                                  {q.drag_drop_answers?.[idx] || "____"}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <p className="mt-2 text-sm font-medium text-green-600">
                          Answers: {(q.drag_drop_answers || []).join(", ")}
                        </p>
                      </div>
                    )}
  
                    {q.type === "multiple-selection" && q.options && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          Options:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {q.options.map((option, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span>{option}</span>
                              {q.multiple_correct_answers?.includes(option) && (
                                <Check size={16} className="text-green-500" />
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm font-medium text-green-600">
                          Correct Answers:{" "}
                          {formatMultipleSelectionAnswer(q.correct_answer)}
                        </p>
                      </div>
                    )}
  
                    {q.type === "multiple-choice" && q.options && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          Options:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {q.options.map((option, i) => (
                            <li key={i}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
  
                    {q.type !== "drag-drop" && q.type !== "multiple-selection" && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        Correct Answer: {q.correct_answer}
                      </p>
                    )}
  
                    <p className="mt-1 text-sm text-gray-600">
                      Explanation: {q.explanation}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
  
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => router.push("/teachquiz")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => {
                if (quizId) {
                  router.push(`/addquestions/preview-questions?quizId=${quizId}`);
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
            >
              Preview Quiz
            </button>
          </div>
        </div>
      </TeacherLayout>
    );
  });
  
  AddQuestions.displayName = "AddQuestions";
  
  export default AddQuestions;