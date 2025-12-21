import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InstructorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/instructor/courses"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/instructor/stats"],
  });

  // Mock analytics data - in real app would come from API
  const analyticsData = {
    overview: {
      totalEnrollments: 247,
      completionRate: 78,
      avgTimeToComplete: 14.5,
      studentSatisfaction: 4.7,
      totalRevenue: 12450
    },
    coursePerformance: [
      {
        id: "1",
        title: "Introduction to Psychology",
        enrollments: 89,
        completions: 67,
        completionRate: 75,
        avgRating: 4.8,
        revenue: 4450
      },
      {
        id: "2", 
        title: "Advanced Data Science",
        enrollments: 156,
        completions: 124,
        completionRate: 79,
        avgRating: 4.6,
        revenue: 7800
      },
      {
        id: "3",
        title: "Digital Marketing Fundamentals", 
        enrollments: 32,
        completions: 28,
        completionRate: 87,
        avgRating: 4.9,
        revenue: 1200
      }
    ],
    engagementMetrics: {
      dailyActiveUsers: [12, 19, 15, 23, 18, 27, 22, 31, 25, 19, 16, 24],
      weeklyProgress: [65, 72, 68, 75, 81, 78, 83, 79, 85, 82, 88, 86],
      moduleCompletionRates: [
        { module: "Module 1: Basics", rate: 95 },
        { module: "Module 2: Intermediate", rate: 87 },
        { module: "Module 3: Advanced", rate: 73 },
        { module: "Module 4: Expert", rate: 68 },
        { module: "Final Assessment", rate: 62 }
      ]
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  const CoursePerformanceCard = ({ course }: { course: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {course.enrollments} enrolled
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-200">
            {course.completionRate}% completion
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completions</span>
              <span className="font-medium">{course.completions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Rating</span>
              <span className="font-medium">{course.avgRating}/5.0</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-medium">${course.revenue}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Track performance and student engagement across your courses
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Total Enrollments"
            value={analyticsData.overview.totalEnrollments}
            change={12}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData.overview.completionRate}%`}
            change={5}
            icon={Target}
            color="green"
          />
          <MetricCard
            title="Avg Time to Complete"
            value={`${analyticsData.overview.avgTimeToComplete} days`}
            change={-2}
            icon={Clock}
            color="orange"
          />
          <MetricCard
            title="Student Satisfaction"
            value={`${analyticsData.overview.studentSatisfaction}/5.0`}
            change={3}
            icon={Award}
            color="purple"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
            change={18}
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Enrollment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Enrollment Trends
                  </CardTitle>
                  <CardDescription>
                    Daily enrollment activity over the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {analyticsData.engagementMetrics.dailyActiveUsers.map((value, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${(value / Math.max(...analyticsData.engagementMetrics.dailyActiveUsers)) * 150}px` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rates by Module */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Module Completion Rates
                  </CardTitle>
                  <CardDescription>
                    Completion rates across course modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.engagementMetrics.moduleCompletionRates.map((module, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{module.module}</span>
                          <span className="text-sm text-muted-foreground">{module.rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${module.rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="mt-6">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {analyticsData.coursePerformance.map((course) => (
                  <CoursePerformanceCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Weekly Progress Trends
                  </CardTitle>
                  <CardDescription>
                    Average progress completion by week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {analyticsData.engagementMetrics.weeklyProgress.map((value, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-green-500 rounded-t w-full transition-all duration-300 hover:bg-green-600"
                          style={{ height: `${(value / 100) * 150}px` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">W{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Summary</CardTitle>
                  <CardDescription>
                    Key engagement metrics for your courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Session Duration</span>
                      <span className="text-sm text-muted-foreground">45 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Return Rate</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Discussion Participation</span>
                      <span className="text-sm text-muted-foreground">67%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Assignment Submission Rate</span>
                      <span className="text-sm text-muted-foreground">91%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Course</CardTitle>
                  <CardDescription>
                    Revenue breakdown across your course portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.coursePerformance.map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{course.title}</span>
                          <span className="text-sm font-bold">${course.revenue}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(course.revenue / Math.max(...analyticsData.coursePerformance.map(c => c.revenue))) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>
                    Financial performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Revenue per Student</span>
                      <span className="text-sm font-bold">$50.40</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Recurring Revenue</span>
                      <span className="text-sm font-bold">$3,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm font-bold">12.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Refund Rate</span>
                      <span className="text-sm font-bold">2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}