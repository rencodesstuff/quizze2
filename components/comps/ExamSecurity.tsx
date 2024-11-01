// ExamSecurity.tsx
import React, { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/component';
import { AlertCircle } from 'lucide-react';

interface ExamSecurityWrapperProps {
  children: React.ReactNode;
  quizId: string;
  teacherId: string;
  studentName: string;
  quizTitle: string;
  strictMode: boolean;
}

const ExamSecurityWrapper: React.FC<ExamSecurityWrapperProps> = ({ 
  children, 
  quizId,
  teacherId,
  studentName,
  quizTitle,
  strictMode
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!strictMode) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        handleSecurityViolation('fullscreen_exit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        setShowWarning(true);
        handleSecurityViolation('tab_switch');
      } else {
        setIsBlurred(false);
        setShowWarning(false);
      }
    };

    const handleFocus = () => {
      setIsBlurred(false);
      setShowWarning(false);
    };

    const handleBlur = () => {
      setIsBlurred(true);
      setShowWarning(true);
      handleSecurityViolation('window_blur');
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
  }, [strictMode]);

  const handleSecurityViolation = async (violationType: string) => {
    if (!strictMode) return;
    
    setViolationCount(prev => prev + 1);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Log the security violation
      await supabase.from('quiz_security_violations').insert({
        quiz_id: quizId,
        student_id: user.id,
        violation_type: violationType,
        student_name: studentName,
        quiz_title: quizTitle
      });

      // Send real-time notification
      const channel = supabase.channel('security-violations');
      channel.send({
        type: 'broadcast',
        event: 'security_violation',
        payload: {
          quiz_id: quizId,
          student_name: studentName,
          violation_type: violationType,
          teacher_id: teacherId
        }
      });
    } catch (error) {
      console.error('Error logging security violation:', error);
    }
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  if (strictMode && !isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center z-50">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold mb-4">Fullscreen Mode Required</h1>
          <p className="mb-6">This quiz requires fullscreen mode. Please enter fullscreen mode to continue.</p>
          <button
            onClick={enterFullscreen}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-150"
          >
            Enter Fullscreen Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isBlurred ? 'blur-sm' : ''}`}>
      {children}
      
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Security Warning</h2>
            </div>
            <p className="text-gray-700 mb-4">
              You have left the quiz page. This incident has been recorded. 
              {violationCount > 1 && " Multiple violations may result in quiz termination."}
              {violationCount > 2 && " This is your final warning."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowWarning(false);
                  enterFullscreen();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return to Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSecurityWrapper;