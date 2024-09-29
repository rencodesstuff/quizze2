import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminSidebar from "./admin-sidebar";
import AdminNavbar from "./admin-navbar";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { createClient as createClientComp } from "../../utils/supabase/component";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("Administrator");
  const [profilePictureUrl, setProfilePictureUrl] = useState("/AdminAvatar.png");
  const [isLoading, setIsLoading] = useState(true);
  const supabasecomp = createClientComp();
  const router = useRouter();

  const activeItem = router.pathname.split('/')[1] || 'admindash';

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

    const fetchAdminInfo = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: userError } = await supabasecomp.auth.getUser();
        
        if (userError) throw userError;

        if (user) {
          const { data, error } = await supabasecomp
            .from('admins')
            .select('name, role, profile_picture_url')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data) {
            setAdminName(data.name || user.email || "");
            setAdminRole(data.role || "Administrator");
            if (data.profile_picture_url) {
              setProfilePictureUrl(data.profile_picture_url);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminInfo();

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
        <AdminSidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          activeItem={activeItem}
          onLogout={handleLogout}
        />
      </div>

      <div className={`flex-1 flex flex-col p-4 overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        <AdminNavbar 
          adminName={adminName}
          isLoading={isLoading}
        />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;