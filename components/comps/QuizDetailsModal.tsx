import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Camera, Check } from 'lucide-react';

export interface QuizDetails {
  code: string;
  title: string;
  releaseDate: string | null;
  durationMinutes: number | null;
}

export interface QuizDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizDetails: QuizDetails;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({ isOpen, onClose, quizDetails }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && quizDetails?.code) {
      setJoinUrl(`${window.location.origin}/joinquiz?code=${quizDetails.code}`);
    }
  }, [quizDetails?.code]);

  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  if (!isOpen || !quizDetails) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(quizDetails.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatAvailability = (dateString: string | null) => {
    if (!dateString) {
      return "Always Available";
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return "Always Available";
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "No time limit";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes} minutes`;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz Created Successfully!</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quiz Details */}
            <div className="space-y-6">
              <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold text-lg mb-2">Quiz Code</h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-700">{quizDetails.code}</span>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-white text-green-700 border border-green-500 rounded-md hover:bg-green-50 transition-colors"
                  >
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 text-lg">Quiz Title</h3>
                  <p className="text-gray-600">{quizDetails.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 text-lg">Availability</h3>
                  <p className="text-gray-600">{formatAvailability(quizDetails.releaseDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 text-lg">Duration</h3>
                  <p className="text-gray-600">{formatDuration(quizDetails.durationMinutes)}</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Scan to Join Quiz</h3>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG
                  value={joinUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Students can scan this QR code to join the quiz on their mobile devices
              </p>

              <button
                onClick={handleCopyUrl}
                className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center"
              >
                <Check className={`w-4 h-4 mr-2 ${copiedCode ? 'opacity-100' : 'opacity-0'}`} />
                {copiedCode ? 'Copied!' : 'Copy Join URL'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsModal;