// components/TeacherLayout.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeacherSidebar from "./teachsidebar";
import TeacherNavbar from "./teacher-navbar";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { createClient as createClientComp } from "../../utils/supabase/component";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const supabasecomp = createClientComp();
  const router = useRouter();

  // Determine active item based on the current route
  const activeItem = router.pathname.split('/')[1] || 'teachdash';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabasecomp.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-20 bg-white p-2 rounded-md shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>
      )}

      <div
        className={`${
          isMobile
            ? isSidebarOpen
              ? "fixed inset-y-0 left-0 z-10 w-64"
              : "hidden"
            : "relative"
        } md:block transition-all duration-300 ease-in-out`}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
      >
        <TeacherSidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogout}
        />
      </div>

      <div className={`flex-1 flex flex-col p-4 overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        <TeacherNavbar />
        {children}
      </div>
    </div>
  );
};

export default TeacherLayout;