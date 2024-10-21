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

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  student_id?: string;
  course?: string;
  profile_picture_url?: string;
}

const EditUser: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      // First, check in the students table
      let { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        // If not found in students, check in teachers
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

    try {
      const table = user.role === 'student' ? 'students' : 'teachers';
      const { error } = await supabase
        .from(table)
        .update({
          name: user.name,
          email: user.email,
          student_id: user.student_id,
          course: user.course,
          profile_picture_url: user.profile_picture_url
        })
        .eq('id', user.id);

      if (error) throw error;

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (passwordError) throw passwordError;
      }

      alert('User updated successfully!');
      router.push('/usermanagement');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  if (isLoading) {
    return <AdminLayout><Text>Loading user details...</Text></AdminLayout>;
  }

  if (!user) {
    return <AdminLayout><Text>User not found.</Text></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <Title>Edit User</Title>
            <Button color="red" onClick={() => router.push('/usermanagement')}>
              Cancel
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="shrink-0">
                <img className="h-16 w-16 object-cover rounded-full" src={user.profile_picture_url || "https://via.placeholder.com/150"} alt="Profile" />
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input type="file" className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100
                "/>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                  value={user.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="user@example.com"
                  value={user.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select
                  id="role"
                  value={user.role}
                  onValueChange={handleRoleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </Select>
              </div>

              {user.role === 'student' && (
                <div>
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    id="student_id"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Student ID"
                    value={user.student_id || ''}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {user.role === 'teacher' && (
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <input
                    type="text"
                    name="course"
                    id="course"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Course"
                    value={user.course || ''}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <Divider />

            <div className="flex justify-end">
              <Button type="submit" color="blue">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditUser;