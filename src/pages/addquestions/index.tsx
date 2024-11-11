import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PlusCircle,
  MinusCircle,
  Image as ImageIcon,
  Check,
  GripHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Types for database schema
interface DatabaseQuestion {
  id?: string;
  quiz_id: string;
  type:
    | "multiple-choice"
    | "true-false"
    | "short-answer"
    | "multiple-selection"
    | "drag-drop";
  text: string;
  options: any | null;
  correct_answer: string;
  image_url: string | null;
  explanation: string | null;
  multiple_correct_answers: string[] | null;
  drag_drop_text: string[] | null;
  drag_drop_answers: string[] | null;
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

interface DragDropAnswer {
  id: string;
  text: string;
}

const AddQuestions: React.FC = () => {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
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
  };

  const handleInputChange = (field: keyof Question, value: string) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), ""],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };
  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  const addQuestion = async () => {
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
        let newQuestion;
        if (data[0].type === "drag-drop") {
          newQuestion = {
            ...data[0],
            dragDropText: data[0].drag_drop_text,
            dragDropAnswers: data[0].drag_drop_answers,
          };
        } else {
          newQuestion = {
            ...data[0],
            options: data[0].options ? JSON.parse(data[0].options) : undefined,
          };
        }

        setQuestions([...questions, newQuestion]);

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
  };

  const renderImageUpload = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Question Image (optional)
      </label>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 border rounded flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Question"
              width={64}
              height={64}
              className="rounded object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-300" />
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            {imageUrl ? "Change Image" : "Choose Image"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => {
                setImageUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="ml-2 text-sm text-red-600 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const DragDropInputs: React.FC<{
    currentQuestion: Question;
    setCurrentQuestion: (question: Question) => void;
  }> = ({ currentQuestion, setCurrentQuestion }) => {
    const [answers, setAnswers] = useState<DragDropAnswer[]>([]);
    const [answerInput, setAnswerInput] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
      // Initialize answers from currentQuestion if they exist
      if (currentQuestion.drag_drop_answers) {
        setAnswers(currentQuestion.drag_drop_answers.map((text, index) => ({
          id: `answer-${index}`,
          text
        })));
      }
    }, []);

    const updateQuestionState = useCallback((newAnswers: DragDropAnswer[]) => {
      const answerTexts = newAnswers.map(a => a.text);
      setCurrentQuestion({
        ...currentQuestion,
        drag_drop_answers: answerTexts,
        correct_answer: JSON.stringify(answerTexts)
      });
    }, [currentQuestion, setCurrentQuestion]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentQuestion({
        ...currentQuestion,
        text: e.target.value,
      });
    };

    const insertBlankAtCursor = () => {
      if (!textAreaRef.current) return;

      const textarea = textAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.slice(0, start) + "[answer]" + text.slice(end);

      // Set the new text
      setCurrentQuestion({
        ...currentQuestion,
        text: newText,
      });

      // Update cursor position after state update
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + 8; // length of "[answer]"
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }, 0);
    };

    const handleAddAnswer = () => {
      if (answerInput.trim()) {
        const newAnswer: DragDropAnswer = {
          id: `answer-${Date.now()}`,
          text: answerInput.trim()
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        setAnswerInput("");
        updateQuestionState(newAnswers);
      }
    };

    const handleRemoveAnswer = (id: string) => {
      const newAnswers = answers.filter(answer => answer.id !== id);
      setAnswers(newAnswers);
      updateQuestionState(newAnswers);
    };

    const moveAnswer = (id: string, direction: 'up' | 'down') => {
      const index = answers.findIndex(answer => answer.id === id);
      if (
        (direction === 'up' && index === 0) || 
        (direction === 'down' && index === answers.length - 1)
      ) return;

      const newAnswers = [...answers];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newAnswers[index], newAnswers[newIndex]] = [newAnswers[newIndex], newAnswers[index]];
      
      setAnswers(newAnswers);
      updateQuestionState(newAnswers);
    };

    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Question Text
            </label>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </button>
          </div>
          
          {!previewMode ? (
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={insertBlankAtCursor}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Insert Answer Slot
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Click where you want to add an answer slot, then click the button
                  </p>
                </div>
              </div>
              <textarea
                ref={textAreaRef}
                value={currentQuestion.text}
                onChange={handleTextChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
                placeholder="Type your question text and use the 'Insert Answer Slot' button to add blanks. Example: 'The is the largest planet in our solar system.'"
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Question Preview</h3>
              <div className="text-gray-800">
                {currentQuestion.text.split('[answer]').map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="inline-block px-3 py-1 mx-1 bg-blue-100 text-blue-800 rounded border border-blue-200">
                        {answers[index]?.text || '________'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answers (in order)
          </label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type an answer"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAnswer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAnswer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Add Answer
              </button>
            </div>

            {answers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Answer List</h3>
                <div className="space-y-2">
                  {answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <span className="text-gray-700">{answer.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveAnswer(answer.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveAnswer(answer.id, 'down')}
                          disabled={index === answers.length - 1}
                          className={`p-1 rounded ${
                            index === answers.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAnswer(answer.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <MinusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-700 mb-1">Question Status</h3>
          <p className="text-sm text-blue-600">
            Answer slots: {(currentQuestion.text.match(/\[answer\]/g) || []).length}
            <br />
            Answers provided: {answers.length}
          </p>
          {answers.length > 0 && answers.length !== (currentQuestion.text.match(/\[answer\]/g) || []).length && (
            <p className="text-sm text-red-600 mt-1">
              ⚠️ The number of answer slots should match the number of answers provided.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderMultipleChoiceInputs = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Options
      </label>
      <div className="space-y-2">
        {currentQuestion.options?.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Option ${index + 1}`}
              required
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-2 bg-red-100 text-red-600 rounded-r-md hover:bg-red-200"
            >
              <MinusCircle size={20} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-2 flex items-center px-3 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
      >
        <PlusCircle size={20} className="mr-2" />
        Add Option
      </button>
    </div>
  );

  const renderMultipleSelectionInputs = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Options and Correct Answers
      </label>
      <div className="space-y-2">
        {currentQuestion.options?.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentQuestion.multiple_correct_answers?.includes(
                option
              )}
              onChange={(e) => {
                const newAnswers = e.target.checked
                  ? [
                      ...(currentQuestion.multiple_correct_answers || []),
                      option,
                    ]
                  : (currentQuestion.multiple_correct_answers || []).filter(
                      (a) => a !== option
                    );
                setCurrentQuestion({
                  ...currentQuestion,
                  multiple_correct_answers: newAnswers,
                  correct_answer: JSON.stringify(newAnswers),
                });
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Option ${index + 1}`}
              required
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-2 bg-red-100 text-red-600 rounded-r-md hover:bg-red-200"
            >
              <MinusCircle size={20} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-2 flex items-center px-3 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
      >
        <PlusCircle size={20} className="mr-2" />
        Add Option
      </button>
    </div>
  );

  const renderQuestionList = () => {
    return (
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

              {q.type === "multiple-choice" && q.options && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Options:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {q.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              {q.type === "multiple-selection" && q.options && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Options:</p>
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
                </div>
              )}

              {q.type !== "drag-drop" && (
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
    );
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

              {currentQuestion.type !== "drag-drop" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  {currentQuestion.type === "multiple-choice" ? (
                    <select
                      value={currentQuestion.correct_answer}
                      onChange={(e) =>
                        handleInputChange("correct_answer", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select correct answer</option>
                      {currentQuestion.options?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : currentQuestion.type === "true-false" ? (
                    <div className="flex space-x-4">
                      {["True", "False"].map((value) => (
                        <label key={value} className="inline-flex items-center">
                          <input
                            type="radio"
                            value={value.toLowerCase()}
                            checked={
                              currentQuestion.correct_answer ===
                              value.toLowerCase()
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "correct_answer",
                                e.target.value
                              )
                            }
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{value}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={currentQuestion.correct_answer}
                      onChange={(e) =>
                        handleInputChange("correct_answer", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}
                </div>
              )}
            </div>

            {renderImageUpload()}

            {currentQuestion.type === "drag-drop" ? (
              <DragDropInputs
                currentQuestion={currentQuestion}
                setCurrentQuestion={setCurrentQuestion}
              />
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={currentQuestion.text}
                    onChange={(e) => handleInputChange("text", e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {currentQuestion.type === "multiple-choice" &&
                  renderMultipleChoiceInputs()}
                {currentQuestion.type === "multiple-selection" &&
                  renderMultipleSelectionInputs()}
              </>
            )}

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

        {questions.length > 0 && renderQuestionList()}

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
};

export default AddQuestions;
