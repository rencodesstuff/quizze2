import React, { useState, useEffect } from 'react';

interface QuizDetails {
  code: string;
  title: string;
  releaseDate: string;
  durationMinutes: number;
}

interface QuizDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizDetails: QuizDetails;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({ isOpen, onClose, quizDetails }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quizDetails.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Quiz Created Successfully!</h2>
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="flex-1 bg-green-100 border border-green-400 rounded p-4 mb-4 md:mb-0">
            <h3 className="text-green-800 font-semibold text-lg mb-2">Quiz Code</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-700">{quizDetails.code}</span>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white text-green-700 border border-green-500 rounded hover:bg-green-50 transition-colors"
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 text-lg">Quiz Title</h3>
              <p className="text-gray-600 text-xl">{quizDetails.title}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Release Date and Time
              </h3>
              <p className="text-gray-600">{formatDate(quizDetails.releaseDate)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 text-lg">Duration</h3>
              <p className="text-gray-600">{quizDetails.durationMinutes} minutes</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsModal;