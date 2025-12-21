import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { courseSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  Video,
  AudioLines,
  FileText,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  PlusCircle,
  Lock
} from "lucide-react";
import { PrerequisiteManager } from "@/components/PrerequisiteManager";

// Create a form schema extending the base course schema
const editCourseSchema = courseSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.string().url("Please enter a valid URL for the course image"),
  previewVideoUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.array(z.string()).optional(),
});

// Define the form type
type EditCourseFormValues = z.infer<typeof editCourseSchema>;

export default function EditCoursePage() {
  const { id } = useParams();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  
  // Fetch course data
  const { data: course, isLoading: isCourseLoading, error } = useQuery({
    queryKey: [`/api/courses/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id && !isAuthLoading && isAuthenticated,
  });
  
  // Initialize the form
  const form = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      previewVideoUrl: "",
      duration: 60,
      status: "draft",
      tags: [],
    }
  });
  
  // Update form values when data is loaded
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        previewVideoUrl: course.previewVideoUrl || "",
        duration: course.duration || 60,
        status: course.status,
        tags: course.tags || [],
      });
    }
  }, [course, form]);
  
  // Redirect if not authenticated or not an instructor
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "instructor")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
  }
  
  // Loading state
  if (isCourseLoading || !course) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Handle API error
  if (error) {
    return (
      <div className="container py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load course</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There was an error loading this course. Please try again or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/instructor">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Check if course exists and if the logged-in instructor is the owner
  if (course && course.instructorId !== user?.id) {
    return <Redirect to="/instructor" />;
  }
  
  // Handle tag additions
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim()) && currentTags.length < 5) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };
  
  // Handle tag removals
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };
  
  // Handle course update
  const updateCourse = async (data: EditCourseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Submit to API
      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update course");
      }
      
      // Show success message
      toast({
        title: "Course Updated",
        description: "Your course has been successfully updated.",
        variant: "default",
      });
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // Reload the page data
      return await response.json();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle publishing course
  const publishCourse = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit to API
      const response = await fetch(`/api/courses/${id}/publish`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to publish course");
      }
      
      // Show success message
      toast({
        title: "Course Published",
        description: "Your course is now available to students.",
        variant: "default",
      });
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // Reload the page data
      setShowPublishDialog(false);
      return await response.json();
    } catch (error) {
      console.error("Error publishing course:", error);
      toast({
        title: "Error",
        description: "Failed to publish course. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle archiving course
  const archiveCourse = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit to API
      const response = await fetch(`/api/courses/${id}/archive`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to archive course");
      }
      
      // Show success message
      toast({
        title: "Course Archived",
        description: "Your course has been archived and is no longer available to students.",
        variant: "default",
      });
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // Reload the page data
      return await response.json();
    } catch (error) {
      console.error("Error archiving course:", error);
      toast({
        title: "Error",
        description: "Failed to archive course. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting course
  const deleteCourse = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit to API
      const response = await fetch(`/api/instructor/courses/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
      
      // Show success message
      toast({
        title: "Course Deleted",
        description: "Your course has been permanently deleted.",
        variant: "default",
      });
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/courses"] });
      
      // Redirect to courses page
      setShowDeleteDialog(false);
      setLocation("/instructor");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: EditCourseFormValues) => {
    await updateCourse(data);
  };
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/instructor">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-muted-foreground">
              Update course details and manage course content
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={
              course.status === "published" ? "bg-green-600" :
              course.status === "draft" ? "bg-secondary" :
              "bg-muted-foreground"
            }>
              {course.status === "published" ? "Published" :
               course.status === "draft" ? "Draft" :
               "Archived"}
            </Badge>
            
            {course.status === "draft" && (
              <Button
                onClick={() => setShowPublishDialog(true)}
                variant="default"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Update the basic details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                            {...field} 
                            placeholder="e.g., https://www.youtube.com/embed/xxxxx or video file URL"
                          />
                        </FormControl>
                        <FormDescription>
                          Add a preview/introduction video URL to showcase your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Course Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {form.watch("tags")?.map((tag) => (
                        <Badge key={tag} className="pl-2 flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                          </Button>
                        </Badge>
                      ))}
                      {!form.watch("tags")?.length && (
                        <p className="text-sm text-muted-foreground">No tags added yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., Anxiety, Mental Health)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="secondary" onClick={addTag}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <FormDescription className="mt-2">
                      Tags help students find your course. Add up to 5 relevant tags.
                    </FormDescription>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/instructor/courses/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Modules Tab */}
            <TabsContent value="modules" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Course Modules</CardTitle>
                      <CardDescription>
                        Organize your course into modules and lessons
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href={`/instructor/courses/builder/${id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Module
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.modules?.length ? (
                    <div className="space-y-4">
                      {course.modules.map((module, index) => (
                        <div 
                          key={module.id} 
                          className="border rounded-md p-4 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                                {index + 1}
                              </div>
                              <h3 className="font-medium">{module.title}</h3>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          <div className="pl-10 space-y-2">
                            <div className="text-sm font-medium mb-1">Content Items</div>
                            
                            {module.content?.length ? (
                              <div className="space-y-2">
                                {module.content.map((content) => (
                                  <div key={content.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                      {content.type === 'video' ? (
                                        <Video className="h-4 w-4 text-blue-500" />
                                      ) : content.type === 'audio' ? (
                                        <AudioLines className="h-4 w-4 text-orange-500" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className="text-sm">{content.title}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <Edit className="h-3.5 w-3.5" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No content items added yet</p>
                            )}
                            
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Content
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-4 flex justify-center">
                        <div className="border-2 border-dashed rounded-full p-6 border-muted-foreground/30">
                          <PlusCircle className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium mb-2">No modules yet</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                        Start building your course by adding modules with videos, audio files, PDFs, 
                        quizzes, and assignments.
                      </p>
                      <Button asChild>
                        <Link href={`/instructor/courses/builder/${id}`}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Your First Module
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Prerequisites Tab */}
            <TabsContent value="prerequisites" className="space-y-6">
              <PrerequisiteManager 
                type="course" 
                itemId={id} 
                itemTitle={course?.title || "Course"} 
              />
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                  <CardDescription>
                    Configure course visibility and availability settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Course Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="draft" id="draft" />
                              <label
                                htmlFor="draft"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Draft - Not visible to students
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="published" id="published" />
                              <label
                                htmlFor="published"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Published - Visible to all students
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="archived" id="archived" />
                              <label
                                htmlFor="archived"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Archived - Hidden from new students
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          {field.value === "draft" 
                            ? "Your course will be saved but not visible to students."
                            : field.value === "published"
                            ? "Your course will be available to all students."
                            : "Your course will be hidden from new students, but existing enrolled students can still access it."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Danger Zone</h3>
                    <div className="rounded-md border border-destructive/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-destructive">Delete this course</h4>
                          <p className="text-sm text-muted-foreground">
                            Once deleted, this course and all its content will be permanently removed.
                            This action cannot be undone.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          Delete Course
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border p-4 bg-destructive/10">
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive mb-1">Warning: Permanent Action</h4>
                  <p className="text-sm text-muted-foreground">
                    All course content, student progress, and data associated with "{course.title}" will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium">
              Type "{course.title}" below to confirm deletion:
            </p>
            <Input placeholder={`Type "${course.title}" to confirm`} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteCourse}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
            <DialogDescription>
              Are you ready to publish your course and make it available to students?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border p-4 bg-muted">
              <div className="flex gap-3 items-start">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Publishing Checklist</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      Course title and description are complete
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      Course image has been added
                    </li>
                    <li className="flex items-start gap-2">
                      {course.modules?.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      )}
                      Course has at least one module with content
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={publishCourse}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}