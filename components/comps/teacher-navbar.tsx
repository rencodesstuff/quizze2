import React from "react";
import Image from "next/image";

interface TeacherNavbarProps {
  teacherName: string;
  teacherCourse: string;
  profilePictureUrl: string;
  isLoading: boolean;
}

const TeacherNavbar: React.FC<TeacherNavbarProps> = ({ teacherName, teacherCourse, profilePictureUrl, isLoading }) => {
  console.log("TeacherNavbar props:", { teacherName, teacherCourse, profilePictureUrl, isLoading });

  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-blue-600">Teacher Dashboard</h1>
      <div className="flex items-center">
        <Image
          src={profilePictureUrl}
          alt="Teacher profile"
          width={40}
          height={40}
          className="rounded-full mr-4"
        />
        <div>
          <div className="font-bold">
            {isLoading ? 'Loading...' : teacherName || 'No name available'}
          </div>
          <div className="text-gray-600">
            {isLoading ? 'Loading...' : teacherCourse || 'No course available'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavbar;