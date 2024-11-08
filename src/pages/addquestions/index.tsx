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

interface DatabaseQuestion {
  quiz_id: string | string[];
  type: string;
  text: string;
  image_url: string | null;
  explanation: string;
  options?: string | null;
  correct_answer: string;
  multiple_correct_answers?: string[] | null;
  drag_drop_text?: string[] | null;
  drag_drop_answers?: string[] | null;
}

interface Question {
  id?: string;
  type: string;
  text: string;
  options?: string[];
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

  const supabase = createClient();

  useEffect(() => {
    if (quizId) {
      fetchQuizTitle();
      fetchQuestions();
    }
  }, [quizId]);

  // ... (keeping existing fetch functions)
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
            dragDropText: q.drag_drop_text,
            dragDropAnswers: q.drag_drop_answers,
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
      text: currentQuestion.text,
      explanation: currentQuestion.explanation,
    };

    switch (type) {
      case "multiple-choice":
        newQuestion.options = ["", ""];
        newQuestion.correct_answer = "";
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.dragDropText;
        delete newQuestion.dragDropAnswers;
        break;
      case "multiple-selection":
        newQuestion.options = ["", ""];
        newQuestion.multiple_correct_answers = [];
        newQuestion.correct_answer = "";
        delete newQuestion.dragDropText;
        delete newQuestion.dragDropAnswers;
        break;
      case "true-false":
        newQuestion.options = ["True", "False"];
        newQuestion.correct_answer = "";
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.dragDropText;
        delete newQuestion.dragDropAnswers;
        break;
      case "short-answer":
        newQuestion.correct_answer = "";
        delete newQuestion.options;
        delete newQuestion.multiple_correct_answers;
        delete newQuestion.dragDropText;
        delete newQuestion.dragDropAnswers;
        break;
      case "drag-drop":
        newQuestion = {
          ...newQuestion,
          text: "",
          dragDropText: [""],
          dragDropAnswers: [],
          correct_answer: JSON.stringify([]),
        };
        delete newQuestion.options;
        delete newQuestion.multiple_correct_answers;
        break;
    }

    setCurrentQuestion(newQuestion);
  };

  // ... (keeping existing handlers)
  const addQuestion = async () => {
    setIsSubmitting(true);
    try {
      if (!quizId) {
        throw new Error("Quiz ID is not available");
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
        type: currentQuestion.type,
        text: currentQuestion.text,
        image_url,
        explanation: currentQuestion.explanation,
        correct_answer: currentQuestion.correct_answer
      };
  
      // Add type-specific data
      if (currentQuestion.type === 'drag-drop') {
        questionData = {
          ...questionData,
          drag_drop_text: currentQuestion.dragDropText || [],
          drag_drop_answers: currentQuestion.dragDropAnswers || [],
          correct_answer: JSON.stringify(currentQuestion.dragDropAnswers || []),
          options: null,
          multiple_correct_answers: null,
        };
      } else if (currentQuestion.type === 'multiple-selection') {
        questionData = {
          ...questionData,
          options: currentQuestion.options ? JSON.stringify(currentQuestion.options) : null,
          multiple_correct_answers: currentQuestion.multiple_correct_answers,
          correct_answer: currentQuestion.correct_answer,
          drag_drop_text: null,
          drag_drop_answers: null,
        };
      } else {
        questionData = {
          ...questionData,
          options: currentQuestion.options ? JSON.stringify(currentQuestion.options) : null,
          correct_answer: currentQuestion.correct_answer,
          multiple_correct_answers: null,
          drag_drop_text: null,
          drag_drop_answers: null,
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

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertBlankAtCursor = () => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.slice(0, start) + "[blank]" + text.slice(end);
    const segments = newText.split("[blank]");

    setCurrentQuestion({
      ...currentQuestion,
      text: newText,
      dragDropText: segments,
      dragDropAnswers: new Array(segments.length - 1).fill(""),
      correct_answer: JSON.stringify([]),
    });

    // Set cursor position after the inserted [blank]
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 7, start + 7);
    }, 0);
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

  const renderDragDropInputs = () => {
    const dragDropLength = currentQuestion.dragDropText?.length ?? 0;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text with Blanks
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={insertBlankAtCursor}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <PlusCircle size={16} />
                Add Answer Blank
              </button>
              <p className="text-sm text-gray-600">
                Click where you want to add a blank answer space
              </p>
            </div>
            <div className="relative">
              <textarea
                ref={textAreaRef}
                value={currentQuestion.text}
                onChange={(e) => {
                  const text = e.target.value;
                  const segments = text.split("[blank]");
                  setCurrentQuestion({
                    ...currentQuestion,
                    text: text,
                    dragDropText: segments,
                    dragDropAnswers: new Array(segments.length - 1).fill(""),
                    correct_answer: JSON.stringify([]),
                  });
                }}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start typing your question and click 'Add Answer Blank' where needed. Example: The capital of France is ___ and it is known as the ___ of Love."
                required
              />
            </div>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {dragDropLength > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answers for Blanks (in order of appearance)
            </label>
            <div className="space-y-4">
              {Array.from({ length: dragDropLength - 1 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                    <span className="flex items-center justify-center bg-blue-100 text-blue-800 rounded-full w-6 h-6 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">
                        Answer for blank #{index + 1}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentQuestion.dragDropAnswers?.[index] || ""}
                          onChange={(e) => {
                            const newAnswers = [
                              ...(currentQuestion.dragDropAnswers || []),
                            ];
                            newAnswers[index] = e.target.value;
                            setCurrentQuestion({
                              ...currentQuestion,
                              dragDropAnswers: newAnswers,
                              correct_answer: JSON.stringify(newAnswers),
                            });
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter correct answer for blank ${
                            index + 1
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dragDropLength > 1 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
            <div className="text-sm text-gray-600">
              {currentQuestion.dragDropText?.map((segment, index) => (
                <React.Fragment key={index}>
                  {segment}
                  {index < dragDropLength - 1 && (
                    <span className="mx-1 px-4 py-1 bg-blue-100 rounded-full">
                      Blank #{index + 1}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Answers (in order):
              </h4>
              <div className="flex gap-2 flex-wrap">
                {currentQuestion.dragDropAnswers?.map((answer, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {index + 1}. {answer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
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

          {currentQuestion.type === "multiple-choice" &&
            renderMultipleChoiceInputs()}
          {currentQuestion.type === "multiple-selection" &&
            renderMultipleSelectionInputs()}

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
                    {q.dragDropText?.map((segment, idx) => (
                      <React.Fragment key={idx}>
                        {segment}
                        {idx < (q.dragDropText?.length || 0) - 1 && (
                          <span className="mx-1 px-4 py-1 bg-blue-100 rounded">
                            {q.dragDropAnswers?.[idx] || "____"}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="mt-2 text-sm font-medium text-green-600">
                    Correct Answers: {q.dragDropAnswers?.join(", ")}
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
