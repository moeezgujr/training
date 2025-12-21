import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  BarChart2,
  Star,
  Edit,
  Video,
  FileText,
  AudioLines,
  Play,
  Download,
  Layers,
  PlusCircle,
  Star as StarIcon,
  Gift
} from "lucide-react";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: [`/api/courses/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id && !isAuthLoading && isAuthenticated,
  });
  
  // Redirect if not authenticated or not an instructor
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "instructor")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
  }
  
  // Loading state
  if (isLoading || !course) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle API error
  if (error) {
    return (
      <div className="container py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load course</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There was an error loading this course. Please try again or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/instructor">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Check if the logged in instructor is the course owner
  if (course.instructorId !== user?.id) {
    return <Redirect to="/instructor" />;
  }
  
  // Calculate course completion percentage
  const totalModules = course.modules?.length || 0;
  const completedModules = course.completedModules || 0;
  const completionPercentage = totalModules > 0 ? Math.floor((completedModules / totalModules) * 100) : 0;
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/instructor">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <Badge className={
                course.status === "published" ? "bg-green-600" :
                course.status === "draft" ? "bg-secondary" :
                "bg-muted-foreground"
              }>
                {course.status === "published" ? "Published" :
                course.status === "draft" ? "Draft" :
                "Archived"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {course.description?.substring(0, 120)}
              {course.description && course.description.length > 120 ? "..." : ""}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/instructor/courses/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Link>
            </Button>
            
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        {/* Course Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Course Image */}
          <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>
          
          {/* Course Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Students</CardDescription>
                <CardTitle className="text-2xl">{course.enrolledCount || 0}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Enrolled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Modules</CardDescription>
                <CardTitle className="text-2xl">{course.moduleCount || 0}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Layers className="h-3 w-3 mr-1" />
                  Total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Completion</CardDescription>
                <CardTitle className="text-2xl">{course.completionRate || 0}%</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Student average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Duration</CardDescription>
                <CardTitle className="text-2xl">
                  {course.duration ? formatDuration(course.duration).split(' ')[0] : "N/A"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {course.duration ? 
                    formatDuration(course.duration).includes('hour') ? 'hours' : 'minutes' 
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for Course Content and Analytics */}
          <Tabs defaultValue="content">
            <TabsList className="grid grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Course Content Tab */}
            <TabsContent value="content" className="pt-4 space-y-6">
              {!course.modules?.length ? (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Modules Added Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Start building your course by adding modules with videos, audio files, PDFs, 
                      quizzes, and assignments.
                    </p>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Module
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Course Modules</h2>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Module
                    </Button>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules?.map((module, index) => (
                      <AccordionItem key={module.id} value={module.id} className="border rounded-md mb-4">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center text-left">
                            <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{module.title}</h3>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Video className="h-3 w-3 mr-1" />
                                  {module.content?.filter(c => c.type === 'video').length || 0} videos
                                </span>
                                <span className="flex items-center">
                                  <AudioLines className="h-3 w-3 mr-1" />
                                  {module.content?.filter(c => c.type === 'audio').length || 0} audio
                                </span>
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {module.content?.filter(c => c.type === 'pdf').length || 0} PDF files
                                </span>
                                {(module.quizzes?.length || 0) > 0 && (
                                  <span className="flex items-center">
                                    <BarChart2 className="h-3 w-3 mr-1" />
                                    {module.quizzes?.length || 0} quizzes
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-0 pb-4">
                          <div className="pl-11 space-y-3 mt-2">
                            {/* Module Content Items */}
                            {module.content?.map((content) => (
                              <div key={content.id} className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                                <div>
                                  {content.type === 'video' ? (
                                    <Video className="h-4 w-4 text-blue-500" />
                                  ) : content.type === 'audio' ? (
                                    <AudioLines className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm font-medium">{content.title}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {content.duration || 0} min
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                    <Link href={`/instructor/modules/${module.id}/content/${content.id}`}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Link>
                                  </Button>
                                  
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Play className="h-4 w-4" />
                                    <span className="sr-only">Preview</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add Module Content Button */}
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/instructor/modules/${module.id}/content/add`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Content
                              </Link>
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="pt-4 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Over Time</CardTitle>
                    <CardDescription>Student enrollment trends</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Enrollment analytics will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Module Completion</CardTitle>
                    <CardDescription>Student progress through modules</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Module completion analytics will appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Student Feedback</CardTitle>
                  <CardDescription>Ratings and reviews from students</CardDescription>
                </CardHeader>
                <CardContent>
                  {(course.reviewCount || 0) > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-muted p-4 rounded-lg">
                          <div className="text-3xl font-bold">{course.averageRating || 0}</div>
                          <div className="flex text-yellow-400 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon key={i} className="h-4 w-4" />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {course.reviewCount} reviews
                          </div>
                        </div>
                        
                        <div className="flex-grow space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const percentage = Math.floor(Math.random() * 100);
                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <div className="text-sm w-2">{rating}</div>
                                <StarIcon className="h-3 w-3 text-yellow-400" />
                                <Progress value={percentage} className="h-2 flex-grow" />
                                <div className="text-xs text-muted-foreground w-8">{percentage}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        {/* This would be populated with actual reviews */}
                        <div className="p-4 border rounded-md">
                          <div className="flex justify-between mb-2">
                            <div>
                              <div className="font-medium">Sample Student</div>
                              <div className="flex text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <StarIcon key={i} className="h-3 w-3" />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(), "MMM d, yyyy")}
                            </div>
                          </div>
                          <p className="text-sm">
                            This is where student feedback would be displayed. Students can provide
                            ratings and written feedback about their experience with the course.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once students complete your course, their ratings and reviews will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.status === "draft" ? (
                <Button className="w-full" asChild>
                  <Link href={`/instructor/courses/${id}/edit`}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish Course
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href={`/instructor/courses/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Preview Course
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Course Data
              </Button>
            </CardContent>
          </Card>
          
          {/* Course Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Created</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(course.createdAt || Date.now()), "MMMM d, yyyy")}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(course.updatedAt || Date.now()), "MMMM d, yyyy")}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {course.duration ? formatDuration(course.duration) : "Not set"}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Tags</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {course.tags?.length ? (
                    course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No tags added</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/instructor/assignments">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Assignments
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/instructor/students">
                  <Users className="mr-2 h-4 w-4" />
                  View Enrolled Students
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/instructor/certificates">
                  <Gift className="mr-2 h-4 w-4" />
                  Manage Certificates
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}