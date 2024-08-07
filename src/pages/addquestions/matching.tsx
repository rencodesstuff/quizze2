import { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";

const MatchingQuestionPage = () => {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [pairs, setPairs] = useState([
    { id: 1, left: "", right: "" },
    { id: 2, left: "", right: "" },
  ]);

  const handleAddPair = () => {
    setPairs([...pairs, { id: pairs.length + 1, left: "", right: "" }]);
  };

  const handlePairChange = (id: number, side: "left" | "right", value: string) => {
    const newPairs = pairs.map((pair) =>
      pair.id === id ? { ...pair, [side]: value } : pair
    );
    setPairs(newPairs);
  };

  const handleSave = () => {
    console.log({ question, pairs });
    alert("Question saved!");
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Matching Question</h1>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Matching Pairs</h2>
            {pairs.map((pair) => (
              <div key={pair.id} className="flex space-x-4 mb-4">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => handlePairChange(pair.id, "left", e.target.value)}
                  className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Left item"
                />
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => handlePairChange(pair.id, "right", e.target.value)}
                  className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Right item"
                />
              </div>
            ))}
            <button
              onClick={handleAddPair}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out"
            >
              Add Pair
            </button>
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

export default MatchingQuestionPage;