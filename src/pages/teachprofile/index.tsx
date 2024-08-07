import React, { useState } from "react";
import TeacherLayout from "@/comps/teacher-layout";

const TeacherProfile = () => {
  const [profile, setProfile] = useState({
    name: 'Dr. Jane Smith',
    email: 'jane.smith@university.edu',
    facultyID: 'FAC20230001',
    department: 'Software Engineering',
    office: 'Room 301, Tech Building',
    officeHours: 'Mon, Wed 2-4 PM'
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log('Profile saved:', profile);
    console.log('Password changed:', password);
  };

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            {Object.entries(profile).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleProfileChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            ))}
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