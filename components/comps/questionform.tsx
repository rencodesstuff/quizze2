// QuestionTypeComponents.tsx
import React, { useCallback, useState, useRef } from 'react';
import { PlusCircle, MinusCircle, Check, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';

export interface Question {
  id?: string;
  type: string;
  text: string;
  options?: string[] | null;
  correct_answer: string;
  image_url?: string;
  explanation: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
}

interface CommonProps {
  currentQuestion: Question;
  setCurrentQuestion: (question: Question) => void;
  handleInputChange?: (field: keyof Question, value: string) => void;
}

interface DragDropAnswer {
  id: string;
  text: string;
}

// Multiple Choice Component
export const MultipleChoiceInputs: React.FC<CommonProps> = ({
  currentQuestion,
  setCurrentQuestion,
  handleInputChange,
}) => {
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

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={currentQuestion.text}
          onChange={(e) => handleInputChange?.("text", e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer
        </label>
        <select
          value={currentQuestion.correct_answer}
          onChange={(e) => handleInputChange?.("correct_answer", e.target.value)}
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
      </div>
    </>
  );
};

// True/False Component
export const TrueFalseInputs: React.FC<CommonProps> = ({
  currentQuestion,
  handleInputChange,
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={currentQuestion.text}
          onChange={(e) => handleInputChange?.("text", e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer
        </label>
        <div className="flex space-x-4">
          {["True", "False"].map((value) => (
            <label key={value} className="inline-flex items-center">
              <input
                type="radio"
                value={value.toLowerCase()}
                checked={currentQuestion.correct_answer === value.toLowerCase()}
                onChange={(e) => handleInputChange?.("correct_answer", e.target.value)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{value}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

// Short Answer Component
export const ShortAnswerInputs: React.FC<CommonProps> = ({
  currentQuestion,
  handleInputChange,
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={currentQuestion.text}
          onChange={(e) => handleInputChange?.("text", e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer
        </label>
        <input
          type="text"
          value={currentQuestion.correct_answer}
          onChange={(e) => handleInputChange?.("correct_answer", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
    </>
  );
};

// Multiple Selection Component
export const MultipleSelectionInputs: React.FC<CommonProps> = ({
  currentQuestion,
  setCurrentQuestion,
}) => {
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

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={currentQuestion.text}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Options and Correct Answers
        </label>
        <div className="space-y-2">
          {currentQuestion.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={currentQuestion.multiple_correct_answers?.includes(option)}
                onChange={(e) => {
                  const newAnswers = e.target.checked
                    ? [...(currentQuestion.multiple_correct_answers || []), option]
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
    </>
  );
};

// Drag and Drop Component
export const DragDropInputs: React.FC<CommonProps> = ({
  currentQuestion,
  setCurrentQuestion,
}) => {
  const [answers, setAnswers] = useState<DragDropAnswer[]>([]);
  const [answerInput, setAnswerInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (currentQuestion.drag_drop_answers) {
      setAnswers(
        currentQuestion.drag_drop_answers.map((text, index) => ({
          id: `answer-${index}`,
          text,
        }))
      );
    }
  }, [currentQuestion.drag_drop_answers]);

  const updateQuestionState = useCallback(
    (newAnswers: DragDropAnswer[]) => {
      const answerTexts = newAnswers.map((a) => a.text);
      setCurrentQuestion({
        ...currentQuestion,
        drag_drop_answers: answerTexts,
        correct_answer: JSON.stringify(answerTexts),
      });
    },
    [currentQuestion, setCurrentQuestion]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      const cursorPosition = textarea.selectionStart;

      setCurrentQuestion({
        ...currentQuestion,
        text: textarea.value,
      });

      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    },
    [currentQuestion, setCurrentQuestion]
  );

  const insertBlankAtCursor = useCallback(() => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.slice(0, start) + "[answer]" + text.slice(end);

    setCurrentQuestion({
      ...currentQuestion,
      text: newText,
    });

    requestAnimationFrame(() => {
      if (textAreaRef.current) {
        const newPosition = start + 8;
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
      }
    });
  }, [currentQuestion, setCurrentQuestion]);

  const handleAddAnswer = useCallback(() => {
    if (answerInput.trim()) {
      const newAnswer: DragDropAnswer = {
        id: `answer-${Date.now()}`,
        text: answerInput.trim(),
      };
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);
      setAnswerInput("");
      updateQuestionState(newAnswers);
    }
  }, [answerInput, answers, updateQuestionState]);

  const handleRemoveAnswer = useCallback(
    (id: string) => {
      const newAnswers = answers.filter((answer) => answer.id !== id);
      setAnswers(newAnswers);
      updateQuestionState(newAnswers);
    },
    [answers, updateQuestionState]
  );

  const moveAnswer = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = answers.findIndex((answer) => answer.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === answers.length - 1)
      )
        return;

      const newAnswers = [...answers];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      [newAnswers[index], newAnswers[newIndex]] = [
        newAnswers[newIndex],
        newAnswers[index],
      ];

      setAnswers(newAnswers);
      updateQuestionState(newAnswers);
    },
    [answers, updateQuestionState]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Question Text
          </label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </button>
        </div>

        {!previewMode ? (
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={insertBlankAtCursor}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Insert Answer Slot
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Click where you want to add an answer slot, then click the button
                  </p>
                </div>
              </div>
              <textarea
                ref={textAreaRef}
                value={currentQuestion.text}
                onChange={handleTextChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
                placeholder="Type your question text and use the 'Insert Answer Slot' button to add blanks..."
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Question Preview</h3>
              <div className="text-gray-800">
                {currentQuestion.text.split("[answer]").map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="inline-block px-3 py-1 mx-1 bg-blue-100 text-blue-800 rounded border border-blue-200">
                        {answers[index]?.text || "________"}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
  
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answers (in order)
          </label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type an answer"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAnswer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAnswer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Add Answer
              </button>
            </div>
  
            {answers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Answer List</h3>
                <div className="space-y-2">
                  {answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <span className="text-gray-700">{answer.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveAnswer(answer.id, "up")}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0
                              ? "text-gray-400"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveAnswer(answer.id, "down")}
                          disabled={index === answers.length - 1}
                          className={`p-1 rounded ${
                            index === answers.length - 1
                              ? "text-gray-400"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAnswer(answer.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <MinusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
  
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-700 mb-1">Question Status</h3>
          <p className="text-sm text-blue-600">
            Answer slots: {(currentQuestion.text.match(/\[answer\]/g) || []).length}
            <br />
            Answers provided: {answers.length}
          </p>
          {answers.length > 0 &&
            answers.length !==
              (currentQuestion.text.match(/\[answer\]/g) || []).length && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ The number of answer slots should match the number of answers
                provided.
              </p>
            )}
        </div>
      </div>
    );
  };
  
  // Image Upload Component
  export const ImageUploadComponent: React.FC<{
    imageUrl: string | null;
    setImageUrl: (url: string | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
  }> = ({ imageUrl, setImageUrl, fileInputRef }) => {
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
  
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size should be less than 5MB");
          return;
        }
  
        if (!file.type.startsWith("image/")) {
          alert("Please upload an image file");
          return;
        }
  
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Image (optional)
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 border rounded flex items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Question"
                width={64}
                height={64}
                className="rounded object-cover"
              />
            ) : (
              <div className="h-8 w-8 text-gray-300" />
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              {imageUrl ? "Change Image" : "Choose Image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="ml-2 text-sm text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Export a factory function to get the appropriate component
  export const getQuestionTypeComponent = (type: string): React.FC<CommonProps> => {
    const components: { [key: string]: React.FC<CommonProps> } = {
      "multiple-choice": MultipleChoiceInputs,
      "true-false": TrueFalseInputs,
      "short-answer": ShortAnswerInputs,
      "multiple-selection": MultipleSelectionInputs,
      "drag-drop": DragDropInputs,
    };
    return components[type] || MultipleChoiceInputs;
  };