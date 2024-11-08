import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeacherSidebar from "./teachsidebar";
import TeacherNavbar from "./teacher-navbar";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { createClient as createClientComp } from "../../utils/supabase/component";
import { useAuthProtection, handleLogout } from "../../utils/authProtection";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherCourse, setTeacherCourse] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("/TeacherAvatar.png");
  const [isLoading, setIsLoading] = useState(true);
  const supabasecomp = createClientComp();
  const router = useRouter();

  useAuthProtection();

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

    const fetchTeacherInfo = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching user data...");
        const { data: { user }, error: userError } = await supabasecomp.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        if (user) {
          console.log("Authenticated user:", user);
          console.log("Fetching teacher data for user ID:", user.id);
          const { data, error } = await supabasecomp
            .from('teachers')
            .select('name, course, profile_picture_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching teacher info:', error);
            return;
          }

          console.log("Fetched teacher data:", data);

          if (data) {
            setTeacherName(data.name || "");
            setTeacherCourse(data.course || "");
            if (data.profile_picture_url) {
              setProfilePictureUrl(data.profile_picture_url);
            }
          } else {
            console.warn("No teacher data found for user:", user.id);
          }
        } else {
          console.warn("No authenticated user found");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherInfo();

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

  console.log("Rendering TeacherLayout:", { teacherName, teacherCourse, isLoading });

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
        <TeacherSidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden pl-4 pr-4 pt-4">
        <div className="mb-4">
          <TeacherNavbar 
            teacherName={teacherName} 
            teacherCourse={teacherCourse} 
            profilePictureUrl={profilePictureUrl}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;