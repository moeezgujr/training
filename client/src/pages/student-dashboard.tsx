import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  PlayCircle, 
  CheckCircle2, 
  Calendar,
  Star,
  Users,
  Award,
  Target,
  BarChart3,
  Zap,
  Brain,
  Coffee,
  ArrowRight,
  Filter,
  Search,
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

  // Enhanced sample data for demonstration
  const sampleStats: StudentStats = {
    totalCoursesEnrolled: 4,
    completedCourses: 2,
    totalHoursLearned: 42,
    certificatesEarned: 2,
    currentStreak: 12,
    averageScore: 92
  };

  const sampleCourses: EnrolledCourse[] = [
    {
      id: "1",
      title: "Advanced Web Development with React",
      description: "Master modern React patterns and advanced concepts",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&crop=center",
      instructorName: "Sarah Chen",
      progress: 75,
      totalModules: 8,
      completedModules: 6,
      lastAccessed: "2 hours ago",
      estimatedTimeRemaining: "2h 30m",
      status: 'in_progress'
    },
    {
      id: "2", 
      title: "UI/UX Design Fundamentals",
      description: "Learn design principles and create stunning user interfaces",
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop&crop=center",
      instructorName: "Alex Thompson",
      progress: 100,
      totalModules: 6,
      completedModules: 6,
      lastAccessed: "3 days ago",
      estimatedTimeRemaining: "Completed",
      status: 'completed'
    },
    {
      id: "3",
      title: "JavaScript ES6+ Mastery",
      description: "Deep dive into modern JavaScript features and best practices",
      imageUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop&crop=center",
      instructorName: "Marcus Rivera",
      progress: 45,
      totalModules: 10,
      completedModules: 4,
      lastAccessed: "1 day ago",
      estimatedTimeRemaining: "4h 15m",
      status: 'in_progress'
    },
    {
      id: "4",
      title: "Data Science with Python",
      description: "Analyze data and build machine learning models",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&crop=center",
      instructorName: "Dr. Emily Watson",
      progress: 0,
      totalModules: 12,
      completedModules: 0,
      lastAccessed: "Never",
      estimatedTimeRemaining: "8h 45m",
      status: 'not_started'
    }
  ];

  // Use real data instead of sample data
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30" data-testid="student-dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-2xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-36 -mt-36 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl" data-testid="user-avatar">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-blue-200 text-sm font-medium mb-1">
                  {getGreeting()}, ready to learn?
                </p>
                <h1 className="text-4xl font-bold mb-3" data-testid="welcome-message">
                  {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome to your Learning Hub'}
                </h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  You're on a {displayStats.currentStreak}-day learning streak. Keep the momentum going!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold" data-testid="streak-count">{displayStats.currentStreak}</div>
                  <div className="text-blue-200 text-sm">Day Streak</div>
                </div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {nextCourse && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-16 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Continue Learning</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{nextCourse.title}</h3>
                  <p className="text-gray-600 mb-3">
                    Module {nextCourse.completedModules + 1} • {nextCourse.estimatedTimeRemaining} remaining
                  </p>
                  <Progress value={nextCourse.progress} className="mb-3 h-2" />
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-auto" data-testid="continue-learning-btn">
                  <Link href={`/courses/${nextCourse.id}/learn`}>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Continue Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="stats-courses-enrolled">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Courses Enrolled</p>
                  <p className="text-3xl font-bold">{displayStats.totalCoursesEnrolled}</p>
                  <p className="text-blue-200 text-xs mt-1">Active learning paths</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="stats-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{displayStats.completedCourses}</p>
                  <p className="text-emerald-200 text-xs mt-1">Courses finished</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="stats-hours-learned">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Hours Learned</p>
                  <p className="text-3xl font-bold">{displayStats.totalHoursLearned}</p>
                  <p className="text-purple-200 text-xs mt-1">Time invested</p>
                </div>
                <Clock className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="stats-certificates">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Certificates</p>
                  <p className="text-3xl font-bold">{displayStats.certificatesEarned}</p>
                  <p className="text-amber-200 text-xs mt-1">Achievements earned</p>
                </div>
                <Award className="h-10 w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Analytics and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Progress Overview */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Learning Analytics
              </CardTitle>
              <CardDescription>Track your progress and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-muted-foreground">
                      {displayStats.totalCoursesEnrolled > 0 
                        ? Math.round((displayStats.completedCourses / displayStats.totalCoursesEnrolled) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={displayStats.totalCoursesEnrolled > 0 
                      ? (displayStats.completedCourses / displayStats.totalCoursesEnrolled) * 100
                      : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Average Score</span>
                    <span className="text-muted-foreground">{displayStats.averageScore}%</span>
                  </div>
                  <Progress value={displayStats.averageScore} className="h-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-2">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-900">{displayStats.currentStreak}</p>
                  <p className="text-sm text-indigo-700">Day Streak</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">{displayStats.averageScore}%</p>
                  <p className="text-sm text-emerald-700">Avg Score</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-2">
                    <Timer className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {displayStats.totalCoursesEnrolled > 0 
                      ? Math.round(displayStats.totalHoursLearned / displayStats.totalCoursesEnrolled)
                      : 0}
                  </p>
                  <p className="text-sm text-amber-700">Hrs/Course</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Navigate to key areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 shadow-sm" variant="outline" data-testid="browse-courses-btn">
                <Link href="/courses">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-blue-600" />
                    Browse Courses
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-between h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 shadow-sm" variant="outline" data-testid="view-certificates-btn">
                <Link href="/certificates">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-3 text-amber-600" />
                    View Certificates
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-between h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 shadow-sm" variant="outline" data-testid="learning-analytics-btn">
                <Link href="/profile">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-3 text-indigo-600" />
                    Learning Analytics
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </Button>
              
              <Button asChild className="w-full justify-between h-12 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 shadow-sm" variant="outline" data-testid="view-cart-btn">
                <Link href="/cart">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-purple-600" />
                    View Cart
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced My Courses Section */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  My Courses
                </CardTitle>
                <CardDescription>Continue learning from where you left off</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/courses">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden" data-testid={`course-card-${course.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23f3f4f6'/%3E%3Ctext x='200' y='112.5' font-family='Arial, sans-serif' font-size='14' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3ECourse Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={course.status === 'completed' ? 'default' : 
                                course.status === 'in_progress' ? 'secondary' : 'outline'}
                        className="text-xs bg-white/90 text-gray-900 border-0"
                      >
                        {course.status === 'completed' ? 'Completed' :
                         course.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <Progress 
                        value={course.progress} 
                        className="h-1.5 bg-white/20" 
                      />
                      <p className="text-white text-xs mt-1 font-medium">
                        {course.progress}% Complete
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      by {course.instructorName}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{course.completedModules}/{course.totalModules} modules</span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {course.estimatedTimeRemaining}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1 h-9" data-testid={`continue-course-${course.id}`}>
                          <Link href={`/courses/${course.id}/learn`}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            {course.status === 'not_started' ? 'Start' : 'Continue'}
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-9" data-testid={`view-course-${course.id}`}>
                          <Link href={`/courses/${course.id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {displayCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full mb-6">
                  <BookOpen className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Discover amazing courses and begin developing new skills today.
                </p>
                <Button asChild size="lg" className="px-8">
                  <Link href="/courses">
                    Browse Courses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-900">Completed Advanced React Module</p>
                  <p className="text-sm text-emerald-700 mt-1">Advanced Web Development with React</p>
                  <p className="text-xs text-emerald-600 mt-2">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-900">Earned UI/UX Design Certificate</p>
                  <p className="text-sm text-blue-700 mt-1">Completed all modules with 95% score</p>
                  <p className="text-xs text-blue-600 mt-2">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-purple-900">Achieved 12-Day Learning Streak</p>
                  <p className="text-sm text-purple-700 mt-1">Keep up the consistent learning habit!</p>
                  <p className="text-xs text-purple-600 mt-2">Today</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}