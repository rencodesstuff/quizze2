import React from "react";
import Link from "next/link";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardListIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";

interface AdminSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  activeItem: string;
  onLogout: () => void;
}

const sidebarItems = [
  { name: "Dashboard", href: "/admindashboard", icon: HomeIcon },
  { name: "User Management", href: "/usermanagement", icon: UserGroupIcon },
  { name: "Quiz Management", href: "/admin/quizzes", icon: ClipboardListIcon },
  { name: "Add User", href: "/adduser", icon: AcademicCapIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/admin/settings", icon: CogIcon },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  isMobile,
  activeItem,
  onLogout,
}) => {
  return (
    <div
      className={`h-full bg-white shadow-md transition-all duration-300 ease-in-out ${
        isOpen || isMobile ? "w-64" : "w-16"
      } flex flex-col justify-between overflow-hidden`}
    >
      <div>
        <div className="flex items-center justify-center h-16 mb-8">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
        </div>
        <nav className="flex flex-col space-y-2 px-2">
          {sidebarItems.map((item) => (
            <Link href={item.href} key={item.name} passHref>
              <div
                className={`flex items-center p-2 rounded-lg cursor-pointer ${
                  activeItem === item.href.split('/')[2] || (item.href === '/admindash' && activeItem === 'admindash')
                    ? "bg-red-100 text-red-600"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-colors duration-200`}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxWidth: isOpen || isMobile ? '150px' : '0',
                        opacity: isOpen || isMobile ? 1 : 0,
                        transform: `translateX(${isOpen || isMobile ? '0' : '-20px'})`,
                      }}>
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-2 mb-4">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-6 h-6 flex-shrink-0" />
          <span className="ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxWidth: isOpen || isMobile ? '150px' : '0',
                  opacity: isOpen || isMobile ? 1 : 0,
                  transform: `translateX(${isOpen || isMobile ? '0' : '-20px'})`,
                }}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;