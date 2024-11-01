// Create a new file: utils/authProtection.ts

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from './supabase/component';

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/reset', '/'];

export const useAuthProtection = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Clear any stored auth data when the page is refreshed or closed
      sessionStorage.removeItem('lastPath');
    };

    const handlePopState = async (e: PopStateEvent) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && !publicRoutes.includes(window.location.pathname)) {
        // If no session and trying to access protected route, redirect to signin
        router.replace('/signin');
      }
    };

    // Store the current path
    sessionStorage.setItem('lastPath', router.asPath);

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return null;
};

// Function to handle logout
export const handleLogout = async (router: any) => {
  const supabase = createClient();
  
  try {
    await supabase.auth.signOut();
    
    // Clear any stored navigation history
    sessionStorage.removeItem('lastPath');
    
    // Replace the current history entry with signin page
    // This prevents going back to protected pages
    router.replace('/signin');
    
    // Clear the browser history
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/signin');
      window.addEventListener('popstate', function() {
        window.history.pushState(null, '', '/signin');
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
};