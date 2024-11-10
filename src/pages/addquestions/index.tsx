// AddQuestions.tsx
import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// Types to match your database schema
interface DatabaseQuestion {
  id?: string;
  quiz_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-selection' | 'drag-drop';
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
  dragDropText?: string[];
  dragDropAnswers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (quizId) {
      fetchQuizTitle();
      fetchQuestions();
    }
  }, [quizId]);

  const fetchQuizTitle = async () => {
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
  };

  const fetchQuestions = async () => {
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
        if (q.type === 'drag-drop') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addQuestion();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handlePreviewClick = () => {
    if (quizId) {
      router.push(`/addquestions/preview-questions?quizId=${quizId}`);
    } else {
      console.error("Quiz ID is undefined");
      alert("Unable to preview quiz. Please try again.");
    }
  };

  const renderDragDropInputs = () => {
    const [dragDropAnswers, setDragDropAnswers] = useState<string[]>([]);
    const [answerInput, setAnswerInput] = useState('');

    const handleAddAnswer = () => {
      if (answerInput.trim()) {
        const newAnswers = [...dragDropAnswers, answerInput.trim()];
        setDragDropAnswers(newAnswers);
        setAnswerInput('');

        setCurrentQuestion(prev => ({
          ...prev,
          drag_drop_answers: newAnswers,
          correct_answer: JSON.stringify(newAnswers)
        }));
      }
    };

    const handleRemoveAnswer = (index: number) => {
      const newAnswers = dragDropAnswers.filter((_, i) => i !== index);
      setDragDropAnswers(newAnswers);
      
      setCurrentQuestion(prev => ({
        ...prev,
        drag_drop_answers: newAnswers,
        correct_answer: JSON.stringify(newAnswers)
      }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      const segments = text.split('[blank]');
      
      setCurrentQuestion((prev: Question) => ({
        ...prev,
        text: text,
        drag_drop_text: segments,
        options: undefined, // Change null to undefined
      }));
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  if (!textAreaRef.current) return;
                  const textarea = textAreaRef.current;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const newText = text.slice(0, start) + '[blank]' + text.slice(end);
                  handleTextChange({ target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>);
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Insert Blank
              </button>
              <span className="text-sm text-gray-500">
                Click where you want to add a blank answer space
              </span>
            </div>
            <textarea
              ref={textAreaRef}
              value={currentQuestion.text}
              onChange={handleTextChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Example: The capital of France is [blank] and it is known as the [blank] of Love."
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Answers
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
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAnswer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAnswer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {dragDropAnswers.map((answer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{index + 1}.</span>
                    <span className="text-gray-700">{answer}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnswer(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <MinusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {currentQuestion.drag_drop_text && currentQuestion.drag_drop_text.length > 1 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview:</h3>
            <div className="text-gray-600">
              {currentQuestion.drag_drop_text.map((segment, index) => (
                <React.Fragment key={index}>
                  {segment}
                  {index < currentQuestion.drag_drop_text!.length - 1 && (
                    <span className="inline-block px-3 py-1 mx-1 bg-blue-100 text-blue-800 rounded">
                      {dragDropAnswers[index] || `Blank ${index + 1}`}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
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
              checked={currentQuestion.multiple_correct_answers?.includes(option)}
              onChange={(e) => {
                const newAnswers = e.target.checked
                  ? [...(currentQuestion.multiple_correct_answers || []), option]
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

const addQuestion = async () => {
  setIsSubmitting(true);
  try {
    if (!quizId || typeof quizId !== 'string') {
      throw new Error("Quiz ID is not available or invalid");
    }
  
      let image_url = null;
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("question-images")
          .upload(`${quizId}/${Date.now()}-${imageFile.name}`, imageFile);
  
        if (uploadError) throw uploadError;
  
        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("question-images")
            .getPublicUrl(uploadData.path);
  
          image_url = publicUrl;
        }
      }

      // Prepare question data based on type
      let questionData: DatabaseQuestion = {
        quiz_id: quizId,
        type: currentQuestion.type as DatabaseQuestion['type'],
        text: currentQuestion.text,
        image_url,
        explanation: currentQuestion.explanation || null,
        options: null,
        correct_answer: currentQuestion.correct_answer,
        multiple_correct_answers: null,
        drag_drop_text: null,
        drag_drop_answers: null
      };
  
      // Add type-specific data
      if (currentQuestion.type === 'drag-drop') {
        questionData = {
          ...questionData,
          drag_drop_text: currentQuestion.drag_drop_text || [],
          drag_drop_answers: currentQuestion.drag_drop_answers || [],
          correct_answer: JSON.stringify(currentQuestion.drag_drop_answers || []),
        };
      } else if (currentQuestion.type === 'multiple-selection') {
        questionData = {
          ...questionData,
          options: currentQuestion.options ? JSON.stringify(currentQuestion.options) : null,
          multiple_correct_answers: currentQuestion.multiple_correct_answers || [],
          correct_answer: JSON.stringify(currentQuestion.multiple_correct_answers || []),
        };
      } else {
        questionData = {
          ...questionData,
          options: currentQuestion.options ? JSON.stringify(currentQuestion.options) : null,
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
        if (data[0].type === 'drag-drop') {
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
        setCurrentQuestion({
          type: "multiple-choice",
          text: "",
          options: ["", ""],
          correct_answer: "",
          explanation: "",
          multiple_correct_answers: [],
        });
        setImageFile(null);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
              {q.type === "drag-drop" && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Question Format:
                  </p>
                  <div className="text-sm text-gray-600 mt-1">
                    {q.drag_drop_text?.map((segment, idx) => (
                      <React.Fragment key={idx}>
                        {segment}
                        {idx < (q.drag_drop_text?.length || 0) - 1 && (
                          <span className="mx-1 px-4 py-1 bg-blue-100 rounded">
                            {q.drag_drop_answers?.[idx] || "____"}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="mt-2 text-sm font-medium text-green-600">
                    Answers: {q.drag_drop_answers?.join(", ")}
                  </p>
                </div>
              )}
  
              {q.image_url && (
                <div className="mt-2">
                  <Image
                    src={q.image_url}
                    alt="Question image"
                    width={200}
                    height={200}
                    objectFit="contain"
                  />
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
  
  const renderQuestionForm = () => {
    return (
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
            {renderQuestionTypeSelect()}

            {currentQuestion.type !== "drag-drop" && (
              <div>
                <label
                  htmlFor="correctAnswer"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correct Answer
                </label>
                {currentQuestion.type === "multiple-choice" ? (
                  <select
                    id="correctAnswer"
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
                            handleInputChange("correct_answer", e.target.value)
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
                    id="correctAnswer"
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

          {currentQuestion.type === "drag-drop" ? (
            renderDragDropInputs()
          ) : (
            <div>
              <label
                htmlFor="questionText"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Text
              </label>
              <textarea
                id="questionText"
                value={currentQuestion.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="questionImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question Image (optional)
            </label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-full w-full text-gray-300" />
                )}
              </span>
              <label
                htmlFor="file-upload"
                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {currentQuestion.type === "multiple-choice" && renderMultipleChoiceInputs()}
          {currentQuestion.type === "multiple-selection" && renderMultipleSelectionInputs()}

          <div>
            <label
              htmlFor="explanation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Explanation for Correct Answer
            </label>
            <textarea
              id="explanation"
              value={currentQuestion.explanation}
              onChange={(e) => handleInputChange("explanation", e.target.value)}
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
    );
  };

  const renderQuestionTypeSelect = () => (
    <div>
      <label
        htmlFor="questionType"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Question Type
      </label>
      <select
        id="questionType"
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
  );

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
        {renderQuestionForm()}
        {renderQuestionList()}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => router.push("/teachquiz")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Back to Quizzes
          </button>
          <button
            onClick={handlePreviewClick}
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