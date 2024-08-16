import React, { useState, useEffect, useRef } from "react";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import { UserCircleIcon } from "@heroicons/react/outline";

interface ProfileData {
  name: string;
  email: string;
  course: string;
  profile_picture_url: string | null;
}

const TeacherProfile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    course: '',
    profile_picture_url: null
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching user data...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Error fetching user: ${userError.message}`);
      }

      if (!user) {
        throw new Error('No user logged in');
      }

      console.log("User fetched successfully:", user.id);
      
      console.log("Fetching teacher profile...");
      const { data, error: profileError } = await supabase
        .from('teachers')
        .select('name, email, course, profile_picture_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Error fetching profile: ${profileError.message}`);
      }

      if (!data) {
        throw new Error('No profile data found');
      }

      console.log("Profile fetched successfully:", data);
      setProfile(data as ProfileData);
      setImageDataUrl(data.profile_picture_url);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No user logged in');
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('teachers')
        .update({ ...profile, profile_picture_url: imageDataUrl })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }

      // Change password if new password is provided
      if (password.new) {
        if (password.new !== password.confirm) {
          setError('New passwords do not match');
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({ 
          password: password.new 
        });

        if (passwordError) {
          throw new Error(`Error changing password: ${passwordError.message}`);
        }

        // Clear password fields
        setPassword({ current: '', new: '', confirm: '' });
      }

      setSuccessMessage('Profile and password updated successfully');
      fetchProfile(); // Refresh the profile data
    } catch (err) {
      console.error('Error in handleSave:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) return <TeacherLayout><div>Loading...</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Profile</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="h-16 w-16 text-blue-500" />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Choose Image
                </button>
              </div>
            </div>

            {Object.entries(profile).map(([key, value]) => {
              if (key !== 'profile_picture_url') {
                return (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value as string}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            {Object.entries(password).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key === 'new' ? 'New Password' : key === 'confirm' ? 'Confirm New Password' : 'Current Password'}
                </label>
                <input
                  type="password"
                  name={key}
                  value={value}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherProfile;