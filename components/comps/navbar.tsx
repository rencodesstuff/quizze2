// components/Navbar.tsx
import React from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-blue-600">Quiz Dashboard</h1>
      <div className="flex items-center">
        <Image
          src="/ZabirHD.png"
          alt="User profile"
          width={40}
          height={40}
          className="rounded-full mr-4"
        />
        <div>
          <div className="font-bold">Syed Zabir</div>
          <div className="text-gray-600">SWE22070167</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;