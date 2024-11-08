import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from "@/comps/admin-layout";
import { 
  Card, 
  Title, 
  Text,
  Button,
  Select,
  SelectItem,
  Divider
} from "@tremor/react";
import { createClient } from '../../../../utils/supabase/component';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  student_id?: string;
  course?: string;
  profile_picture_url?: string;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

const EditUser: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlert({
      show: true,
      type,
      title,
      message
    });

    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      let { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        ({ data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', id)
          .single());
      }

      if (error) throw error;
      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.student_id ? 'student' : 'teacher',
          student_id: data.student_id,
          course: data.course,
          profile_picture_url: data.profile_picture_url
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showAlert('error', 'Error', 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleRoleChange = (value: string) => {
    if (user) {
      setUser({ ...user, role: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Verify admin status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', session?.user?.id)
        .single();

      if (roleError || adminRole?.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      // Update user details
      const table = user.role === 'student' ? 'students' : 'teachers';
      const updateData = user.role === 'student' 
        ? {
            name: user.name,
            email: user.email,
            student_id: user.student_id,
            profile_picture_url: user.profile_picture_url
          }
        : {
            name: user.name,
            email: user.email,
            course: user.course,
            profile_picture_url: user.profile_picture_url
          };

      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        );

        if (passwordError) {
          throw new Error('Failed to update password');
        }
      }

      showAlert('success', 'Success', 'User updated successfully');
      
      // Delay redirect to show success message
      setTimeout(() => {
        router.push('/usermanagement');
      }, 2000);

    } catch (error) {
      console.error('Error updating user:', error);
      showAlert(
        'error', 
        'Error', 
        error instanceof Error ? error.message : 'Failed to update user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center">
          <Text>User not found.</Text>
          <Button className="mt-4" onClick={() => router.push('/usermanagement')}>
            Back to User Management
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Alert Component */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 w-full max-w-md mx-auto"
          >
            <Alert
              variant={alert.type === 'success' ? 'default' : 'destructive'}
              className={`${
                alert.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              } shadow-lg`}
            >
              {alert.type === 'success' ? (
                <CheckCircle2Icon className="h-4 w-4" />
              ) : (
                <XCircleIcon className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <Title>Edit User</Title>
            <Button
              color="gray"
              onClick={() => router.push('/usermanagement')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="shrink-0">
                <img 
                  className="h-16 w-16 object-cover rounded-full" 
                  src={user.profile_picture_url || "/placeholder-avatar.png"} 
                  alt="Profile" 
                />
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input 
                  type="file" 
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100
                  "
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Full name"
                  value={user.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Email address"
                  value={user.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Select
                  id="role"
                  value={user.role}
                  onValueChange={handleRoleChange}
                  disabled={isSubmitting}
                >
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </Select>
              </div>

              {user.role === 'student' && (
                <div>
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    id="student_id"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Student ID"
                    value={user.student_id || ''}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {user.role === 'teacher' && (
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <input
                    type="text"
                    name="course"
                    id="course"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Course"
                    value={user.course || ''}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <Divider />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                color="gray"
                onClick={() => router.push('/usermanagement')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="blue"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditUser;