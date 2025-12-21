import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useInstructorDashboardData } from "@/hooks/use-dashboard-data";
import { Redirect } from "@/components/ui/redirect";
import { formatDate } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  BookOpen,
  Users,
  ChevronRight,
  BarChart3,
  PlusCircle,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  UserCheck,
  BookMarked,
  Box,
  Layers,
  TrendingUp,
  Star,
  Award,
  Zap,
  Target,
  Eye,
  Play,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

export default function InstructorDashboardPage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { 
    instructorCourses, 
    stats, 
    recentEnrollments, 
    pendingAssignments,
    isLoading,
  } = useInstructorDashboardData();
  
  // Redirect if not authenticated or not an instructor
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "instructor")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
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
          {[1, 2, 3, 4].map((i) => (
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
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.05">
                <circle cx="30" cy="30" r="4"/>
              </g>
            </g>
          </svg>
        </div>
        <div className="container relative py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName || 'Instructor'}!
                </h1>
                <p className="text-blue-100 text-lg">
                  Transform minds, shape futures. Your teaching dashboard awaits.
                </p>
              </div>
            </div>
            <Button 
              asChild 
              size="lg" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Link href="/instructor/courses/create">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Course
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Modern Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 -mt-16 relative z-10">
          <Link href="/instructor/courses">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold mt-4">
                  {instructorCourses?.length || 0}
                </CardTitle>
                <CardDescription className="text-blue-100 font-medium">
                  Your Courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="h-2 bg-white/20 rounded-full flex-1">
                    <div 
                      className="h-2 bg-white/60 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((stats?.publishedCourses || 0) / Math.max(1, instructorCourses?.length || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-100">
                    {stats?.publishedCourses || 0} published
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/students">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <TrendingUp className="h-5 w-5 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold mt-4">
                  {stats?.totalStudents || 0}
                </CardTitle>
                <CardDescription className="text-emerald-100 font-medium">
                  Total Students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100 text-sm">
                    +{stats?.newStudentsThisMonth || 0} this month
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-emerald-100 border-0">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/analytics">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <Target className="h-5 w-5 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold mt-4">
                  {stats?.totalCompletions || 0}
                </CardTitle>
                <CardDescription className="text-purple-100 font-medium">
                  Completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="h-2 bg-white/20 rounded-full flex-1">
                    <div 
                      className="h-2 bg-white/60 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, stats?.completionRate || 0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-purple-100">
                    {stats?.completionRate || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instructor/assignments">
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Clock className="h-6 w-6" />
                  </div>
                  <Zap className="h-5 w-5 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold mt-4">
                  {pendingAssignments?.length || 0}
                </CardTitle>
                <CardDescription className="text-amber-100 font-medium">
                  Pending Reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-amber-100 text-sm">
                    Awaiting your feedback
                  </span>
                  {(pendingAssignments?.length || 0) > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-amber-100 border-0 animate-pulse">
                      Action needed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Modern Course Management Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
                Your Courses
              </h2>
              <p className="text-slate-600">
                Create, manage, and track your educational content
              </p>
            </div>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/instructor/courses/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Course
              </Link>
            </Button>
          </div>
          
          {instructorCourses?.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {instructorCourses.slice(0, 6).map((course: any) => (
                <Card key={course.id} className="group overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 rounded-2xl">
                  <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {course.status === "published" ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : course.status === "draft" ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg">
                          <Edit className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-500 hover:bg-slate-600 text-white border-0 shadow-lg">
                          <Box className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm">
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{course.enrolledCount || 0}</span> students
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{course.moduleCount || 0}</span> modules
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-6 flex-grow">
                    <p className="text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                      {course.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Course Progress</span>
                        <span>{course.status === "published" ? "100%" : course.status === "draft" ? "60%" : "0%"}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            course.status === "published" 
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-600 w-full" 
                              : course.status === "draft" 
                              ? "bg-gradient-to-r from-amber-400 to-amber-600 w-3/5" 
                              : "bg-gradient-to-r from-slate-300 to-slate-400 w-0"
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(course.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {formatDate(course.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
                <p className="text-slate-600 text-center mb-6 max-w-md">
                  Start creating your first course to share your knowledge with students around the world.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/instructor/courses/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Your First Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Dashboard */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Assignments */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Pending Assignments</CardTitle>
                    <CardDescription>Review student submissions</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {pendingAssignments?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pendingAssignments?.length ? (
                <div className="space-y-4">
                  {pendingAssignments.map((assignment: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{assignment.studentName}</p>
                          <p className="text-sm text-slate-500">{assignment.courseName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{assignment.assignmentTitle}</p>
                        <p className="text-xs text-slate-500">{formatDate(assignment.submittedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No pending assignments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Recent Enrollments</CardTitle>
                    <CardDescription>New students in your courses</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {recentEnrollments?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {recentEnrollments?.length ? (
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{enrollment.studentName}</p>
                          <p className="text-sm text-slate-500">{enrollment.courseName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">New</Badge>
                        <p className="text-xs text-slate-500">{formatDate(enrollment.enrolledAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No recent enrollments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}