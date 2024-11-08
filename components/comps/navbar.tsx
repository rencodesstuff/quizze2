import React from "react";
import Image from "next/image";

interface NavbarProps {
  studentName: string;
  studentId: string;
  profilePictureUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ studentName, studentId, profilePictureUrl }) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-blue-600">Quiz Dashboard</h1>
      <div className="flex items-center">
        <div className="relative w-10 h-10 mr-4 rounded-full overflow-hidden ring-2 ring-gray-200">
          <Image
            src={profilePictureUrl}
            alt="User profile"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-bold">{studentName}</div>
          <div className="text-gray-600">{studentId}</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;