import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { courseSchema, CourseDto, courseStatuses } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tag, X, Plus, Save, Trash2, Upload, Image as ImageIcon, AlertTriangle, Video, Volume2, FileText, HelpCircle, PenTool, BookOpen, Play } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Form validation schema
const formSchema = courseSchema.extend({
  tags: z
    .array(z.string())
    .min(1, { message: "Add at least one tag" })
    .max(10, { message: "You can only add up to 10 tags" }),
}).omit({ 
  id: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseEditorProps {
  courseId?: string;
  onSuccess?: (courseId: string) => void;
}

export function CourseEditor({ courseId, onSuccess }: CourseEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Load course data if editing an existing course
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/instructor/courses/${courseId}`],
    queryFn: async () => {
      if (!courseId) return null;
      return apiRequest("GET", `/api/instructor/courses/${courseId}`);
    },
    enabled: !!courseId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
  
  // Form setup
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      status: "draft",
      duration: 0,
      tags: [],
    },
  });
  
  // Update form when course data loads
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        status: course.status as any,
        duration: course.duration as number,
        tags: course.tags || [],
      });
    }
  }, [course, form]);
  
  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      return courseId
        ? apiRequest({
            url: `/api/courses/${courseId}`,
            method: "PATCH",
            body: data,
          })
        : apiRequest({
            url: "/api/courses",
            method: "POST",
            body: data,
          });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/courses"] });
      toast({
        title: courseId ? "Course updated" : "Course created",
        description: courseId ? "Your course has been updated successfully." : "Your course has been created successfully.",
      });
      
      if (onSuccess) {
        onSuccess(data.id);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error saving your course. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) return null;
      return apiRequest({
        url: `/api/courses/${courseId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/courses"] });
      toast({
        title: "Course deleted",
        description: "Your course has been deleted successfully.",
      });
      
      if (onSuccess) {
        onSuccess("");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error deleting your course. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: CourseFormValues) => {
    createMutation.mutate(data);
  };
  
  // Handle adding a tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (currentTags.includes(tagInput.trim())) {
      toast({
        title: "Duplicate tag",
        description: "This tag has already been added.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentTags.length >= 10) {
      toast({
        title: "Maximum tags reached",
        description: "You can only add up to 10 tags.",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("tags", [...currentTags, tagInput.trim()]);
    setTagInput("");
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  if (isLoadingCourse && courseId) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="modules" disabled={!courseId}>
                Modules & Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Basic information about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course title" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter course description"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of what students will learn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Image *</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative">
                                  <img
                                    src={field.value}
                                    alt="Course preview"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => field.onChange("")}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    if (!file.type.startsWith('image/')) {
                                      toast({
                                        title: "Invalid file type",
                                        description: "Please select an image file",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast({
                                        title: "File too large",
                                        description: "Please select an image smaller than 5MB",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    
                                    try {
                                      const response = await fetch('/api/upload/image', {
                                        method: 'POST',
                                        body: formData,
                                      });
                                      
                                      if (!response.ok) throw new Error('Upload failed');
                                      
                                      const data = await response.json();
                                      field.onChange(data.url);
                                      
                                      toast({
                                        title: "Image uploaded successfully",
                                        description: "Your course image has been uploaded",
                                      });
                                    } catch (error) {
                                      toast({
                                        title: "Upload failed",
                                        description: "There was an error uploading your image",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  className="hidden"
                                  id="course-image-upload"
                                />
                                <label htmlFor="course-image-upload" className="cursor-pointer">
                                  <div className="space-y-2">
                                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Click to upload image
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5MB
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload an image that represents your course (JPG, PNG, or GIF)
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
                          <FormLabel>Duration (hours) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated course duration in hours
                          </FormDescription>
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
                        <FormLabel>Tags *</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {field.value?.map((tag) => (
                            <Badge key={tag} className="flex items-center gap-1 px-3 py-1">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tag (e.g., Business, Design)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTag}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <FormDescription>
                          Add tags to help learners find your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courseStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Draft: Only visible to you<br />
                          Published: Available for enrollment<br />
                          Archived: No longer accepts new enrollments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  {courseId && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure you want to delete this course?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete the
                            course and all its content, including modules, quizzes, and
                            assignments.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <div className="ml-auto">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || form.formState.isSubmitting}
                    >
                      {createMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {courseId ? "Update Course" : "Create Course"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              {!courseId && (
                <Card className="bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Course Creation Process
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          You'll be able to add modules, content, quizzes and assignments after creating the course.
                          Save this form first to continue to the next step.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="modules">
              {courseId ? (
                <DirectContentEditor courseId={courseId} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p>Save the course first to add content.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

interface ModuleEditorProps {
  courseId: string;
}

function ModuleEditor({ courseId }: ModuleEditorProps) {
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);
  const [isAddQuizDialogOpen, setIsAddQuizDialogOpen] = useState(false);
  const [isAddAssignmentDialogOpen, setIsAddAssignmentDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const { toast } = useToast();
  
  // Load course modules
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      return apiRequest({ url: `/api/courses/${courseId}` });
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Content</h3>
        <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Modules are the main sections of your course.
              </DialogDescription>
            </DialogHeader>
            <ModuleForm 
              courseId={courseId} 
              onSuccess={() => {
                setIsAddModuleDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="py-10 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : course?.modules?.length > 0 ? (
        <div className="space-y-4">
          {course.modules.map((module: any, index: number) => (
            <Card key={module.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        Module {index + 1}
                      </Badge>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedModule(module.id);
                        setIsAddContentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedModule(module.id);
                        setIsAddQuizDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedModule(module.id);
                        setIsAddAssignmentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Assignment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <Tabs defaultValue="content">
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">
                      Content ({module.content.length})
                    </TabsTrigger>
                    <TabsTrigger value="quizzes">
                      Quizzes ({module.quizzes.length})
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                      Assignments ({module.assignments.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content">
                    {module.content.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {module.content.map((content: any) => (
                            <TableRow key={content.id}>
                              <TableCell className="font-medium">{content.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {content.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {content.duration ? `${content.duration} min` : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No content added yet
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="quizzes">
                    {module.quizzes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Passing Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {module.quizzes.map((quiz: any) => (
                            <TableRow key={quiz.id}>
                              <TableCell className="font-medium">{quiz.title}</TableCell>
                              <TableCell>{quiz.questions?.length || 0}</TableCell>
                              <TableCell>{quiz.passingScore}%</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No quizzes added yet
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="assignments">
                    {module.assignments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {module.assignments.map((assignment: any) => (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">
                                {assignment.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {assignment.submissionType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {assignment.dueDate
                                  ? new Date(assignment.dueDate).toLocaleDateString()
                                  : "No due date"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No assignments added yet
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No modules added to this course yet
            </p>
            <Button
              onClick={() => setIsAddModuleDialogOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Module
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Content Dialog */}
      <Dialog open={isAddContentDialogOpen} onOpenChange={setIsAddContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>
              Add videos, audio, or PDF materials to this module.
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            courseId={courseId}
            moduleId={selectedModule}
            onSuccess={() => {
              setIsAddContentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Quiz Dialog */}
      <Dialog open={isAddQuizDialogOpen} onOpenChange={setIsAddQuizDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Quiz</DialogTitle>
            <DialogDescription>
              Create a quiz to test learners' knowledge.
            </DialogDescription>
          </DialogHeader>
          <QuizForm
            courseId={courseId}
            moduleId={selectedModule}
            onSuccess={() => {
              setIsAddQuizDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddAssignmentDialogOpen} onOpenChange={setIsAddAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Assignment</DialogTitle>
            <DialogDescription>
              Create an assignment for learners to submit.
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm
            courseId={courseId}
            moduleId={selectedModule}
            onSuccess={() => {
              setIsAddAssignmentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Module Form
interface ModuleFormProps {
  courseId: string;
  moduleId?: string;
  onSuccess?: () => void;
}

function ModuleForm({ courseId, moduleId, onSuccess }: ModuleFormProps) {
  const { toast } = useToast();
  
  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      courseId,
      order: 1,
    },
  });
  
  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest({
        url: `/api/instructor/courses/${courseId}/modules`,
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Module created",
        description: "Module has been added to the course.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating the module.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: any) => {
    createModuleMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="title">Module Title*</Label>
          <Input
            id="title"
            placeholder="Enter module title"
            {...form.register("title", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description*</Label>
          <Textarea
            id="description"
            placeholder="Enter module description"
            {...form.register("description", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min={1}
            placeholder="1"
            {...form.register("order", { required: true, min: 1, valueAsNumber: true })}
          />
          <p className="text-sm text-muted-foreground">
            The order in which this module appears in the course
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={createModuleMutation.isPending || form.formState.isSubmitting}
        >
          {createModuleMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            "Add Module"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Content Form
interface ContentFormProps {
  courseId: string;
  moduleId: string;
  contentId?: string;
  onSuccess?: () => void;
}

function ContentForm({ courseId, moduleId, contentId, onSuccess }: ContentFormProps) {
  const { toast } = useToast();
  
  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      type: "video",
      url: "",
      description: "",
      moduleId,
      order: 1,
      duration: 0,
    },
  });
  
  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest({
        url: "/api/modules/content",
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Content created",
        description: "Content has been added to the module.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating the content.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: any) => {
    createContentMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="title">Content Title*</Label>
          <Input
            id="title"
            placeholder="Enter content title"
            {...form.register("title", { required: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Content Type*</Label>
          <Select 
            onValueChange={(value) => form.setValue("type", value)}
            defaultValue={form.getValues("type")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="pdf">PDF Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url">Content URL*</Label>
          <Input
            id="url"
            placeholder="https://example.com/content"
            {...form.register("url", { required: true })}
          />
          <p className="text-sm text-muted-foreground">
            URL to the content (video, audio, or PDF)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter content description"
            {...form.register("description")}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              min={1}
              placeholder="1"
              {...form.register("order", { required: true, min: 1, valueAsNumber: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              placeholder="0"
              {...form.register("duration", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={createContentMutation.isPending || form.formState.isSubmitting}
        >
          {createContentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            "Add Content"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Quiz Form stub
function QuizForm({ courseId, moduleId, onSuccess }: { courseId: string; moduleId: string; onSuccess?: () => void }) {
  return (
    <div className="py-4">
      <p className="text-center">Quiz form would go here</p>
      <div className="flex justify-end mt-4">
        <Button onClick={onSuccess}>Close</Button>
      </div>
    </div>
  );
}

// Assignment Form stub
function AssignmentForm({ courseId, moduleId, onSuccess }: { courseId: string; moduleId: string; onSuccess?: () => void }) {
  return (
    <div className="py-4">
      <p className="text-center">Assignment form would go here</p>
      <div className="flex justify-end mt-4">
        <Button onClick={onSuccess}>Close</Button>
      </div>
    </div>
  );
}

// Direct Content Editor - Skip modules and go straight to content
interface DirectContentEditorProps {
  courseId: string;
}

function DirectContentEditor({ courseId }: DirectContentEditorProps) {
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);
  const [isAddQuizDialogOpen, setIsAddQuizDialogOpen] = useState(false);
  const [isAddAssignmentDialogOpen, setIsAddAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load course content directly
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      return apiRequest({ url: `/api/courses/${courseId}` });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-lg font-medium">Add Your Course Content</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddContentDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Video className="h-4 w-4 mr-2" />
            Add Video
          </Button>
          <Button onClick={() => setIsAddContentDialogOpen(true)} variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
            <Volume2 className="h-4 w-4 mr-2" />
            Add Audio
          </Button>
          <Button onClick={() => setIsAddContentDialogOpen(true)} variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
            <FileText className="h-4 w-4 mr-2" />
            Add PDF
          </Button>
          <Button variant="outline" onClick={() => setIsAddQuizDialogOpen(true)} className="border-purple-500 text-purple-600 hover:bg-purple-50">
            <HelpCircle className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
          <Button variant="outline" onClick={() => setIsAddAssignmentDialogOpen(true)} className="border-orange-500 text-orange-600 hover:bg-orange-50">
            <PenTool className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4">
        {course?.modules?.map((module: any) =>
          module.content?.map((content: any) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {content.type === 'video' && <Video className="h-5 w-5 text-blue-500" />}
                  {content.type === 'audio' && <Volume2 className="h-5 w-5 text-green-500" />}
                  {content.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                  <div className="flex-1">
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-sm text-muted-foreground">{content.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-muted rounded capitalize">{content.type}</span>
                      {content.duration && <span className="text-xs text-muted-foreground">{content.duration} min</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) || []}

        {/* Show welcome message */}
        {(!course?.modules || course.modules.length === 0) && (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to add your content!</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your course by adding videos, audio files, PDFs, quizzes, and assignments.<br/>
                    Click any of the buttons above to get started.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>📹 <strong>Videos:</strong> YouTube links, video files</p>
                    <p>🎵 <strong>Audio:</strong> Lectures, podcasts, interviews</p>
                    <p>📄 <strong>PDFs:</strong> Reading materials, handouts</p>
                    <p>❓ <strong>Quizzes:</strong> Test student knowledge</p>
                    <p>📝 <strong>Assignments:</strong> Projects and submissions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Content Dialog */}
      <Dialog open={isAddContentDialogOpen} onOpenChange={setIsAddContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Content to Your Course</DialogTitle>
            <DialogDescription>
              Add videos, audio files, or PDF documents. Students will access these in order.
            </DialogDescription>
          </DialogHeader>
          <SimpleContentForm
            courseId={courseId}
            onSuccess={() => {
              setIsAddContentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Quiz Dialog */}
      <Dialog open={isAddQuizDialogOpen} onOpenChange={setIsAddQuizDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a Quiz</DialogTitle>
            <DialogDescription>
              Test your students' understanding with multiple choice questions
            </DialogDescription>
          </DialogHeader>
          <SimpleQuizForm
            courseId={courseId}
            onSuccess={() => {
              setIsAddQuizDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddAssignmentDialogOpen} onOpenChange={setIsAddAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create an Assignment</DialogTitle>
            <DialogDescription>
              Give students a project or task to complete and submit
            </DialogDescription>
          </DialogHeader>
          <SimpleAssignmentForm
            courseId={courseId}
            onSuccess={() => {
              setIsAddAssignmentDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simplified forms that automatically create modules in the background
function SimpleContentForm({ courseId, onSuccess }: { courseId: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      title: "",
      type: "video",
      url: "",
      description: "",
      duration: 0,
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create a default module if none exists
      const moduleResponse = await apiRequest({
        url: `/api/instructor/courses/${courseId}/modules`,
        method: "POST",
        body: {
          title: "Course Content",
          description: "Main course content",
          order: 1,
        },
      });
      
      // Then add content to that module
      return apiRequest({
        url: "/api/modules/content",
        method: "POST",
        body: {
          ...data,
          moduleId: moduleResponse.id,
          order: 1,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Content added successfully!",
        description: "Your content has been added to the course.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error adding content",
        description: "There was an error adding your content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createContentMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Content Title*</Label>
          <Input
            id="title"
            placeholder="e.g., Introduction to the Topic"
            {...form.register("title", { required: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Content Type*</Label>
          <select
            id="type"
            className="w-full p-2 border rounded-md"
            {...form.register("type", { required: true })}
          >
            <option value="video">📹 Video (YouTube or video file)</option>
            <option value="audio">🎵 Audio (MP3, podcast, etc.)</option>
            <option value="pdf">📄 PDF Document</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url">URL/Link*</Label>
          <Input
            id="url"
            placeholder="https://youtube.com/watch?v=... or file URL"
            {...form.register("url", { required: true })}
          />
          <p className="text-xs text-muted-foreground">
            For YouTube videos, use the full YouTube URL. For files, use a direct link to the file.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of this content..."
            {...form.register("description")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            placeholder="e.g., 15"
            {...form.register("duration", { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={createContentMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createContentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Adding Content...
            </>
          ) : (
            "Add Content"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Simplified Quiz Form
function SimpleQuizForm({ courseId, onSuccess }: { courseId: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);

  const createQuizMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create a default module if none exists
      const moduleResponse = await apiRequest({
        url: `/api/instructor/courses/${courseId}/modules`,
        method: "POST",
        body: {
          title: "Course Content",
          description: "Main course content",
          order: 1,
        },
      });
      
      // Then add quiz to that module
      return apiRequest({
        url: "/api/modules/quiz",
        method: "POST",
        body: {
          ...data,
          moduleId: moduleResponse.id,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Quiz created successfully!",
        description: "Your quiz has been added to the course.",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error creating quiz",
        description: "There was an error creating your quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const quizData = {
      title: "Course Quiz",
      description: "Test your knowledge",
      questions: questions.filter(q => q.question.trim() !== ""),
    };
    
    if (quizData.questions.length === 0) {
      toast({
        title: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }
    
    createQuizMutation.mutate(quizData);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question') {
      updated[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('_')[1]);
      updated[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value;
    }
    setQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`question_${qIndex}`}>Question {qIndex + 1}*</Label>
                <Textarea
                  id={`question_${qIndex}`}
                  placeholder="Enter your question..."
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Answer Options*</Label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct_${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                    />
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateQuestion(qIndex, `option_${oIndex}`, e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {question.correctAnswer === oIndex ? "✓ Correct" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Add Another Question
        </Button>
      </div>
      
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={createQuizMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createQuizMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Creating Quiz...
            </>
          ) : (
            "Create Quiz"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

// Simplified Assignment Form
function SimpleAssignmentForm({ courseId, onSuccess }: { courseId: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      submissionType: "text",
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create a default module if none exists
      const moduleResponse = await apiRequest({
        url: `/api/instructor/courses/${courseId}/modules`,
        method: "POST",
        body: {
          title: "Course Content",
          description: "Main course content",
          order: 1,
        },
      });
      
      // Then add assignment to that module
      return apiRequest({
        url: "/api/modules/assignment",
        method: "POST",
        body: {
          ...data,
          moduleId: moduleResponse.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignment created successfully!",
        description: "Your assignment has been added to the course.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error creating assignment",
        description: "There was an error creating your assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createAssignmentMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Assignment Title*</Label>
          <Input
            id="title"
            placeholder="e.g., Week 1 Project"
            {...form.register("title", { required: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description*</Label>
          <Textarea
            id="description"
            placeholder="Describe what students need to do for this assignment..."
            className="min-h-[100px]"
            {...form.register("description", { required: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="submissionType">Submission Type*</Label>
          <select
            id="submissionType"
            className="w-full p-2 border rounded-md"
            {...form.register("submissionType", { required: true })}
          >
            <option value="text">📝 Text Response</option>
            <option value="file">📎 File Upload</option>
          </select>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={createAssignmentMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createAssignmentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Creating Assignment...
            </>
          ) : (
            "Create Assignment"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Image Upload Component
interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function ImageUpload({ value, onChange, placeholder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const { toast } = useToast();
  const uploadId = `image-upload-${Math.random().toString(36).substr(2, 9)}`;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to your backend
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.url;

      setPreview(imageUrl);
      onChange(imageUrl);

      toast({
        title: "Image uploaded successfully",
        description: "Your image has been optimized and resized to 1200×675 pixels for perfect display",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Course preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null);
              onChange("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={uploadId}
          disabled={isUploading}
        />
        <label htmlFor={uploadId} className="cursor-pointer">
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ✨ Images are automatically optimized to 1200×675 pixels
              </p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

// Label component for forms
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}