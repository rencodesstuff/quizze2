// pages/studentprofile/index.tsx
import React, { useState } from "react";
import StudentLayout from "@/comps/student-layout";
import { motion } from "framer-motion";
import { Card, Title, Text, TextInput, Button, Metric } from "@tremor/react";
import { UserCircleIcon, KeyIcon } from "@heroicons/react/outline";

interface ProfileData {
  name: string;
  email: string;
  studentID: string;
  program: string;
  year: string;
  advisor: string;
}

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Syed Zabir',
    email: 'syedzabir@student.gmi.edu.my',
    studentID: 'SWE22070001',
    program: 'Software Engineering',
    year: '2nd Year',
    advisor: 'Dr. Jane Smith'
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileChange = (key: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Profile saved:', profile);
    // Here you would typically send the updated profile to your backend
  };

  const handleChangePassword = () => {
    console.log('Changing password');
    // Here you would typically send the password change request to your backend
  };

  return (
    <StudentLayout>
      <div className="p-6">
        <Title>Student Profile</Title>
        <Text>Manage your personal information and account settings</Text>

        <div className="mt-6 space-y-6">
          <Card>
            <div className="flex items-center space-x-4 mb-6">
              <UserCircleIcon className="h-16 w-16 text-blue-500" />
              <div>
                <Metric>{profile.name}</Metric>
                <Text>{profile.studentID}</Text>
              </div>
            </div>
            
            {Object.entries(profile).map(([key, value]) => (
              <div key={key} className="mb-4">
                <Text className="mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                <TextInput
                  value={value}
                  onChange={(e) => handleProfileChange(key as keyof ProfileData, e.target.value)}
                  placeholder={`Enter your ${key}`}
                />
              </div>
            ))}

            <Button className="mt-4" onClick={handleSave}>Save Changes</Button>
          </Card>

          <Card>
            <Title className="mb-4">Change Password</Title>
            <div className="space-y-4">
              <TextInput
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={KeyIcon}
              />
              <TextInput
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={KeyIcon}
              />
              <TextInput
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={KeyIcon}
              />
              <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;