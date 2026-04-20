import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";

interface Module {
  id: string;
  title: string;
  order?: number;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

export default function LearnPage() {
  const { courseId } = useParams();
  const [, navigate] = useLocation();

  // Fetch course data with modules
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Redirect to first module when course data is loaded
  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      // Sort modules by order if available, otherwise use first module
      const sortedModules = [...course.modules].sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;
        return orderA - orderB;
      });
      
      const firstModule = sortedModules[0];
      
      // Redirect to the first module
      navigate(`/learn/${courseId}/${firstModule.id}`);
    }
  }, [course, courseId, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have access to this course. Please enroll first or check if you're logged in.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/courses/${courseId}`}>
              View Course Details
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course?.modules || course.modules.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>No Content Available</AlertTitle>
          <AlertDescription>
            This course doesn't have any modules yet. Please check back later or contact the instructor.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // This component primarily handles redirection, so we show a loading state
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    </div>
  );
}
