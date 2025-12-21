import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Edit, 
  Eye, 
  Trash2, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  TrendingUp,
  Play,
  ExternalLink,
  Loader2,
  Copy,
  FileText,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function InstructorCoursesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewCourse, setPreviewCourse] = useState<any>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>({});

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/instructor/courses"],
  });

  // Handle button actions with loading states
  const handleViewCourse = (courseId: string) => {
    console.log('View course clicked:', courseId);
    setLoadingActions(prev => ({ ...prev, [courseId]: 'view' }));
    toast({
      title: "Opening course...",
      description: "Redirecting to course view page",
    });
    // Navigate immediately for better user experience
    setLocation(`/courses/${courseId}`);
  };

  const handleEditCourse = (courseId: string) => {
    console.log('Edit course clicked:', courseId);
    setLoadingActions(prev => ({ ...prev, [courseId]: 'edit' }));
    toast({
      title: "Opening editor...",
      description: "Loading course editor",
    });
    // Navigate immediately for better user experience
    setLocation(`/instructor/courses/${courseId}/edit`);
  };

  const handlePreviewCourse = (course: any) => {
    console.log('Preview course clicked:', course);
    setLoadingActions(prev => ({ ...prev, [course.id]: 'preview' }));
    toast({
      title: "Loading preview...",
      description: "Opening course preview modal",
    });
    // Show preview modal immediately
    setPreviewCourse(course);
  };

  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => apiRequest("DELETE", `/api/instructor/courses/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const draftCourses = filteredCourses.filter((course: any) => course.status === "draft");
  const publishedCourses = filteredCourses.filter((course: any) => course.status === "published");
  const archivedCourses = filteredCourses.filter((course: any) => course.status === "archived");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const CourseCard = ({ course }: { course: any }) => {
    const isLoading = loadingActions[course.id];
    
    return (
      <div 
        style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          backgroundColor: 'white',
          padding: '0',
          margin: '0',
          position: 'relative'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                {course.description}
              </p>
            </div>
            <div style={{ padding: '8px' }}>
              <span style={{ 
                backgroundColor: course.status === 'published' ? '#dcfce7' : course.status === 'draft' ? '#fef3c7' : '#f3f4f6',
                color: course.status === 'published' ? '#166534' : course.status === 'draft' ? '#92400e' : '#374151',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {course.status}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
              <span>👥 {course.enrolledCount || 0} students</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
              <span>📚 {course.moduleCount || 0} modules</span>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '16px', paddingTop: '0' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
              <span>📅 Created {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              paddingTop: '16px', 
              borderTop: '1px solid #f3f4f6',
              position: 'relative',
              zIndex: 10000
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log('Button container mouse down - preventing propagation');
            }}
          >
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('View button clicked!');
                console.log('BUTTON CLICKED - Navigating to view course');
                setTimeout(() => {
                  window.location.href = `/instructor/courses/${course.id}`;
                }, 100);
              }}
              style={{ 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 10001,
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              👁️ View
            </button>
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Preview button clicked!');
                console.log('BUTTON CLICKED - Opening preview modal');
                setTimeout(() => {
                  setPreviewCourse(course);
                }, 100);
              }}
              style={{ 
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 10001,
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              ▶️ Preview
            </button>
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Edit button clicked!');
                console.log('BUTTON CLICKED - Navigating to edit course');
                setTimeout(() => {
                  window.location.href = `/instructor/courses/${course.id}/edit`;
                }, 100);
              }}
              style={{ 
                background: '#f59e0b', 
                color: 'white', 
                border: 'none', 
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 10001,
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
            <p className="text-muted-foreground">
              Manage and monitor your course portfolio
            </p>
          </div>
          <Button asChild>
            <Link href="/instructor/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{publishedCourses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{draftCourses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((acc: number, course: any) => acc + (course.enrolledCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({draftCourses.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedCourses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by creating your first course"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/instructor/courses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="published" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="draft" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="archived" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Preview Modal */}
      <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Course Preview: {previewCourse?.title}
            </DialogTitle>
            <DialogDescription>
              This is how students will experience your course. Navigate through modules and content as a learner would.
            </DialogDescription>
          </DialogHeader>
          
          {previewCourse && (
            <div className="space-y-6">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">{previewCourse.title}</h1>
                <p className="text-blue-100 mb-4">{previewCourse.description}</p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {previewCourse.moduleCount || 0} modules
                  </Badge>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {previewCourse.duration ? `${previewCourse.duration} hours` : 'Self-paced'}
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Course Modules</h3>
                
                {/* Sample Module Structure */}
                <div className="space-y-3">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Module 1: Introduction</CardTitle>
                        <Badge variant="outline">3 lessons</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <Play className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">Lesson 1.1: Getting Started</span>
                          <div className="ml-auto text-xs text-muted-foreground">5 min</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm">Lesson 1.2: Core Concepts</span>
                          <div className="ml-auto text-xs text-muted-foreground">12 min</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="text-sm">Lesson 1.3: Practice Exercise</span>
                          <div className="ml-auto text-xs text-muted-foreground">8 min</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Module 2: Advanced Topics</CardTitle>
                        <Badge variant="outline">4 lessons</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <Play className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">Lesson 2.1: Deep Dive</span>
                          <div className="ml-auto text-xs text-muted-foreground">15 min</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm">Lesson 2.2: Case Studies</span>
                          <div className="ml-auto text-xs text-muted-foreground">20 min</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="text-sm">Lesson 2.3: Interactive Quiz</span>
                          <div className="ml-auto text-xs text-muted-foreground">10 min</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <Award className="h-4 w-4 mr-2 text-yellow-500" />
                          <span className="text-sm">Lesson 2.4: Final Assessment</span>
                          <div className="ml-auto text-xs text-muted-foreground">25 min</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Actions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Course Syllabus
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Progress: 0% completed
                    </div>
                  </div>
                </div>

                {/* Navigation Notice */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Student Experience Preview</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This preview shows the course structure and interface students will see. To experience the full course as a student, 
                        click "View" to open the public course page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewCourse(null)}>
                  Close Preview
                </Button>
                <Button onClick={() => handleViewCourse(previewCourse.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Course
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}