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
  const [profilePictureUrl, setProfilePictureUrl] = useState("/ZabirHD.png"); // Default image
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

    // Fetch user profile picture
    const fetchProfilePicture = async () => {
      const { data: { user } } = await supabasecomp.auth.getUser();
      if (user) {
        const { data, error } = await supabasecomp
          .from('students')
          .select('profile_picture_url')
          .eq('id', user.id)
          .single();

        if (data && data.profile_picture_url) {
          setProfilePictureUrl(data.profile_picture_url);
        }
      }
    };

    fetchProfilePicture();

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
        <Sidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogout}
        />
      </div>

      <div className={`flex-1 flex flex-col p-4 overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        <Navbar 
          studentName={studentName} 
          studentId={studentId} 
          profilePictureUrl={profilePictureUrl}
        />
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;