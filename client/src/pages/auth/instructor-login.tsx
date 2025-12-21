import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  BarChart3, 
  PlusCircle,
  ChevronRight,
  User,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { Logo } from "@/components/ui/logo";

export default function InstructorLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // If already authenticated and is instructor, redirect to instructor dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "instructor") {
      navigate("/instructor");
    }
  }, [isAuthenticated, user, navigate]);
  
  // If authenticated but not instructor, show role change option
  if (isAuthenticated && user?.role !== "instructor") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[500px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Logo height={50} className="mb-2" />
            <h1 className="text-2xl font-bold">Switch to Instructor Account</h1>
            <p className="text-sm text-muted-foreground">
              You're logged in as a {user.role}. Switch to instructor to access course creation tools.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Become an Instructor</CardTitle>
              <CardDescription>
                Switch your account to instructor mode to start creating and managing courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center p-4 border rounded-lg bg-muted/50">
                  <BookOpen className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">Create Courses</h3>
                    <p className="text-sm text-muted-foreground">Build comprehensive learning experiences</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg bg-muted/50">
                  <Users className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">Manage Students</h3>
                    <p className="text-sm text-muted-foreground">Track progress and provide feedback</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg bg-muted/50">
                  <BarChart3 className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">Monitor course performance and engagement</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                className="w-full" 
                asChild
              >
                <Link href="/dashboard/settings">
                  <Shield className="mr-2 h-4 w-4" />
                  Switch to Instructor Role
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">
                  Continue as {user.role}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // If already authenticated as instructor, redirect
  if (isAuthenticated && user?.role === "instructor") {
    return <Redirect to="/instructor" />;
  }
  
  const handleInstructorLogin = async () => {
    setIsLoading(true);
    
    try {
      // Redirect to Replit auth with instructor intent
      window.location.href = "/api/login";
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "There was a problem signing in. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[500px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo height={50} className="mb-2" />
          <h1 className="text-2xl font-bold">Instructor Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to create courses and manage your students on Meeting Matters
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Welcome, Instructors!
            </CardTitle>
            <CardDescription>
              Access your instructor dashboard to create engaging courses and track student progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start p-4 border rounded-lg">
                <PlusCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">Create Interactive Courses</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build courses with videos, audio, PDFs, quizzes, and assignments
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 border rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">Student Management</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitor enrollments, track progress, and provide personalized feedback
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 border rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">Performance Analytics</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    View detailed analytics on course performance and student engagement
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Button 
                onClick={handleInstructorLogin}
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign In as Instructor"}
                {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
              
              <div className="text-center text-xs text-muted-foreground">
                After signing in, you'll be taken to the instructor dashboard where you can immediately start creating courses
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6">
            <div className="text-center text-sm">
              Not an instructor?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Student/Learner Login
              </Link>
            </div>
            <div className="text-center text-sm mt-2">
              Need an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What you can do as an instructor:</h4>
            <ul className="text-xs space-y-1">
              <li>• Create unlimited courses with multimedia content</li>
              <li>• Design quizzes and assignments to assess learning</li>
              <li>• Issue certificates upon course completion</li>
              <li>• Track student progress and engagement metrics</li>
              <li>• Manage course publishing and enrollment settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}