import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrollForm } from "@/components/course/enroll-form";
import { CourseProgressIndicator } from "@/components/course-progress-indicator";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import {
  Calendar,
  Clock,
  UserCheck,
  BookOpen,
  Tag,
  ListChecks,
  FileText,
  CheckSquare,
  ChevronRight,
  Users,
  Layers
} from "lucide-react";

// Helper function to convert YouTube URLs to embed URLs
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Check for youtube.com or youtu.be
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  return null;
}

// Helper function to check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Helper function to format price with currency
function formatPrice(price: number | string, currency: string = 'USD'): string {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  const actualPrice = priceNum / 100; // Price is stored in cents/paisa
  
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'PKR': 'Rs.',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹'
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  // Format with commas for large numbers
  const formatted = actualPrice.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return `${symbol} ${formatted}`;
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  // Get course details
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });
  
  // Check if user is already enrolled
  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ["/api/courses/enrolled"],
    enabled: isAuthenticated,
  });
  
  const isEnrolled = enrolledCourses?.some((c: any) => c.id === id) || false;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full max-w-[500px]" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          
          <div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state - course not found
  if (!course) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="Course Not Found"
          description="The course you're looking for doesn't exist or has been removed."
          actionHref="/courses"
          actionText="Browse Courses"
        />
      </div>
    );
  }
  
  const modules = course.modules || [];
  
  // Handler for enrollment button
  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    // For free courses, show enrollment modal
    if (course.price === 0 || course.price === '0') {
      setIsEnrollModalOpen(true);
    } else {
      // For paid courses, redirect to checkout page
      window.location.href = `/checkout/course/${id}`;
    }
  };
  
  return (
    <div className="container py-8 space-y-8">
      {/* Course header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {course.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{course.duration || 0} hours</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Layers className="h-4 w-4 mr-1" />
              <span>{modules.length} modules</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{course.enrolledCount || 0} students</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4 mr-1" />
              <span>By {course.instructorName}</span>
            </div>
          </div>
        </div>
        
        {isEnrolled ? (
          <div className="flex items-center">
            <CourseProgressIndicator 
              progress={course.progress || 0} 
              showLabel 
              size="md"
            />
            
            <Button asChild className="ml-4">
              <Link href={`/courses/${id}/modules/${modules[0]?.id || ""}`}>
                {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={handleEnrollClick} data-testid="enroll-button">
            {course.price === 0 || course.price === '0' ? 'Enroll Now - Free!' : `Enroll Now - ${formatPrice(course.price, course.currency)}`}
          </Button>
        )}
      </div>
      
      {/* Course content layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Course Preview */}
          <div className="aspect-video overflow-hidden rounded-xl bg-muted relative">
            {course.previewVideoUrl ? (
              <div className="w-full h-full">
                {isYouTubeUrl(course.previewVideoUrl) ? (
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(course.previewVideoUrl) || ''}
                    title="Course Preview Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster={course.imageUrl}
                  >
                    <source src={course.previewVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                {!isYouTubeUrl(course.previewVideoUrl) && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                    Preview • {course.previewDuration || 3} min
                  </div>
                )}
              </div>
            ) : course.imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-gray-900">Course Preview</h3>
                    <p className="text-sm text-gray-600 mt-1">Video preview coming soon</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                  <h3 className="font-semibold text-muted-foreground">Course Preview</h3>
                  <p className="text-sm text-muted-foreground mt-1">Preview content coming soon</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Preview Description */}
          {course.previewDescription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Course Preview</h3>
                  <p className="mt-1 text-sm text-blue-700">{course.previewDescription}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Course tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="modules">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>
            
            {/* About tab */}
            <TabsContent value="about" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <p className="text-muted-foreground">
                  {course.description}
                </p>
              </div>
              
              {course.tags && course.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                    <span>Master the fundamentals of the subject matter</span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                    <span>Apply practical knowledge to real-world scenarios</span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                    <span>Gain confidence in implementing industry best practices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                    <span>Receive a certificate upon completion</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            
            {/* Modules tab */}
            <TabsContent value="modules" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ListChecks className="h-5 w-5 mr-2" />
                Course Curriculum
              </h2>
              
              {modules.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No modules yet"
                  description="The curriculum for this course is being developed."
                  size="sm"
                />
              ) : (
                <div className="space-y-4">
                  {modules.map((module: any, index: number) => (
                    <Card key={module.id} className={isEnrolled ? "hover:border-primary/50 transition-colors" : ""}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Module {index + 1}: {module.title}
                        </CardTitle>
                        {module.description && (
                          <CardDescription>
                            {module.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {module.content?.length > 0 && (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              <span>{module.content.length} lessons</span>
                            </div>
                          )}
                          {module.quizzes?.length > 0 && (
                            <div className="flex items-center">
                              <ListChecks className="h-4 w-4 mr-1" />
                              <span>{module.quizzes.length} quizzes</span>
                            </div>
                          )}
                          {module.assignments?.length > 0 && (
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{module.assignments.length} assignments</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      {isEnrolled && (
                        <CardFooter>
                          <Button variant="ghost" size="sm" asChild className="ml-auto">
                            <Link href={`/courses/${id}/modules/${module.id}`}>
                              View Module
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Instructor tab */}
            <TabsContent value="instructor" className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {/* Instructor avatar placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    {course.instructorName?.charAt(0) || "I"}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{course.instructorName}</h3>
                  <p className="text-muted-foreground">Course Instructor</p>
                  
                  <p className="mt-4">
                    An expert in the field with extensive experience teaching and mentoring students.
                    Passionate about helping learners achieve their goals through high-quality educational content.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Course sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration || 0} hours</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{modules.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Students</span>
                <span className="font-medium">{course.enrolledCount || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {course.updatedAt 
                    ? new Date(course.updatedAt).toLocaleDateString() 
                    : new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {!isEnrolled && (
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnrollClick}
                    data-testid="enroll-sidebar-button"
                  >
                    {course.price === 0 || course.price === '0' ? 'Enroll Now - Free!' : `Enroll Now - ${formatPrice(course.price, course.currency)}`}
                  </Button>
                </div>
              )}
              
              {isEnrolled && (
                <Button 
                  className="w-full mt-4" 
                  asChild
                >
                  <Link href={`/courses/${id}/modules/${modules[0]?.id || ""}`}>
                    {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Have questions about this course? Contact your instructor or our support team for assistance.
              </p>
              <Link href="/support">
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Enrollment modal */}
      {isEnrollModalOpen && (
        <EnrollForm
          courseId={id!}
          courseName={course.title}
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
        />
      )}
    </div>
  );
}