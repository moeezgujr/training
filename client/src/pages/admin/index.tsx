import { useState } from "react";
import { Link } from "wouter";
import TourInterface from "@/components/onboarding/tour-interface";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAdminDashboardData } from "@/hooks/use-dashboard-data";
import { Redirect } from "@/components/ui/redirect";
import { formatDate } from "@/lib/utils";
import {
  Users,
  BookOpen,
  BarChart3,
  ChevronRight,
  Search,
  UserPlus,
  GraduationCap,
  Settings,
  User,
  FileText,
  PlusCircle,
  Shield,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  DollarSign,
  Star,
  Clock,
  UserCheck,
  BookMarked,
  Zap,
  Target,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { users: allUsers, stats, coursesWithStats, isLoading } = useAdminDashboardData();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [showTourInterface, setShowTourInterface] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminHeader />
        <div className="container py-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter users based on search and role
  const filteredUsers = Array.isArray(allUsers) 
    ? allUsers.filter((u) => {
        const matchesSearch = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
      })
    : [];

  // Filter courses based on status
  const filteredCourses = Array.isArray(coursesWithStats) 
    ? coursesWithStats.filter((course) => {
        return courseStatusFilter === "all" || course.status === courseStatusFilter;
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminHeader />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Manage your learning platform with ease and efficiency
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">System Online</span>
            </div>
            <Button
              onClick={() => setShowTourInterface(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Take a Tour of Meeting Matters
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link href="/admin/users">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:scale-105 transition-transform">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription className="text-blue-100">Total Users</CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      {stats?.totalUsers || 0}
                    </CardTitle>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stats?.activeUsers || 0} active this month</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/courses">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:scale-105 transition-transform">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription className="text-green-100">Total Courses</CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      {stats?.totalCourses || 0}
                    </CardTitle>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-green-100">
                  <Globe className="h-4 w-4" />
                  <span>{stats?.publishedCourses || 0} published, {stats?.draftCourses || 0} drafts</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/enrollments">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription className="text-purple-100">Enrollments</CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      {stats?.totalEnrollments || 0}
                    </CardTitle>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-purple-100">
                  <Calendar className="h-4 w-4" />
                  <span>{stats?.newEnrollmentsThisMonth || 0} new this month</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/certificates">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:scale-105 transition-transform">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription className="text-orange-100">Completion Rate</CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      {stats?.overallCompletionRate || 0}%
                    </CardTitle>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <Award className="h-4 w-4" />
                  <span>{stats?.certificatesIssued || 0} certificates issued</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Course Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/admin/users">
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'No name'}
                          </p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'instructor' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {u.createdAt ? formatDate(new Date(u.createdAt)) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Select value={courseStatusFilter} onValueChange={setCourseStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/admin/courses">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Manage Courses
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>Manage and monitor course performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCourses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.instructorName} • {course.moduleCount} modules
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'outline'}>
                          {course.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {course.enrolledCount} enrolled
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Tour Interface */}
      <TourInterface 
        isOpen={showTourInterface} 
        onClose={() => setShowTourInterface(false)} 
      />
    </div>
  );
}