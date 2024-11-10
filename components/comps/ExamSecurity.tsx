import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../utils/supabase/component';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';
import ErrorModal from '@/comps/ErrorModal';
import Modal from '@/comps/Modal';

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
  const supabase = createClient();

  const handleError = useCallback((error: SecurityError) => {
    console.error(`Security Error: ${error.title}`, error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSecurityViolation = useCallback(async (violationType: string) => {
    if (!strictMode) return;
    
    try {
      const newViolationCount = violationCount + 1;
      setViolationCount(newViolationCount);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw {
          title: 'Authentication Error',
          message: 'Unable to verify user identity. Please refresh the page and try again.',
          type: 'error'
        };
      }

      if (!user) {
        throw {
          title: 'Session Error',
          message: 'No active session found. Please log in again.',
          type: 'error'
        };
      }

      const { error: violationError } = await supabase.from('quiz_security_violations').insert({
        quiz_id: quizId,
        student_id: user.id,
        violation_type: violationType,
        student_name: studentName,
        quiz_title: quizTitle
      });

      if (violationError) {
        throw {
          title: 'Security Warning',
          message: 'Failed to record security violation. This incident will be reported.',
          type: 'warning'
        };
      }

      const channel = supabase.channel('security-violations');
      await channel.send({
        type: 'broadcast',
        event: 'security_violation',
        payload: {
          quiz_id: quizId,
          student_name: studentName,
          violation_type: violationType,
          teacher_id: teacherId,
          violation_count: newViolationCount
        }
      });

      if (newViolationCount >= 3) {
        await handleForcedSubmission();
      }
    } catch (error) {
      handleError(error as SecurityError);
    }
  }, [quizId, teacherId, studentName, quizTitle, strictMode, violationCount, supabase, handleError]);

  const handleForcedSubmission = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw {
          title: 'Submission Error',
          message: 'Authentication failed during submission. Please contact your instructor.',
          type: 'error'
        };
      }

      if (!user) {
        throw {
          title: 'Session Error',
          message: 'Session expired during submission. Your progress may be lost.',
          type: 'error'
        };
      }

      const { error: submissionError } = await supabase.from('quiz_submissions').insert({
        student_id: user.id,
        quiz_id: quizId,
        answers: {},
        score: 0,
        total_questions: 0,
        correct_answers: 0
      });

      if (submissionError) {
        throw {
          title: 'Submission Failed',
          message: 'Failed to submit quiz due to multiple security violations. Contact your instructor.',
          type: 'error'
        };
      }

      const { error: violationError } = await supabase.from('quiz_security_violations').insert({
        quiz_id: quizId,
        student_id: user.id,
        violation_type: 'max_violations_reached',
        student_name: studentName,
        quiz_title: quizTitle
      });

      if (violationError) {
        handleError({
          title: 'Warning',
          message: 'Failed to log final violation. The incident has been recorded.',
          type: 'warning'
        });
      }

      router.push('/stdinbox');
    } catch (error) {
      handleError(error as SecurityError);
    }
  }, [isSubmitting, quizId, studentName, quizTitle, supabase, router, handleError]);

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

  const handleReturnToQuiz = () => {
    setNeedsUserAction(false);
    setIsBlurred(false);
    setShowWarning(false);
    enterFullscreen();
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
    <div className="relative">
      <div className={`transition-all duration-300 ${(isBlurred || needsUserAction) ? 'blur-sm' : ''}`}>
        {children}
      </div>
      
      {/* Security Warning Modal */}
      {(showWarning || needsUserAction) && (
        <Modal
          isOpen={true}
          onClose={handleReturnToQuiz}
          title="Security Warning"
          message={`You have left the quiz page. This is violation ${violationCount} of 3. 
            ${violationCount === 2 ? 'This is your final warning!' : ''}
            ${violationCount >= 3 ? 'Maximum violations reached. Your quiz will be automatically submitted with a score of 0.' : 'Please return to the quiz immediately.'}`}
          isError={violationCount >= 2}
        />
      )}

      {/* Error Modal */}
      {error && (
        <ErrorModal
          message={error.message}
          onClose={clearError}
        />
      )}
    </div>
  );
};

export default ExamSecurityWrapper;