import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseProgressIndicator } from "@/components/course-progress-indicator";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Redirect } from "@/components/ui/redirect";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  BarChart3,
  Bell,
  CheckCircle2,
  Circle,
  Layers,
  GraduationCap
} from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { 
    inProgressCourses,
    recentCourses,
    recommendedCourses,
    upcomingDeadlines,
    certificates,
    isLoading,
  } = useDashboardData();
  
  // Redirect if not authenticated
  if (!isAuthLoading && !isAuthenticated) {
    return <Redirect to="/api/login" />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-10 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mb-8">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-muted" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusComponent = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge variant="success" className="ml-2">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="ml-2">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="outline" className="ml-2">Not Started</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Learner'}
        </h1>
        <p className="text-muted-foreground">
          Track your progress and continue your learning journey
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">
              {inProgressCourses?.length || 0}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                courses
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {inProgressCourses?.length 
                ? `Next up: ${inProgressCourses[0]?.title}` 
                : 'No courses in progress'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">
              {certificates?.length || 0}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                certificates
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {certificates?.length 
                ? `Last completed: ${new Date(certificates[0]?.issueDate).toLocaleDateString()}` 
                : 'No courses completed yet'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Learning Streak</CardDescription>
            <CardTitle className="text-3xl">
              7
              <span className="text-sm font-normal text-muted-foreground ml-2">
                days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Keep it up! You're on a roll.
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Resume Learning Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Continue Learning</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/my-courses">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {inProgressCourses?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {inProgressCourses.slice(0, 2).map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {course.progress}% Complete
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    Last activity: {formatDate(course.lastActivityDate || new Date())}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <CourseProgressIndicator 
                    progress={course.progress} 
                    showLabel={false} 
                    size="sm" 
                  />
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Modules</div>
                      <div className="font-medium">{course.completedModules} / {course.moduleCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Time Left</div>
                      <div className="font-medium">~{course.estimatedTimeLeft} hrs</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Status</div>
                      <div className="font-medium flex items-center">
                        <Circle className="h-2 w-2 fill-secondary mr-1" />
                        In Progress
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${course.id}/modules/${course.currentModuleId}`}>
                      Continue Learning
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>No courses in progress</CardTitle>
              <CardDescription>
                Start learning by enrolling in a course from our catalog
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/courses">
                  Browse Courses
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Recommended & Activity Tabs */}
      <Tabs defaultValue="recommended" className="mb-10">
        <TabsList className="mb-4">
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Recommended</span>
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming Deadlines</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {recommendedCourses?.length ? recommendedCourses.slice(0, 3).map((course) => (
              <Card key={course.id}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                  <CardDescription>{course.instructorName}</CardDescription>
                </CardHeader>
                <CardContent className="h-20">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/courses/${course.id}`}>
                      View Course
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )) : (
              <div className="col-span-3 p-8 text-center">
                <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll provide personalized recommendations as you complete more courses
                </p>
                <Button asChild>
                  <Link href="/courses">Browse All Courses</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="deadlines" className="space-y-4">
          {upcomingDeadlines?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines & Assignments</CardTitle>
                <CardDescription>
                  Stay on track with your learning goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {item.type === 'assignment' ? (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{item.courseName}</p>
                        <div className="flex items-center">
                          <Badge variant={item.daysLeft < 2 ? "destructive" : "outline"} className="text-xs">
                            Due in {item.daysLeft} {item.daysLeft === 1 ? 'day' : 'days'}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={item.link}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Deadlines</CardTitle>
                <CardDescription>
                  You're all caught up! No pending assignments or deadlines.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enjoy this moment of calm before your next assignments arrive.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your learning activity over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCourses?.length ? recentCourses.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {activity.type === 'module' ? (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      ) : activity.type === 'quiz' ? (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Award className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{activity.courseName}</p>
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{formatDate(activity.date)}</span>
                        {activity.completed && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={activity.link}>View</Link>
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No recent activity to display
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start learning to see your activity here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Certificates Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your Certificates</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/certificates">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {certificates?.length ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {certificates.slice(0, 4).map((cert) => (
              <Card key={cert.id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm line-clamp-1">{cert.courseTitle}</CardTitle>
                  <CardDescription className="text-xs">
                    Issued: {formatDate(cert.issueDate)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="py-3 flex-grow">
                  <div className="relative mx-auto my-2 w-full max-w-[180px] aspect-[1.4/1] border rounded-md p-2 bg-primary/5">
                    <div className="absolute inset-0 bg-[url('/certification-bg.svg')] opacity-5"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                      <Award className="h-6 w-6 text-primary mb-1" />
                      <div className="text-[10px] font-medium line-clamp-1">Certificate of Completion</div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={`/certificates/${cert.id}`}>
                      View Certificate
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>No certificates yet</CardTitle>
              <CardDescription>
                Complete courses to earn certificates of achievement
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/courses">
                  Explore Courses
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}