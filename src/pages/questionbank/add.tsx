import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { questionBankService } from "../../../utils/question-bank";
import {
  QuestionType,
  DifficultyLevel,
  CreateQuestionBankItem,
} from "../../../types/question-bank";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Alert, AlertDescription } from "@/ui/alert";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { getQuestionTypeComponent, ImageUploadComponent, Question } from "@/comps/questionform";

// Extend the base Question type with our additional fields
interface ExtendedQuestionBankItem {
  question_text: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  subject: string;
  topic: string;
  correct_answer: string;
  explanation: string;
  options: string[];
  image_url: string | undefined;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
}

const AddQuestion = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initial question state
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedQuestionBankItem>({
    question_text: "",
    text: "",
    type: "multiple-choice",
    difficulty: "Medium",
    subject: "",
    topic: "",
    correct_answer: "",
    options: [],
    explanation: "",
    image_url: undefined
  });

  const questionTypes: QuestionType[] = [
    "multiple-choice",
    "true-false",
    "short-answer",
    "multiple-selection",
    "drag-drop",
  ];

  const difficultyLevels: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

  const handleInputChange = (field: keyof ExtendedQuestionBankItem, value: any) => {
    setCurrentQuestion((prev) => {
      const updates: Partial<ExtendedQuestionBankItem> = {
        [field]: value,
      };

      // Sync text and question_text fields
      if (field === "text") {
        updates.question_text = value;
      } else if (field === "question_text") {
        updates.text = value;
      }

      return { ...prev, ...updates };
    });
  };

  // Question type component wrapper with proper type handling
  const QuestionTypeWrapper = () => {
    const Component = getQuestionTypeComponent(currentQuestion.type);
    
    const handleQuestionUpdate = (question: Question) => {
      setCurrentQuestion((prev) => ({
        ...prev,
        text: question.text,
        question_text: question.text,
        type: question.type as QuestionType,
        options: question.options || [],
        correct_answer: question.correct_answer,
        image_url: question.image_url,
        explanation: question.explanation,
        multiple_correct_answers: question.multiple_correct_answers,
        drag_drop_text: question.drag_drop_text,
        drag_drop_answers: question.drag_drop_answers,
      }));
    };

    // Convert ExtendedQuestionBankItem to Question for the component
    const componentQuestion: Question = {
      id: "temp", // Temporary ID for form purposes
      text: currentQuestion.text,
      type: currentQuestion.type,
      options: currentQuestion.options,
      correct_answer: currentQuestion.correct_answer,
      image_url: currentQuestion.image_url,
      explanation: currentQuestion.explanation,
      multiple_correct_answers: currentQuestion.multiple_correct_answers,
      drag_drop_text: currentQuestion.drag_drop_text,
      drag_drop_answers: currentQuestion.drag_drop_answers,
    };

    return (
      <Component
        currentQuestion={componentQuestion}
        setCurrentQuestion={handleQuestionUpdate}
        handleInputChange={(field, value) => {
          if (field === "text") {
            handleInputChange("text", value);
            handleInputChange("question_text", value);
          } else {
            handleInputChange(field as keyof ExtendedQuestionBankItem, value);
          }
        }}
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!currentQuestion.question_text || !currentQuestion.subject || !currentQuestion.topic) {
        throw new Error("Please fill in all required fields");
      }

      if (currentQuestion.type === "multiple-choice" && (!currentQuestion.options || currentQuestion.options.length < 2)) {
        throw new Error("Multiple choice questions must have at least 2 options");
      }

      if (!currentQuestion.correct_answer) {
        throw new Error("Please provide the correct answer");
      }

      const submissionData: CreateQuestionBankItem = {
        question_text: currentQuestion.question_text,
        type: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        correct_answer: currentQuestion.correct_answer,
        options: currentQuestion.options,
        explanation: currentQuestion.explanation,
      };

      await questionBankService.addQuestion(submissionData);
      router.push("/questionbank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Question Bank
          </Button>
        </div>

        <Card className="bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Add New Question</CardTitle>
            <CardDescription>Create a new question for your question bank</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                {/* Question Type Selection */}
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value) => handleInputChange("type", value as QuestionType)}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {questionTypes.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {type.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload Component */}
                <ImageUploadComponent
                  imageUrl={currentQuestion.image_url || null}
                  setImageUrl={(url) => handleInputChange("image_url", url)}
                  fileInputRef={fileInputRef}
                />

                {/* Dynamic Question Type Component */}
                <QuestionTypeWrapper />

                {/* Subject and Topic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Subject*</Label>
                    <input
                      type="text"
                      placeholder="e.g., Mathematics"
                      value={currentQuestion.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Topic*</Label>
                    <input
                      type="text"
                      placeholder="e.g., Algebra"
                      value={currentQuestion.topic}
                      onChange={(e) => handleInputChange("topic", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={currentQuestion.difficulty}
                    onValueChange={(value) => handleInputChange("difficulty", value as DifficultyLevel)}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {difficultyLevels.map((level) => (
                        <SelectItem
                          key={level}
                          value={level}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Explanation Field */}
                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <textarea
                    placeholder="Explain the correct answer..."
                    value={currentQuestion.explanation || ""}
                    onChange={(e) => handleInputChange("explanation", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md min-h-[100px] resize-y"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Adding Question..." : "Add Question"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
};

export default AddQuestion;