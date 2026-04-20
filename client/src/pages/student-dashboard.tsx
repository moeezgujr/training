import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  PlayCircle, 
  CheckCircle2, 
  Award,
  Target,
  Zap,
  ArrowRight,
  ChevronRight,
  Timer,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  instructorName: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  lastAccessed: string;
  estimatedTimeRemaining: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface StudentStats {
  totalCoursesEnrolled: number;
  completedCourses: number;
  totalHoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  averageScore: number;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

export default function StudentDashboard() {
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useQuery<EnrolledCourse[]>({
    queryKey: ["/api/courses/enrolled"],
  });

  const { data: stats } = useQuery<StudentStats>({
    queryKey: ["/api/student/stats"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const displayStats = stats || {
    totalCoursesEnrolled: 0,
    completedCourses: 0,
    totalHoursLearned: 0,
    certificatesEarned: 0,
    currentStreak: 0,
    averageScore: 0
  };
  
  const displayCourses = enrolledCourses || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const inProgressCourses = displayCourses.filter(course => course.status === 'in_progress');
  const nextCourse = inProgressCourses[0];

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60 font-medium">Loading your learning hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent" data-testid="student-dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        
        {/* Modern Hero Section - Enhanced Glassmorphism */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 text-white border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/10 shadow-2xl">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-cyan-600 text-white text-3xl font-bold">
                  {user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3" />
                  Premium Learning Hub
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                  {user?.firstName ? `${getGreeting()}, ${user.firstName}!` : 'Welcome back'}
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl font-medium">
                  Maintaining a <span className="text-cyan-400 font-black">{displayStats.currentStreak}-day streak</span> with an average of <span className="text-emerald-400 font-black">{displayStats.averageScore}%</span>.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">{displayStats.currentStreak}</div>
                  <div className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Day Streak</div>
                </div>
                <Zap className="h-10 w-10 text-yellow-400 fill-yellow-400/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning - Dark Glass Style */}
        {nextCourse && (
          <Card className="border-white/10 shadow-2xl bg-black/20 backdrop-blur-md overflow-hidden rounded-[2rem] group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden bg-white/5">
                   <img src={nextCourse.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt=""/>
                </div>
                <div className="flex-1 p-6 flex flex-wrap items-center gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Lesson</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1 tracking-tight">{nextCourse.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-cyan-500" /> Module {nextCourse.completedModules + 1}</span>
                      <span className="flex items-center gap-1"><Timer className="h-4 w-4 text-cyan-500" /> {nextCourse.estimatedTimeRemaining}</span>
                    </div>
                  </div>
                  <div className="hidden md:block w-48">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                      <span>Progress</span>
                      <span className="text-cyan-400">{nextCourse.progress}%</span>
                    </div>
                    <Progress value={nextCourse.progress} className="h-1.5 bg-white/10" />
                  </div>
                  <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-full px-8 h-12">
                    <Link href={`/courses/${nextCourse.id}/learn`}>
                      RESUME <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Transparent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Courses', val: displayStats.totalCoursesEnrolled, icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
            { label: 'Completed', val: displayStats.completedCourses, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Certificates', val: displayStats.certificatesEarned, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' }
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md shadow-xl rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-black text-white mt-1">{stat.val}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader className="border-b border-white/5 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Performance Analytics</CardTitle>
                <TrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    <span>Degree Progress</span>
                    <span className="text-cyan-400">{displayStats.totalCoursesEnrolled > 0 ? Math.round((displayStats.completedCourses / displayStats.totalCoursesEnrolled) * 100) : 0}%</span>
                  </div>
                  <Progress value={(displayStats.completedCourses / displayStats.totalCoursesEnrolled) * 100} className="h-3 bg-white/5" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    <span>Average Mastery</span>
                    <span className="text-emerald-400">{displayStats.averageScore}%</span>
                  </div>
                  <Progress value={displayStats.averageScore} className="h-3 bg-white/5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader className="px-6 py-6 border-b border-white/5">
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button asChild className="w-full justify-between h-14 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all" variant="outline">
                <Link href="/courses">
                  <span className="flex items-center font-bold uppercase text-xs tracking-widest">
                    <BookOpen className="h-4 w-4 mr-3 text-cyan-400" /> Catalog
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between h-14 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all" variant="outline">
                <Link href="/certificates">
                  <span className="flex items-center font-bold uppercase text-xs tracking-widest">
                    <Trophy className="h-4 w-4 mr-3 text-amber-400" /> Credentials
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Learning Path - Horizontal Scroll or Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">My Learning Path</h2>
            <Link href="/courses" className="text-cyan-400 text-xs font-black uppercase tracking-widest hover:text-cyan-300 transition-colors">View Full Path</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <Card key={course.id} className="group hover:translate-y-[-8px] transition-all duration-500 border-white/10 bg-white/5 backdrop-blur-md overflow-hidden rounded-[2rem]">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-cyan-500 text-black border-0 font-black uppercase text-[9px] px-3">
                      {course.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-black text-white text-lg mb-4 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{course.completedModules}/{course.totalModules} Units</span>
                      <span className="text-cyan-400">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5 bg-white/10" />
                    <Button asChild className="w-full bg-white text-black hover:bg-cyan-400 font-black rounded-xl uppercase text-xs tracking-widest h-12">
                      <Link href={`/courses/${course.id}/learn`}>
                        {course.status === 'not_started' ? 'Begin' : 'Resume'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}