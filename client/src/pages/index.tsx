import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { PublicHomePage } from "@/components/public-home-page";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin');
        return;
      }
      if (user.role === 'instructor') {
        setLocation('/instructor');
        return;
      }
      if (user.role === 'learner') {
        setLocation('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show public homepage for unauthenticated users
  return <PublicHomePage />;
}