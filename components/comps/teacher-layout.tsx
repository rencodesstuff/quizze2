// teacher-layout.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/router";
import TeacherSidebar from "./teachsidebar";
import TeacherNavbar from "./teacher-navbar";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { createClient as createClientComp } from "../../utils/supabase/component";
import { useAuthProtection, handleLogout } from "../../utils/authProtection";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = memo(({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState({
    name: "",
    course: "",
    profilePictureUrl: "/default.png",
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabasecomp = createClientComp();
  const router = useRouter();

  useAuthProtection();

  const activeItem = router.pathname.split('/')[1] || 'teachdash';

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleLogoutCallback = useCallback(async () => {
    const { error } = await supabasecomp.auth.signOut();
    if (!error) {
      router.push("/signin");
    }
  }, [supabasecomp.auth, router]);

  const fetchTeacherInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabasecomp.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      if (user) {
        const { data, error } = await supabasecomp
          .from('teachers')
          .select('name, course, profile_picture_url')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setTeacherInfo({
            name: data.name || "",
            course: data.course || "",
            profilePictureUrl: data.profile_picture_url || "/default.png",
          });
        }
      }
    } catch (error) {
      setTeacherInfo(prev => ({
        ...prev,
        profilePictureUrl: "/default.png"
      }));
    } finally {
      setIsLoading(false);
    }
  }, [supabasecomp]);

  useEffect(() => {
    handleResize();
    fetchTeacherInfo();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, fetchTeacherInfo]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarEnter = useCallback(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarLeave = useCallback(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
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
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <TeacherSidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogoutCallback}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden pl-4 pr-4 pt-4">
        <div className="mb-4">
          <TeacherNavbar 
            teacherName={teacherInfo.name} 
            teacherCourse={teacherInfo.course} 
            profilePictureUrl={teacherInfo.profilePictureUrl}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

TeacherLayout.displayName = 'TeacherLayout';

export default TeacherLayout;