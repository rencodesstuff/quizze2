import { useState, useEffect } from 'react';
import { createClient } from "../../utils/supabase/component";

export const useStudentInfo = () => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        const { data, error } = await supabase
          .from('students')
          .select('name, student_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('No student data found');

        setStudentName(data.name);
        setStudentId(data.student_id);
      } catch (err) {
        console.error('Error in fetchStudentInfo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, [supabase]);

  return { studentName, studentId, loading };
};