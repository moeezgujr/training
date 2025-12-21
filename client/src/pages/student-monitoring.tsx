import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Users, UserCheck, UserX, Clock, TrendingUp, Search, Filter, Download } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { StudentMonitoringDto, ActivitySummaryDto, CourseProgressDto } from '@shared/schema';

export default function StudentMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Fetch student monitoring data
  const { data: students = [], isLoading: studentsLoading } = useQuery<StudentMonitoringDto[]>({
    queryKey: ['/api/student-monitoring', courseFilter === 'all' ? undefined : courseFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (courseFilter !== 'all') {
        params.append('courseId', courseFilter);
      }
      const response = await fetch(`/api/student-monitoring?${params}`);
      return response.json();
    }
  });

  // Fetch activity summary
  const { data: summary } = useQuery<ActivitySummaryDto>({
    queryKey: ['/api/student-monitoring/summary', courseFilter === 'all' ? undefined : courseFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (courseFilter !== 'all') {
        params.append('courseId', courseFilter);
      }
      const response = await fetch(`/api/student-monitoring/summary?${params}`);
      return response.json();
    }
  });

  // Fetch student progress details when a student is selected
  const { data: studentProgress } = useQuery<CourseProgressDto[]>({
    queryKey: ['/api/student-monitoring/progress', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const response = await fetch(`/api/student-monitoring/progress/${selectedStudent}`);
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      at_risk: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getEngagementBadge = (level: string) => {
    const variants = {
      high: 'bg-blue-100 text-blue-800',
      medium: 'bg-purple-100 text-purple-800',
      low: 'bg-orange-100 text-orange-800'
    };
    return variants[level as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Monitoring</h1>
            <p className="text-muted-foreground">Track student progress, engagement, and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.activeStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalStudents > 0 ? Math.round((summary.activeStudents / summary.totalStudents) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.atRiskStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalStudents > 0 ? Math.round((summary.atRiskStudents / summary.totalStudents) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.averageProgress}%</div>
                <Progress value={summary.averageProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Student Details</TabsTrigger>
            <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Overview</CardTitle>
                <CardDescription>Monitor student engagement and progress</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(student.status)}>
                              {student.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getEngagementBadge(student.engagementLevel)}>
                              {student.engagementLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{student.overallProgress}%</span>
                              </div>
                              <Progress value={student.overallProgress} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {student.completedCourses}/{student.enrolledCourses}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{formatTime(student.totalTimeSpent)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {student.lastActive 
                                ? new Date(student.lastActive).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(student.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedStudent && studentProgress ? (
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Details</CardTitle>
                  <CardDescription>Detailed course progress and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentProgress.map((progress) => (
                      <div key={progress.courseId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{progress.courseTitle}</h3>
                          <Badge variant="outline">{progress.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Progress</div>
                            <div className="font-medium">{progress.progress}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Time Spent</div>
                            <div className="font-medium">{formatTime(progress.timeSpent)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Modules</div>
                            <div className="font-medium">{progress.completedModules}/{progress.totalModules}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Quiz Average</div>
                            <div className="font-medium">{progress.averageQuizScore}%</div>
                          </div>
                        </div>
                        <Progress value={progress.progress} className="mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a student to view detailed progress</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {summary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Students with high engagement levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.topPerformers.map((student, index) => (
                        <div key={student.id} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.overallProgress}% progress
                            </div>
                          </div>
                          <Badge className={getEngagementBadge(student.engagementLevel)}>
                            {student.engagementLevel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Struggling Students */}
                <Card>
                  <CardHeader>
                    <CardTitle>Students Needing Attention</CardTitle>
                    <CardDescription>Students with low engagement or at risk</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.strugglingStudents.map((student, index) => (
                        <div key={student.id} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium">
                            !
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {`${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.overallProgress}% progress
                            </div>
                          </div>
                          <Badge className={getStatusBadge(student.status)}>
                            {student.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}