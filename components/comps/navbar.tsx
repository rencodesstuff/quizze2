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
      {/* Title - Smaller on mobile */}
      <h1 className="text-xl sm:text-2xl font-bold text-blue-600 ml-12 sm:ml-0">
        Quiz Dashboard
      </h1>

      {/* User Info Container */}
      <div className="flex items-center">
        {/* Profile Picture - Hidden on mobile */}
        <div className="hidden sm:block relative w-10 h-10 mr-4 rounded-full overflow-hidden ring-2 ring-gray-200">
          <Image
            src={profilePictureUrl}
            alt="User profile"
            fill
            className="object-cover"
          />
        </div>

        {/* User Details - Responsive text size */}
        <div className="text-right">
          <div className="font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
            {studentName}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm">
            {studentId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;