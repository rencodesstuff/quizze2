// components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import {
  HomeIcon,
  ClipboardCheckIcon,
  InboxIcon,
  UserIcon,
  CogIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  activeItem: string;
  onLogout: () => void;
}

const sidebarItems = [
  { name: "Dashboard", href: "/studentdash", icon: HomeIcon },
  { name: "Student Quiz", href: "/stdquiz", icon: ClipboardCheckIcon },
  { name: "Student Inbox", href: "/stdinbox", icon: InboxIcon },
  { name: "Student Profile", href: "/studentprofile", icon: UserIcon },
  { name: "Student Settings", href: "/stdsettings", icon: CogIcon },
];

const Sidebar: React.FC<SidebarProps> = ({
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
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            Q
          </div>
        </div>
        <nav className="flex flex-col space-y-2 px-2">
          {sidebarItems.map((item) => (
            <Link href={item.href} key={item.name} passHref>
              <div
                className={`flex items-center p-2 rounded-lg cursor-pointer ${
                  activeItem === item.href.split('/')[1]
                    ? "bg-blue-100 text-blue-600"
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

export default Sidebar;