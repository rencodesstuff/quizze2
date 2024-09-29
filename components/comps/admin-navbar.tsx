import React from "react";

interface AdminNavbarProps {
  adminName: string;
  isLoading: boolean;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ adminName, isLoading }) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
      {!isLoading && (
        <div className="flex items-center">
          <div>
            <div className="font-bold">{adminName}</div>
            <div className="text-gray-600">Administrator</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;