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
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Activity as ActivityIcon,
  Play
} from "lucide-react";

// --- TYPES (Omitted for brevity, keeping your existing interfaces) ---

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  
  const { 
    inProgressCourses = [],
    recentCourses = [],
    recommendedCourses = [],
    certificates = [],
    isLoading,
  } = useDashboardData() as any;
  
  if (!isAuthLoading && !isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }
  
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#020617] p-8 lg:p-12 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-slate-800/50" />
            <Skeleton className="h-4 w-96 bg-slate-800/50" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-slate-900/50 border border-slate-800" />
          ))}
        </div>
        <Skeleton className="h-96 w-full bg-slate-900/50" />
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden">
      {/* Background Neural Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container max-w-[1600px] mx-auto px-6 py-12 lg:px-10 space-y-12">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-2">
              <Sparkles className="h-3 w-3" /> System Active
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent italic">
              WELCOME BACK, <span className="text-white not-italic">{user?.firstName?.toUpperCase() || 'LEARNER'}</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl">
              Your neural synchronization is at <span className="text-cyan-400">84%</span>. Continue your specialized training modules below.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest px-6 h-12 rounded-xl">
              <ActivityIcon className="mr-2 h-4 w-4 text-cyan-400" /> Analytics
            </Button>
          </div>
        </header>
        
        {/* --- STATS GRID --- */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Active Modules', value: inProgressCourses.length, icon: BookOpen, color: 'text-cyan-400', sub: 'In progress' },
            { label: 'Neural Assets', value: certificates.length, icon: Award, color: 'text-emerald-400', sub: 'Certificates earned' },
            { label: 'Sync Streak', value: '12 Days', icon: Zap, color: 'text-orange-500', sub: 'Top 5% of users' }
          ].map((stat, i) => (
            <div key={i} className="relative group overflow-hidden p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <stat.icon className="h-16 w-16" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
               <h3 className={cn("text-3xl font-black", stat.color)}>{stat.value}</h3>
               <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 italic">
                 <TrendingUp className="h-3 w-3" /> {stat.sub}
               </p>
            </div>
          ))}
        </div>
        
        {/* --- MAIN CONTENT: CONTINUED LEARNING --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Resume Core Training
            </h2>
            <Link href="/dashboard/my-courses" className="text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
              Full Archive
            </Link>
          </div>
          
          {inProgressCourses.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {inProgressCourses.slice(0, 2).map((course) => (
                <div key={course.id} className="group relative flex flex-col md:flex-row bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-500">
                  <div className="w-full md:w-48 h-48 md:h-full relative shrink-0">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/0 via-[#020617]/20 to-[#020617]/80 hidden md:block" />
                  </div>
                  
                  <div className="p-8 flex flex-col justify-between flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 text-[10px] uppercase font-bold px-3">
                          {course.progress}% SYNCED
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">ID: {course.id.slice(0,8)}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                        {course.title}
                      </h3>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                           <span>Module {course.completedModules}/{course.moduleCount}</span>
                           <span>EST: {course.estimatedTimeLeft}H Remaining</span>
                        </div>
                        <CourseProgressIndicator progress={course.progress} showLabel={false} size="sm" className="h-1.5 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-cyan-600 [&>div]:to-blue-400" />
                      </div>
                      <Button className="w-full h-12 bg-white text-black hover:bg-cyan-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all group/btn" asChild>
                        <Link href={`/courses/${course.id}/modules/${course.currentModuleId}`}>
                          Resume Lesson <Play className="ml-2 h-3 w-3 fill-current group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <div className="p-4 rounded-full bg-white/5 mb-4 text-slate-600"><BookOpen className="h-10 w-10" /></div>
                <p className="text-slate-400 font-medium">No active training detected.</p>
                <Button variant="link" className="text-cyan-500 uppercase tracking-widest text-xs font-bold" asChild><Link href="/courses">Initialize Catalog</Link></Button>
            </div>
          )}
        </section>

        {/* --- TABS SECTION --- */}
        <div className="grid lg:grid-cols-3 gap-10 pt-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 mb-8">
                <TabsTrigger value="activity" className="data-[state=active]:border-cyan-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none px-6 pb-4 text-xs font-black uppercase tracking-widest text-slate-500">Recent Logs</TabsTrigger>
                <TabsTrigger value="recommended" className="data-[state=active]:border-cyan-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none px-6 pb-4 text-xs font-black uppercase tracking-widest text-slate-500">Neural Matches</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity">
                <div className="space-y-4">
                  {recentCourses.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-200">{activity.title}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-1">{activity.courseName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-slate-600">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Quick Support</h3>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
               <Sparkles className="h-8 w-8 text-cyan-400 mb-4" />
               <h4 className="text-lg font-bold text-white mb-2">Stuck on a module?</h4>
               <p className="text-sm text-slate-400 leading-relaxed mb-6">Our neural assistants are ready to help you navigate complex concepts.</p>
               <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold uppercase tracking-widest text-[10px] h-11">Open Help Matrix</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}