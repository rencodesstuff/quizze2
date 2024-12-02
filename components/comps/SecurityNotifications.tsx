import React, { useEffect, useState } from 'react';
import { createClient } from '../../utils/supabase/component';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface SecurityViolation {
  id: string;
  student_name: string;
  quiz_title: string;
  violation_type: string;
  occurred_at: string;
  quiz_id: string;
}

interface RealtimePayload {
  payload: {
    teacher_id: string;
    student_name: string;
    quiz_title: string;
    violation_type: string;
  };
}

const SecurityNotifications: React.FC = () => {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem('dismissedViolations');
    if (saved) {
      setDismissedIds(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let channel: ReturnType<typeof supabase.channel>;

    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!user) return;

        const { data: teacherQuizzes } = await supabase
          .from('quizzes')
          .select('id')
          .eq('teacher_id', user.id);

        if (!teacherQuizzes?.length) return;

        const { data: existingViolations } = await supabase
          .from('quiz_security_violations')
          .select('*')
          .in('quiz_id', teacherQuizzes.map(quiz => quiz.id))
          .order('occurred_at', { ascending: false });

        if (existingViolations) {
          const filteredViolations = existingViolations
            .filter(violation => !dismissedIds.includes(violation.id))
            .map(v => ({
              id: v.id,
              student_name: v.student_name,
              quiz_title: v.quiz_title,
              violation_type: v.violation_type,
              occurred_at: v.occurred_at,
              quiz_id: v.quiz_id
            }));
          
          setViolations(filteredViolations);
        }

        channel = supabase.channel('security-violations-channel')
          .on(
            'broadcast',
            { event: 'security_violation' },
            (payload: RealtimePayload) => {
              if (payload.payload.teacher_id === user.id) {
                const newViolation: SecurityViolation = {
                  id: Date.now().toString(),
                  student_name: payload.payload.student_name,
                  quiz_title: payload.payload.quiz_title,
                  violation_type: payload.payload.violation_type,
                  occurred_at: new Date().toISOString(),
                  quiz_id: 'realtime'
                };
                
                if (!dismissedIds.includes(newViolation.id)) {
                  setViolations(prev => [newViolation, ...prev]);
                }
              }
            }
          );

        await channel.subscribe();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      channel?.unsubscribe();
    };
  }, [dismissedIds, isLoading]);

  const removeNotification = (id: string) => {
    const updatedDismissedIds = [...dismissedIds, id];
    setDismissedIds(updatedDismissedIds);
    localStorage.setItem('dismissedViolations', JSON.stringify(updatedDismissedIds));
    setViolations(prev => prev.filter(v => v.id !== id));
  };

  const formatViolationMessage = (type: string): string => {
    switch (type) {
      case 'tab_switch': return 'switched tabs';
      case 'window_blur': return 'left the quiz window';
      case 'fullscreen_exit': return 'exited fullscreen mode';
      default: return 'performed an unauthorized action';
    }
  };

  if (isLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-4 z-50">
      <AnimatePresence>
        {violations.map(violation => (
          <motion.div
            key={violation.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white rounded-lg shadow-lg p-4 max-w-md border-l-4 border-red-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Security Violation</h3>
              </div>
              <button
                onClick={() => removeNotification(violation.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{violation.quiz_title}</span>: Student{' '}
              {violation.student_name} has {formatViolationMessage(violation.violation_type)} during the quiz.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(violation.occurred_at).toLocaleTimeString()}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SecurityNotifications;