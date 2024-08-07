import { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";

const ShortAnswerQuestionPage = () => {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSave = () => {
    console.log({ question, answer });
    alert("Question saved!");
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Short Answer Question</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter the question here"
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Enter the answer here"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Save Question
            </button>
            <button
              onClick={() => router.push("preview-questions")}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 ease-in-out"
            >
              Preview Questions
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default ShortAnswerQuestionPage;