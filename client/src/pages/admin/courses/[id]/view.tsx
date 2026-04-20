import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/currency";
import { type SupportedCurrency } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit3, 
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Video,
  FileText,
  Headphones,
  Clock
} from "lucide-react";

export default function ViewCoursePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = params.id;

  // Fetch course data
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/admin/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch course modules
  const { data: modules = [] } = useQuery({
    queryKey: [`/api/admin/courses/${courseId}/modules`],
    enabled: !!courseId,
  });

  if (!user || user.role !== "admin") {
    return <div>Access denied</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Course Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => setLocation("/admin/courses")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin/courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">Course Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={
              course.status === 'published' ? 'default' : 
              course.status === 'draft' ? 'secondary' : 
              'outline'
            }>
              {course.status}
            </Badge>
            <Button onClick={() => setLocation(`/admin/courses/${courseId}/edit`)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Course Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600 mt-1">{course.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Instructor</h3>
                      <p className="text-gray-600 mt-1">{course.instructorName || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Difficulty</h3>
                      <p className="text-gray-600 mt-1 capitalize">{course.difficulty || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Category</h3>
                      <p className="text-gray-600 mt-1">{course.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Price</h3>
                      <p className="text-gray-600 mt-1">
                        {course.price && parseFloat(course.price) > 0 
                          ? formatCurrency(parseFloat(course.price), (course.currency as SupportedCurrency) || 'USD')
                          : 'Free'
                        }
                      </p>
                    </div>
                  </div>

                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900">Tags</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Course Content
                  <Badge variant="secondary">
                    {modules.length} module{modules.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Modules and lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(modules) && modules.length > 0 ? (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">
                              Module {index + 1}: {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description || 'No description'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {module.content?.length || 0} items
                          </Badge>
                        </div>
                        
                        {module.content && module.content.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">Content:</h5>
                            {module.content.map((content: any) => (
                              <div key={content.id} className="flex items-center gap-2 text-sm">
                                {getContentTypeIcon(content.type)}
                                <span>{content.title}</span>
                                {content.duration && (
                                  <span className="text-muted-foreground ml-auto flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {content.duration}min
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No modules have been added to this course yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enrolled Students</span>
                    </div>
                    <span className="font-medium">{course.enrolledCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Modules</span>
                    </div>
                    <span className="font-medium">{modules.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Revenue</span>
                    </div>
                    <span className="font-medium">
                      ${((course.price || 0) * (course.enrolledCount || 0)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created</span>
                    </div>
                    <span className="font-medium">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last Updated</span>
                    </div>
                    <span className="font-medium">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation(`/admin/courses/${courseId}/edit`)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Course Details
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation(`/admin/enrollments?course=${courseId}`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Enrollments
                  </Button>

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation(`/admin/analytics?course=${courseId}`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}