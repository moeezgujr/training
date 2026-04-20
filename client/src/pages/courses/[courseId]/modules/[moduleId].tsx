import CourseModuleViewer from "@/components/course/course-viewer";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";

export default function ModuleViewerPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If not loading and not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/api/login" />;
  }
  
  return <CourseModuleViewer />;
}