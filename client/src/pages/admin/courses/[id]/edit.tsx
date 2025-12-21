import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getCurrencyOptions, formatCurrency, formatPriceForDatabase } from "@/lib/currency";
import { supportedCurrencies, type SupportedCurrency } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit3, 
  Trash2,
  BookOpen,
  Video,
  FileText,
  Headphones,
  DollarSign
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const courseFormSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  previewVideoUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.string().optional(),
  currency: z.enum(supportedCurrencies).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
});

const moduleFormSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;
type ModuleFormData = z.infer<typeof moduleFormSchema>;

export default function EditCoursePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = params.id;
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      previewVideoUrl: "",
      status: "draft",
      price: "",
      currency: "USD",
      difficulty: "beginner",
      category: "",
      tags: "",
    },
  });

  const moduleForm = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
    },
  });

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

  // Update form when course data is loaded
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        description: course.description || "",
        previewVideoUrl: course.previewVideoUrl || "",
        status: course.status || "draft",
        price: course.price?.toString() || "",
        currency: course.currency || "USD",
        difficulty: course.difficulty || "beginner",
        category: course.category || "",
        tags: course.tags?.join(", ") || "",
      });
    }
  }, [course, form]);

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: data.price ? formatPriceForDatabase(data.price) : "0.00",
          currency: data.currency || "USD",
          tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        }),
      });
      if (!response.ok) throw new Error("Failed to update course");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Updated",
        description: "The course has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}`] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: ModuleFormData) => {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          duration: data.duration ? parseInt(data.duration) : undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create module");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Module Created",
        description: "The module has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/modules`] });
      setIsModuleDialogOpen(false);
      moduleForm.reset();
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create the module. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    updateCourseMutation.mutate(data);
  };

  const onModuleSubmit = (data: ModuleFormData) => {
    createModuleMutation.mutate(data);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-gray-600 mt-1">Modify course details and content</p>
            </div>
          </div>
          <Badge variant={
            course.status === 'published' ? 'default' : 
            course.status === 'draft' ? 'secondary' : 
            'outline'
          }>
            {course.status}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Course Details Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Update the basic information about your course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter course description" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Price
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getCurrencyOptions().map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.symbol} {option.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Psychology, Health" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter tags separated by commas" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previewVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Introduction Video (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., https://www.youtube.com/embed/xxxxx or video file URL" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setLocation("/admin/courses")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateCourseMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Course Modules */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Course Modules
                  <Button 
                    size="sm" 
                    onClick={() => setIsModuleDialogOpen(true)}
                    data-testid="button-add-module"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage course content and structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(modules) && modules.length > 0 ? (
                  <div className="space-y-3">
                    {modules.map((module, index) => (
                      <div 
                        key={module.id} 
                        className="border rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/admin/courses/${courseId}/modules/${module.id}`)}
                        data-testid={`module-card-${module.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{module.title}</h4>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/admin/courses/${courseId}/modules/${module.id}`);
                              }}
                              data-testid={`button-edit-module-${module.id}`}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Module {index + 1}
                          </span>
                          {module.content?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {module.content.length} content items
                            </span>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-blue-600 font-medium">
                            Click to manage content →
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No modules yet. Add your first module to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Modules</span>
                    <span className="font-medium">{modules?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Enrolled Students</span>
                    <span className="font-medium">{course.enrolledCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Module Dialog */}
        <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Create a new module for this course. You can add content to the module after creating it.
              </DialogDescription>
            </DialogHeader>
            <Form {...moduleForm}>
              <form onSubmit={moduleForm.handleSubmit(onModuleSubmit)} className="space-y-4">
                <FormField
                  control={moduleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter module title" 
                          {...field} 
                          data-testid="input-module-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter module description" 
                          rows={3}
                          {...field} 
                          data-testid="input-module-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes, optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 60" 
                          {...field} 
                          data-testid="input-module-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsModuleDialogOpen(false);
                      moduleForm.reset();
                    }}
                    data-testid="button-cancel-module"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createModuleMutation.isPending}
                    data-testid="button-create-module"
                  >
                    {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}