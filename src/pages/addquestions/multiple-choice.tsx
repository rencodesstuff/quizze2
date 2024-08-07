import { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";

const MultipleChoiceQuestionPage = () => {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    console.log({ question, options, correctOption });
    alert("Question saved!");
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Multiple Choice Question</h1>
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Options</h2>
            {options.map((option, index) => (
              <div key={index}>
                <label htmlFor={`option-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Option {index + 1}
                </label>
                <input
                  type="text"
                  id={`option-${index}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="correctOption" className="block text-sm font-medium text-gray-700 mb-2">
              Correct Option
            </label>
            <select
              id="correctOption"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select the correct option</option>
              {options.map((option, index) => (
                <option key={index} value={option}>{`Option ${index + 1}`}</option>
              ))}
            </select>
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

export default MultipleChoiceQuestionPage;