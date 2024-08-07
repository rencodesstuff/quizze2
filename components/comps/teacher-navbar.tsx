// components/TeacherNavbar.tsx
import React from "react";
import Image from "next/image";

const TeacherNavbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-blue-600">Teacher Dashboard</h1>
      <div className="flex items-center">
        <Image
          src="/TeacherAvatar.png"
          alt="Teacher profile"
          width={40}
          height={40}
          className="rounded-full mr-4"
        />
        <div>
          <div className="font-bold">Dr. Smith</div>
          <div className="text-gray-600">Software Engineering</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavbar;