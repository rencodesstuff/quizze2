import Link from "next/link";
import { useRouter } from "next/router";
import { useState, ChangeEvent } from "react";
import TeacherLayout from "@/comps/teacher-layout";

const AddQuestionsPage = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");

  const handleSelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
  };

  const handleAddQuestionClick = () => {
    if (selectedType) {
      router.push(`/addquestions/${selectedType}`);
    } else {
      alert("Please select a question type");
    }
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add Questions</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-2">
              Select Question Type
            </label>
            <select
              id="questionType"
              value={selectedType}
              onChange={handleSelectionChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a type</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
              <option value="drag-and-drop">Drag and Drop</option>
              <option value="matching">Matching</option>
            </select>
          </div>
          <button
            onClick={handleAddQuestionClick}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Add Question
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AddQuestionsPage;