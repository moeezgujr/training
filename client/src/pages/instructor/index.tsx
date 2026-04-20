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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useInstructorDashboardData } from "@/hooks/use-dashboard-data";
import { Redirect } from "@/components/ui/redirect";
import { formatDate } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  BookOpen,
  Users,
  PlusCircle,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  UserCheck,
  Layers,
  TrendingUp,
  Award,
  Zap,
  Target,
  Eye,
  Play,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ChevronRight
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
  
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "instructor")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
  }
  
  if (isLoading) {
    return (
      <div className="container py-8 bg-zinc-950 min-h-screen">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2 bg-zinc-800" />
          <Skeleton className="h-4 w-96 bg-zinc-800" />
        </div>
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        
        {/* --- HERO HEADER: Deep Black to Dark Red Gradient --- */}
        <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-red-900/30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="container relative py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
                    Instructor <span className="text-red-600">Command Center</span>
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-md">
                    Welcome back, <span className="text-white font-bold">{user?.firstName || 'Chief'}</span>. 
                    Ready to dominate the curriculum?
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-6 text-lg font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                <Link href="/instructor/courses/create">
                  <PlusCircle className="h-5 w-5 mr-2 stroke-[3px]" />
                  NEW COURSE
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* --- STATS GRID: High Contrast Red/Zinc --- */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16 -mt-12 relative z-10">
            
            {/* Courses Stat */}
            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-600/50 transition-all cursor-pointer group shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-red-600/10 text-red-500">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </div>
                <CardTitle className="text-4xl font-black text-white">{instructorCourses?.length || 0}</CardTitle>
                <CardDescription className="text-zinc-500 uppercase font-bold tracking-wider text-xs">Total Courses</CardDescription>
              </CardHeader>
            </Card>

            {/* Students Stat */}
            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-600/50 transition-all cursor-pointer group shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-zinc-800 text-white group-hover:bg-red-600/20 group-hover:text-red-500 transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle className="text-4xl font-black text-white">{stats?.totalStudents || 0}</CardTitle>
                <CardDescription className="text-zinc-500 uppercase font-bold tracking-wider text-xs">Total Students</CardDescription>
              </CardHeader>
            </Card>

            {/* Completion Rate */}
            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-600/50 transition-all cursor-pointer group shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-zinc-800 text-white">
                    <Award className="h-6 w-6" />
                  </div>
                  <Target className="h-5 w-5 text-red-500 opacity-50" />
                </div>
                <CardTitle className="text-4xl font-black text-white">{stats?.completionRate || 0}%</CardTitle>
                <CardDescription className="text-zinc-500 uppercase font-bold tracking-wider text-xs">Avg. Completion</CardDescription>
              </CardHeader>
            </Card>

            {/* Pending Tasks */}
            <Card className="bg-red-600 border-red-500 hover:bg-red-700 transition-all cursor-pointer group shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/20 text-white">
                    <Zap className="h-6 w-6 fill-current" />
                  </div>
                  {(pendingAssignments?.length || 0) > 0 && <Badge className="bg-white text-red-600 animate-pulse">ACTION</Badge>}
                </div>
                <CardTitle className="text-4xl font-black text-white">{pendingAssignments?.length || 0}</CardTitle>
                <CardDescription className="text-red-100 uppercase font-bold tracking-wider text-xs">Pending Reviews</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* --- COURSE MANAGEMENT SECTION --- */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-8 border-l-4 border-red-600 pl-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                  Active Deployments
                </h2>
                <p className="text-zinc-500">Manage your training modules and content</p>
              </div>
              <Button variant="link" className="text-red-500 font-bold hover:text-red-400">
                VIEW ALL COURSES <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {instructorCourses?.slice(0, 6).map((course: any) => (
                <Card key={course.id} className="group overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-none shadow-xl">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-4 left-4">
                       <Badge className={`${course.status === 'published' ? 'bg-red-600' : 'bg-zinc-700'} text-white border-0 uppercase font-black text-[10px]`}>
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white group-hover:text-red-500 transition-colors uppercase truncate">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase mb-4">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3 text-red-600" /> {course.enrolledCount} Students</span>
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3 text-red-600" /> {course.moduleCount} Modules</span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-zinc-800 hover:bg-red-600 text-xs font-bold transition-all">EDIT</Button>
                      <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 px-3">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* --- ACTIVITY SECTION: Two Columns --- */}
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Dark Red Theme for Assignments */}
            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
              <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white uppercase font-black text-sm tracking-widest">Incoming Submissions</CardTitle>
                    <CardDescription className="text-zinc-500">Needs your evaluation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {pendingAssignments?.map((assignment: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-red-500 font-bold text-xs">
                        {assignment.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{assignment.studentName}</p>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold">{assignment.courseName}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white text-[10px] font-black">REVIEW</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stealth Theme for Enrollments */}
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl">
              <CardHeader className="border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white uppercase font-black text-sm tracking-widest">Recent Recruits</CardTitle>
                    <CardDescription className="text-zinc-500">New student enrollment log</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentEnrollments?.map((enrollment: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-zinc-300">{enrollment.studentName}</p>
                        <p className="text-[10px] text-zinc-600">{formatDate(enrollment.enrolledAt)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-zinc-800 text-zinc-500 text-[9px] uppercase">Enrolled</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}