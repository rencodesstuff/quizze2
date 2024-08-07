import { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const DragAndDropQuestionPage = () => {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [items, setItems] = useState([
    { id: "item1", content: "Item 1" },
    { id: "item2", content: "Item 2" },
    { id: "item3", content: "Item 3" },
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  const handleSave = () => {
    console.log({ question, items });
    alert("Question saved!");
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Drag and Drop Question</h1>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Drag and Drop Items</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="items">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-gray-100 rounded-lg shadow-sm"
                          >
                            {item.content}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
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

export default DragAndDropQuestionPage;