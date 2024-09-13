import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import Image from "next/image";

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              id="questionType"
              value={currentQuestion.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
              <select
                id="correctAnswer"
                value={currentQuestion.correct_answer}
                onChange={(e) => handleInputChange("correct_answer", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                required
              >
                <option value="">Select correct answer</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type="text"
                id="correctAnswer"
                value={currentQuestion.correct_answer}
                onChange={(e) => handleInputChange("correct_answer", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="questionImage" className="block text-sm font-medium text-gray-700 mb-1">
            Question Image (optional)
          </label>
          <input
            type="file"
            id="questionImage"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          {imageFile && (
            <p className="mt-1 text-sm text-gray-500">Selected file: {imageFile.name}</p>
          )}
        </div>

        {currentQuestion.type === "multiple-choice" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-l-md text-sm"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-r-md hover:bg-red-200 text-sm"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 text-sm"
            >
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
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Question"}
          </button>
        </div>
      </form>
    );
  };

  const renderQuestionList = () => {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Added Questions</h2>
        <div className="space-y-2">
          {questions.map((q, index) => (
            <div key={q.id} className="p-3 border rounded-md shadow-sm">
              <p className="font-medium">
                Q{index + 1}: {q.text}
              </p>
              <p className="text-sm text-gray-600">Type: {q.type}</p>
              {q.image_url && (
                <div className="mt-2">
                  <Image src={q.image_url} alt="Question image" width={200} height={200} objectFit="contain" />
                </div>
              )}
              {q.type === "multiple-choice" && q.options && (
                <div className="mt-1">
                  <p className="text-sm font-medium">Options:</p>
                  <ul className="list-disc list-inside text-sm">
                    {q.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-1 text-sm font-medium">
                Correct Answer: {q.correct_answer}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Explanation: {q.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
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
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h1 className="text-xl font-bold text-blue-600 mb-4">
            Add Questions to {quizTitle}
          </h1>
          {renderQuestionForm()}
          {renderQuestionList()}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => router.push("/createquiz")}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Back to Quizzes
            </button>
            <button
              onClick={handlePreviewClick}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Preview Quiz
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AddQuestions;