import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseProgressIndicator } from "@/components/course-progress-indicator";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Course, EnrolledCourse } from "@/lib/types";
import {
  Clock,
  Layers,
  Users,
  UserCheck,
  ChevronRight,
  FileText,
  ListChecks,
  BookOpen,
  PlayCircle,
  Award,
  Download
} from "lucide-react";

// Helpers (unchanged)
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function isYouTubeUrl(url: string): boolean {
  return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function formatPrice(price: number, currency: string = 'USD'): string {
 const actualPrice = price;
  const symbols: Record<string, string> = { USD: '$', PKR: 'Rs.', EUR: '€', GBP: '£', INR: '₹' };
  const symbol = symbols[currency] || currency;
  return `${symbol} ${actualPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: course, isLoading: isCourseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });

  const { data: enrolledCourses = [] } = useQuery<EnrolledCourse[]>({
    queryKey: ["/api/courses/enrolled"],
    enabled: isAuthenticated,
  });

  const enrolledCourse = enrolledCourses.find(c => c.id === id);
  const isEnrolled = !!enrolledCourse;
  const progress = enrolledCourse?.progress || 0;

  const modules = course?.modules || [];

  // NEW: Fetch completion status (audios + quizzes only)
  const { data: completionStatus, refetch: refetchCompletion } = useQuery({
    queryKey: ['course-completion', id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${id}/completion-status`);
      if (!res.ok) throw new Error('Failed to fetch completion');
      return res.json();
    },
    enabled: isEnrolled && !!id,
  });

  // NEW: Auto-generate certificate when completed
  const generateCertificate = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${id}/generate-certificate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate certificate');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Certificate Generated!",
        description: "Your certificate is ready to download.",
      });
      // Auto-download
      if (data.certificateUrl) {
        const link = document.createElement('a');
        link.href = data.certificateUrl;
        link.download = `Certificate-${course?.title}.pdf`;
        link.click();
      }
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Could not generate certificate",
        variant: "destructive",
      });
    },
  });

  // Auto-trigger certificate when completion reaches 100%
  useEffect(() => {
    if (completionStatus?.isCompleted && !completionStatus?.certificateGenerated) {
      generateCertificate.mutate();
    }
  }, [completionStatus]);

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=${encodeURIComponent(`/courses/${id}`)}`);
      return;
    }

    if (course?.price === 0) {
      try {
        const response = await fetch(`/api/courses/${id}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to enroll");
        }

        toast({
          title: "Enrolled successfully! 🎉",
          description: "You now have full access to the course.",
        });

        window.location.reload();
      } catch (err: any) {
        toast({
          title: "Enrollment failed",
          description: err.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      navigate(`/checkout/course/${id}`);
    }
  };

  if (isCourseLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2"><Skeleton className="aspect-video w-full rounded-xl" /></div>
          <div><Skeleton className="h-96 w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{course.duration || 0} hours</span>
            <span className="flex items-center"><Layers className="h-4 w-4 mr-1" />{modules.length} modules</span>
            <span className="flex items-center"><Users className="h-4 w-4 mr-1" />{course.enrolledCount || 0} students</span>
            <span className="flex items-center"><UserCheck className="h-4 w-4 mr-1" />By {course.instructorName}</span>
          </div>
        </div>

        {isEnrolled ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <CourseProgressIndicator progress={progress} showLabel size="md" />
            <Button asChild size="lg">
              <Link href={`/courses/${id}/modules/${modules[0]?.id || ""}`}>
                {progress > 0 ? "Continue Learning" : "Start Learning"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={handleEnrollClick}>
            {course.price === 0 ? "Enroll Now - Free!" : `Enroll Now - ${formatPrice(course.price, course.currency)}`}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Preview */}
          <div className="aspect-video rounded-xl overflow-hidden bg-muted">
            {course.previewVideoUrl ? (
              isYouTubeUrl(course.previewVideoUrl) ? (
                <iframe className="w-full h-full" src={getYouTubeEmbedUrl(course.previewVideoUrl) || ""} allowFullScreen title="Preview" />
              ) : (
                <video controls className="w-full h-full object-cover">
                  <source src={course.previewVideoUrl} type="video/mp4" />
                </video>
              )
            ) : course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <PlayCircle className="h-16 w-16" />
                <span className="ml-4 text-xl">Preview coming soon</span>
              </div>
            )}
          </div>

          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="modules">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Course Curriculum</h2>

              {modules.length === 0 ? (
                <EmptyState
                  icon={<PlayCircle className="h-12 w-12" />}
                  title="No modules yet"
                  description="The instructor is preparing the content. Check back soon!"
                />
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const content = module.content ?? [];
                    const quizzes = module.quizzes ?? [];
                    // assignments completely removed

                    return (
                      <Card key={module.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Module {index + 1}: {module.title}
                          </CardTitle>
                          {module.description && <CardDescription>{module.description}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {content.length > 0 && (
                              <span>
                                <FileText className="h-4 w-4 inline mr-1" />
                                {content.length} lesson{content.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {quizzes.length > 0 && (
                              <span>
                                <ListChecks className="h-4 w-4 inline mr-1" />
                                {quizzes.length} quiz{quizzes.length > 1 ? "zes" : ""}
                              </span>
                            )}
                            {/* No assignments shown */}
                          </div>
                        </CardContent>
                        {isEnrolled && (
                          <CardFooter>
                            <Button variant="ghost" asChild className="ml-auto">
                              <Link href={`/courses/${id}/modules/${module.id}`}>
                                View Module
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {course.instructorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">{course.instructorName}</h3>
                  <p className="text-muted-foreground">Course Instructor</p>
                  <p className="mt-4 text-muted-foreground">
                    Expert instructor dedicated to delivering high-quality education.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* NEW: Certificate Section - appears when completed */}
          {completionStatus?.isCompleted && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-3">
                  <Award className="h-7 w-7" />
                  Congratulations!
                </CardTitle>
                <CardDescription className="text-green-700">
                  You have successfully completed all audios and quizzes in this course.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">Your Certificate is Ready</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Download your official certificate of completion below.
                    </p>
                    <Button 
                      onClick={() => window.open(completionStatus.certificateUrl, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                  <div className="w-64 h-64 bg-white border border-green-200 rounded-xl flex items-center justify-center shadow-inner">
                    <Award className="h-32 w-32 text-green-500 opacity-70" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration || 0} hours</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{modules.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled Students</span>
                <span className="font-medium">{course.enrolledCount || 0}</span>
              </div>

              {!isEnrolled && (
                <Button className="w-full mt-6" size="lg" onClick={handleEnrollClick}>
                  {course.price === 0 ? "Enroll Now - Free!" : `Enroll Now - ${formatPrice(course.price, course.currency)}`}
                </Button>
              )}

              {isEnrolled && (
                <Button className="w-full mt-6" size="lg" asChild>
                  <Link href={`/courses/${id}/modules/${modules[0]?.id || ""}`}>
                    {progress > 0 ? "Continue Learning" : "Start Learning"}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}