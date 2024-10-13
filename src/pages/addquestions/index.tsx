import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlusCircle, MinusCircle, Image as ImageIcon, Check } from "lucide-react";

interface Question {
  id?: string;
  type: string;
  text: string;
  options?: string[];
  correct_answer: string;
  image_url?: string;
  explanation: string;
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
      const parsedQuestions = data.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined
      }));
      setQuestions(parsedQuestions);
    }
    setIsLoading(false);
  };

  const addQuestion = async () => {
    setIsSubmitting(true);
    try {
      if (!quizId) {
        throw new Error("Quiz ID is not available");
      }

      let image_url = null;
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('question-images')
          .upload(`${quizId}/${Date.now()}-${imageFile.name}`, imageFile);

        if (uploadError) throw uploadError;

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('question-images')
            .getPublicUrl(uploadData.path);

          image_url = publicUrl;
        }
      }

      const { data, error } = await supabase
        .from("questions")
        .insert([
          {
            quiz_id: quizId,
            type: currentQuestion.type,
            text: currentQuestion.text,
            options: JSON.stringify(currentQuestion.options),
            correct_answer: currentQuestion.correct_answer,
            image_url,
            explanation: currentQuestion.explanation,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        const newQuestion = {
          ...data[0],
          options: data[0].options ? JSON.parse(data[0].options) : undefined
        };
        setQuestions([...questions, newQuestion]);
        setCurrentQuestion({
          type: "multiple-choice",
          text: "",
          options: ["", ""],
          correct_answer: "",
          explanation: "",
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

  const renderQuestionForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Question</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                id="questionType"
                value={currentQuestion.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div>
              <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer
              </label>
              {currentQuestion.type === "multiple-choice" ? (
                <select
                  id="correctAnswer"
                  value={currentQuestion.correct_answer}
                  onChange={(e) => handleInputChange("correct_answer", e.target.value)}
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
                        checked={currentQuestion.correct_answer === value.toLowerCase()}
                        onChange={(e) => handleInputChange("correct_answer", e.target.value)}
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
                  onChange={(e) => handleInputChange("correct_answer", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label htmlFor="questionImage" className="block text-sm font-medium text-gray-700 mb-1">
              Question Image (optional)
            </label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
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

          {currentQuestion.type === "multiple-choice" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
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
          )}

          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Added Questions</h2>
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
                Q{index + 1}: {q.text}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Type: {q.type}</p>
              {q.image_url && (
                <div className="mt-2">
                  <Image src={q.image_url} alt="Question image" width={200} height={200} objectFit="contain" />
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
              <p className="mt-2 text-sm font-medium text-green-600">
                Correct Answer: {q.correct_answer}
              </p>
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
            onClick={() => router.push("/createquiz")}
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