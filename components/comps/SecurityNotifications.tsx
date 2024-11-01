// components/SecurityNotifications.tsx
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
}

const SecurityNotifications: React.FC = () => {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel('security-violations')
        .on('broadcast', { event: 'security_violation' }, payload => {
          if (payload.payload.teacher_id === user.id) {
            const newViolation: SecurityViolation = {
              id: Date.now().toString(),
              student_name: payload.payload.student_name,
              quiz_title: payload.payload.quiz_title, // Add this from the payload
              violation_type: payload.payload.violation_type,
              occurred_at: new Date().toISOString()
            };
            setViolations(prev => [newViolation, ...prev]);
          }
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    fetchUser();
  }, []);

  const removeNotification = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id));
  };

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
              <span className="font-semibold">{violation.quiz_title}</span>: Student {violation.student_name} has {
                violation.violation_type === 'tab_switch' ? 'switched tabs' :
                violation.violation_type === 'window_blur' ? 'left the quiz window' :
                'exited fullscreen mode'
              } during the quiz.
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