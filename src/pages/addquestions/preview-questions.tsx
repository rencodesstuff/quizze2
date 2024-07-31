import React from 'react'; 
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctOption?: string;
  answer?: string;
  pairs?: { left: string; right: string }[];
}

const PreviewQuestionsPage = () => {
  const router = useRouter();
  const [dragItems, setDragItems] = useState<string[]>([]);

  const questions: Question[] = [
    {
      id: '1',
      type: 'multiple-choice',
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctOption: "Paris"
    },
    {
      id: '2',
      type: 'true-false',
      question: "The Earth is flat.",
      options: ["True", "False"],
      correctOption: "False"
    },
    {
      id: '3',
      type: 'short-answer',
      question: "What is the chemical symbol for water?",
      answer: "H2O"
    },
    {
      id: '4',
      type: 'drag-and-drop',
      question: "Order the planets from closest to farthest from the Sun.",
      options: ["Venus", "Mars", "Mercury", "Earth"],
      correctOption: "Mercury,Venus,Earth,Mars"
    },
    {
      id: '5',
      type: 'matching',
      question: "Match the capital cities with their countries.",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Germany", right: "Berlin" },
        { left: "Spain", right: "Madrid" },
        { left: "Italy", right: "Rome" }
      ]
    },
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(dragItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDragItems(items);
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div key={index} className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{question.question}</h2>
            {question.options?.map((option, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <input type="radio" id={`option-${index}-${i}`} name={`question-${index}`} className="mr-3 h-5 w-5" />
                <label htmlFor={`option-${index}-${i}`} className="text-lg">{option}</label>
              </motion.div>
            ))}
          </div>
        );
      case 'true-false':
        return (
          <div key={index} className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{question.question}</h2>
            <div className="flex space-x-4">
              {['True', 'False'].map((option, i) => (
                <motion.label 
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 inline-flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <input type="radio" name={`question-${index}`} value={option.toLowerCase()} className="mr-3 h-5 w-5" />
                  {option}
                </motion.label>
              ))}
            </div>
          </div>
        );
      case 'short-answer':
        return (
          <div key={index} className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{question.question}</h2>
            <motion.input 
              whileFocus={{ scale: 1.05 }}
              type="text" 
              placeholder="Enter your answer" 
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200"
            />
          </div>
        );
      case 'drag-and-drop':
        return (
          <div key={index} className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{question.question}</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {question.options?.map((option, i) => (
                      <Draggable key={option} draggableId={option} index={i}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-white rounded-lg shadow-md cursor-move"
                          >
                            {option}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        );
      case 'matching':
        return (
          <div key={index} className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{question.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {question.pairs?.map((pair, i) => (
                <React.Fragment key={i}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-blue-100 rounded-lg shadow-md"
                  >
                    {pair.left}
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-green-100 rounded-lg shadow-md"
                  >
                    {pair.right}
                  </motion.div>
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center text-gray-800">Preview Questions</h1>
        <div>
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {renderQuestion(question, index)}
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/addquestions')}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg mx-auto block"
        >
          Back to Add Questions
        </motion.button>
      </div>
    </div>
  );
};

export default PreviewQuestionsPage;
