// ExamSecurityWrapper.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../utils/supabase/component';
import { AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/router';
import ErrorModal from '@/comps/ErrorModal';
import Modal from '@/comps/Modal';

// Define interfaces for database records
interface SecurityViolation {
  quiz_id: string;
  student_id: string;
  violation_type: string;
  student_name: string;
  quiz_title: string;
  occurred_at?: string;
}

interface QuizSubmission {
  student_id: string;
  quiz_id: string;
  answers: Record<string, any>;
  score: number;
  total_questions: number;
  correct_answers: number;
  submitted_at?: string;
}

interface WarningPrompt {
  show: boolean;
  message: string;
  type: 'warning' | 'error' | 'final';
  violation: number;
}

interface ExamSecurityWrapperProps {
  children: React.ReactNode;
  quizId: string;
  teacherId: string;
  studentName: string;
  quizTitle: string;
  strictMode: boolean;
  onForceSubmit?: () => Promise<void>;
}

interface SecurityError {
  title: string;
  message: string;
  type: 'error' | 'warning';
}

const WarningPromptModal: React.FC<{
  prompt: WarningPrompt;
  onConfirm: () => void;
  onSubmit?: () => void;
}> = ({ prompt, onConfirm, onSubmit }) => {
  const getIconAndColor = () => {
    switch (prompt.type) {
      case 'final':
        return {
          icon: <ShieldAlert className="w-12 h-12 text-red-500" />,
          color: 'bg-red-600',
          bgColor: 'bg-red-50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-orange-500" />,
          color: 'bg-orange-600',
          bgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          color: 'bg-yellow-600',
          bgColor: 'bg-yellow-50'
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} rounded-lg p-8 max-w-md w-full m-4 shadow-xl`}>
        <div className="flex flex-col items-center text-center">
          {icon}
          <h3 className="text-xl font-bold mt-4 mb-2">Security Violation Warning</h3>
          <p className="text-gray-600 mb-6">{prompt.message}</p>
          
          <div className="flex gap-4">
            {prompt.type === 'final' ? (
              <button
                onClick={onSubmit}
                className={`px-6 py-2 text-white rounded-lg ${color} hover:opacity-90 transition-opacity duration-200`}
              >
                End Quiz
              </button>
            ) : (
              <button
                onClick={onConfirm}
                className={`px-6 py-2 text-white rounded-lg ${color} hover:opacity-90 transition-opacity duration-200`}
              >
                Return to Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamSecurityWrapper: React.FC<ExamSecurityWrapperProps> = ({ 
  children, 
  quizId,
  teacherId,
  studentName,
  quizTitle,
  strictMode,
  onForceSubmit
}) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [needsUserAction, setNeedsUserAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<SecurityError | null>(null);
  const [warningPrompt, setWarningPrompt] = useState<WarningPrompt>({
    show: false,
    message: '',
    type: 'warning',
    violation: 0
  });
  
  const supabase = createClient();

  const getWarningMessage = (violationCount: number) => {
    switch (violationCount) {
      case 1:
        return "First violation detected! Please stay focused on your quiz. Further violations may result in automatic submission.";
      case 2:
        return "Second violation detected! This is your final warning. One more violation will result in automatic submission with a score of 0.";
      case 3:
        return "Maximum violations reached. Your quiz will be automatically submitted with a score of 0. Click 'End Quiz' to proceed.";
      default:
        return "Security violation detected. Please return to your quiz.";
    }
  };

  const handleError = useCallback((error: SecurityError) => {
    console.error(`Security Error: ${error.title}`, error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const recordViolation = useCallback(async (
    user_id: string,
    violation_type: string
  ): Promise<boolean> => {
    try {
      const violation: SecurityViolation = {
        quiz_id: quizId,
        student_id: user_id,
        violation_type,
        student_name: studentName,
        quiz_title: quizTitle,
        occurred_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quiz_security_violations')
        .insert(violation);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording violation:', error);
      return false;
    }
  }, [quizId, studentName, quizTitle, supabase]);

  const handleForcedSubmission = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication failed');
      }

      const submission: QuizSubmission = {
        student_id: user.id,
        quiz_id: quizId,
        answers: {},
        score: 0,
        total_questions: 0,
        correct_answers: 0,
        submitted_at: new Date().toISOString()
      };

      const { error: submissionError } = await supabase
        .from('quiz_submissions')
        .insert(submission);

      if (submissionError) {
        throw submissionError;
      }

      await recordViolation(user.id, 'max_violations_reached');

      router.push('/stdinbox');
    } catch (error) {
      handleError({
        title: 'Submission Failed',
        message: 'Failed to submit quiz. Please contact your instructor.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quizId, supabase, router, handleError, recordViolation]);

  const handleSecurityViolation = useCallback(async (violationType: string) => {
    if (!strictMode) return;
    
    try {
      const newViolationCount = violationCount + 1;
      setViolationCount(newViolationCount);

      setWarningPrompt({
        show: true,
        message: getWarningMessage(newViolationCount),
        type: newViolationCount >= 3 ? 'final' : newViolationCount === 2 ? 'error' : 'warning',
        violation: newViolationCount
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication failed');
      }

      const recorded = await recordViolation(user.id, violationType);
      if (!recorded) {
        throw new Error('Failed to record violation');
      }

      if (newViolationCount >= 3) {
        setIsBlurred(true);
      }
    } catch (error) {
      handleError({
        title: 'Security Warning',
        message: 'A security violation has occurred. This incident has been recorded.',
        type: 'warning'
      });
    }
  }, [quizId, strictMode, violationCount, recordViolation, handleError]);

  const handlePromptConfirm = () => {
    setWarningPrompt(prev => ({ ...prev, show: false }));
    setIsBlurred(false);
    setShowWarning(false);
    setNeedsUserAction(false);
    enterFullscreen();
  };

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
        setNeedsUserAction(true);
        handleSecurityViolation('tab_switch');
      }
    };

    const handleFocus = () => {
      if (!needsUserAction) {
        setIsBlurred(false);
        setShowWarning(false);
      }
    };

    const handleBlur = () => {
      setIsBlurred(true);
      setShowWarning(true);
      setNeedsUserAction(true);
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
  }, [strictMode, needsUserAction, handleSecurityViolation]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${(isBlurred || needsUserAction) ? 'blur-sm' : ''}`}>
        {children}
      </div>
      
      {warningPrompt.show && (
        <WarningPromptModal
          prompt={warningPrompt}
          onConfirm={handlePromptConfirm}
          onSubmit={handleForcedSubmission}
        />
      )}

      {error && (
        <ErrorModal
          message={error.message}
          onClose={clearError}
        />
      )}

      {strictMode && !isFullscreen && (
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
      )}
    </div>
  );
};

export default ExamSecurityWrapper;