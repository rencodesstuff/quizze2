import React, { useState } from 'react';
import AdminLayout from '@/comps/admin-layout';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const generateRandomPassword = (length: number = 12): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  userType: string;
  name: string;
  email: string;
  id: string;
  password: string;
}> = ({ isOpen, onClose, userType, name, email, id, password }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Added Successfully</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              {userType.charAt(0).toUpperCase() + userType.slice(1)} has been added to the database.
            </p>
            <p className="mt-1 text-sm text-gray-900"><strong>Name:</strong> {name}</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Email:</strong> {email}</p>
            <p className="mt-1 text-sm text-gray-900"><strong>ID:</strong> {id}</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Temporary Password:</strong> {password}</p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddUserPage: React.FC = () => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [course, setCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Check if email already exists in auth.users
      const { data: existingAuthUser, error: authCheckError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single();

      if (authCheckError && authCheckError.code !== 'PGRST116') {
        throw authCheckError;
      }

      if (existingAuthUser) {
        throw new Error('A user with this email already exists.');
      }

      // Check if student/teacher ID already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from(userType === 'student' ? 'students' : 'teachers')
        .select('id')
        .eq(userType === 'student' ? 'student_id' : 'id', id)
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        throw userCheckError;
      }

      if (existingUser) {
        throw new Error(`A ${userType} with this ID already exists.`);
      }

      const password = generateRandomPassword();
      setNewUserPassword(password);

      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authUser.user) throw new Error('Failed to create user');

      const userId = authUser.user.id;

      // Add user details to the appropriate table
      if (userType === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id: userId,
            name,
            student_id: id,
            email,
          });

        if (studentError) throw studentError;
      } else {
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            id: userId,
            name,
            email,
            course,
          });

        if (teacherError) throw teacherError;
      }

      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          id: userId,
          role: userType,
        });

      if (roleError) throw roleError;

      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create user. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New User</h1>
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                userType === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-150`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                userType === 'teacher'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-150`}
            >
              Teacher
            </button>
          </div>

          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                </svg>
              </span>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                  <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                  <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                </svg>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="id" className="block mb-2 text-sm font-medium text-gray-900">{userType === 'student' ? 'Student ID' : 'Teacher ID'}</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 8a3 3 0 100-6 3 3 0 000 6zm7-3a2 2 0 11-4 0 2 2 0 014 0zm3 7a3 3 0 100-6 3 3 0 000 6z"/>
                  <path d="M5 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm7 0c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm5 3c0-1.657-1.343-3-3-3v6c1.657 0 3-1.343 3-3z"/>
                </svg>
              </span>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                placeholder={userType === 'student' ? 'S12345' : 'T67890'}
                required
              />
            </div>
          </div>

          {userType === 'teacher' && (
            <div>
              <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900">Course</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 5H2a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-5.5 4.5a3 3 0 11-6 0 3 3 0 016 0zM2 18a2 2 0 012-2h12a2 2 0 012 2v2H2v-2z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  placeholder="Mathematics"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : `Add ${userType === 'student' ? 'Student' : 'Teacher'}`}
          </button>
        </form>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setName('');
          setEmail('');
          setId('');
          setCourse('');
        }}
        userType={userType}
        name={name}
        email={email}
        id={id}
        password={newUserPassword}
      />
    </AdminLayout>
  );
};

export default AddUserPage;