import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, FileEdit, Users, Calendar, BarChart2, CheckCircle, XCircle, BookOpen, Eye, Trash2, MoreVertical, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { CourseEditor } from "@/components/instructor/course-editor";
import { Redirect } from "@/components/ui/redirect";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

export default function InstructorCoursesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  
  // Fetch instructor courses
  const { data: instructorCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/instructor/courses"],
    queryFn: async () => {
      return await apiRequest({ url: "/api/instructor/courses" });
    },
    enabled: isAuthenticated && user?.role === "instructor",
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isLoading && !isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  if (!isLoading && isAuthenticated && user?.role !== "instructor") {
    return <Redirect to="/dashboard" />;
  }
  
  const handleCreateSuccess = (courseId: string) => {
    setIsCreateDialogOpen(false);
    if (courseId) {
      setEditCourseId(courseId);
    }
  };
  
  const handleEditSuccess = () => {
    setEditCourseId(null);
  };

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest({
        url: `/api/instructor/courses/${courseId}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCourse = (course: any) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete.id);
    }
  };

  const handlePreviewCourse = (courseId: string) => {
    // Open course preview in new tab
    window.open(`/course/${courseId}`, '_blank');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Draft
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Published
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your courses
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-gray-200 animate-pulse" />
                    <CardHeader className="pb-2">
                      <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-gray-200 animate-pulse mb-2" />
                      <div className="h-4 w-5/6 bg-gray-200 animate-pulse" />
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : instructorCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructorCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div 
                      className="h-40 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${course.imageUrl})` }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        {getStatusBadge(course.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm line-clamp-2 mb-4">{course.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{course.enrolledCount} students</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{course.moduleCount} modules</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{course.duration} hours</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            Updated {formatDistance(
                              new Date(course.updatedAt || course.createdAt), 
                              new Date(), 
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="flex w-full gap-2">
                        <Button 
                          variant="default" 
                          className="flex-1" 
                          onClick={() => setEditCourseId(course.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewCourse(course.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCourse(course)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileEdit className="h-10 w-10" />}
                title="No courses yet"
                description="Create your first course to get started"
                actionText="Create Course"
                actionOnClick={() => setIsCreateDialogOpen(true)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="published">
            {isLoadingCourses ? (
              <div className="animate-pulse">Loading...</div>
            ) : instructorCourses?.filter((c: any) => c.status === "published").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructorCourses
                  .filter((course: any) => course.status === "published")
                  .map((course: any) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div 
                        className="h-40 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${course.imageUrl})` }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{course.title}</CardTitle>
                          {getStatusBadge(course.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm line-clamp-2 mb-4">{course.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{course.enrolledCount} students</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{course.moduleCount} modules</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex w-full gap-2">
                          <Button 
                            variant="default" 
                            className="flex-1" 
                            onClick={() => setEditCourseId(course.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreviewCourse(course.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCourse(course)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<CheckCircle className="h-10 w-10" />}
                title="No published courses"
                description="You don't have any published courses yet"
                actionText="Create Course"
                actionOnClick={() => setIsCreateDialogOpen(true)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="draft">
            {isLoadingCourses ? (
              <div className="animate-pulse">Loading...</div>
            ) : instructorCourses?.filter((c: any) => c.status === "draft").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructorCourses
                  .filter((course: any) => course.status === "draft")
                  .map((course: any) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div 
                        className="h-40 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${course.imageUrl})` }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{course.title}</CardTitle>
                          {getStatusBadge(course.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm line-clamp-2">{course.description}</p>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex w-full gap-2">
                          <Button 
                            variant="default" 
                            className="flex-1" 
                            onClick={() => setEditCourseId(course.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreviewCourse(course.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCourse(course)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileEdit className="h-10 w-10" />}
                title="No draft courses"
                description="You don't have any courses in draft"
                actionText="Create Course"
                actionOnClick={() => setIsCreateDialogOpen(true)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="archived">
            {isLoadingCourses ? (
              <div className="animate-pulse">Loading...</div>
            ) : instructorCourses?.filter((c: any) => c.status === "archived").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instructorCourses
                  .filter((course: any) => course.status === "archived")
                  .map((course: any) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div 
                        className="h-40 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${course.imageUrl})` }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{course.title}</CardTitle>
                          {getStatusBadge(course.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm line-clamp-2">{course.description}</p>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex w-full gap-2">
                          <Button 
                            variant="default" 
                            className="flex-1" 
                            onClick={() => setEditCourseId(course.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreviewCourse(course.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCourse(course)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={<XCircle className="h-10 w-10" />}
                title="No archived courses"
                description="You don't have any archived courses"
                actionText="View All Courses"
                actionOnClick={() => document.querySelector('[data-value="all"]')?.click()}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course
            </DialogDescription>
          </DialogHeader>
          <CourseEditor onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Course Dialog */}
      <Dialog open={!!editCourseId} onOpenChange={(open) => !open && setEditCourseId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Manage your course content and settings
            </DialogDescription>
          </DialogHeader>
          {editCourseId && (
            <CourseEditor courseId={editCourseId} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Warning</h4>
                <p className="text-sm text-red-700">
                  Deleting this course will permanently remove all course content, modules, lessons, 
                  quizzes, and student progress. Enrolled students will lose access immediately.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setCourseToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCourse}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}