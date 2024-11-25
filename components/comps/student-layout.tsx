// student-layout.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { createClient as createClientComp } from "../../utils/supabase/component";

interface StudentLayoutProps {
  children: React.ReactNode;
  studentName: string;
  studentId: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, studentName, studentId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("/default.png");
  const supabasecomp = createClientComp();
  const router = useRouter();

  const activeItem = router.pathname.split('/')[1] || 'studentdash';

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

    const fetchProfilePicture = async () => {
      try {
        const { data: { user } } = await supabasecomp.auth.getUser();
        if (user) {
          const { data, error } = await supabasecomp
            .from('students')
            .select('profile_picture_url')
            .eq('id', user.id)
            .single();

          if (data?.profile_picture_url) {
            setProfilePictureUrl(data.profile_picture_url);
          }
        }
      } catch (error) {
        setProfilePictureUrl("/default.png");
      }
    };

    fetchProfilePicture();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabasecomp.auth.signOut();
    if (!error) {
      router.push("/signin");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
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
              ? "fixed inset-y-0 left-0 z-40 w-64"
              : "hidden"
            : "relative"
        } md:block transition-all duration-300 ease-in-out`}
        onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden pl-4 pr-4 pt-4">
        <div className="mb-4">
          <Navbar 
            studentName={studentName} 
            studentId={studentId} 
            profilePictureUrl={profilePictureUrl}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;