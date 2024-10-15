import React, { useState, useEffect } from 'react';

interface ExamSecurityWrapperProps {
  children: React.ReactNode;
  onSecurityViolation: () => void;
}

const ExamSecurityWrapper: React.FC<ExamSecurityWrapperProps> = ({ children, onSecurityViolation }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        onSecurityViolation();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        onSecurityViolation();
      } else {
        setIsBlurred(false);
      }
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleBlur = () => {
      setIsBlurred(true);
      onSecurityViolation();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onSecurityViolation]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Fullscreen Mode Required</h1>
          <p className="mb-4">Please enter fullscreen mode to continue the exam.</p>
          <button
            onClick={enterFullscreen}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`exam-content ${isBlurred ? 'blur-sm' : ''}`}>
      {isBlurred && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <p className="text-lg font-bold">Warning: Exam Environment Compromised</p>
            <p>Please return to the exam tab immediately.</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default ExamSecurityWrapper;