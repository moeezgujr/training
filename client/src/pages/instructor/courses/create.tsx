import { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ChevronLeft, Info, Plus, X, Edit, FileText, Video, AudioLines, ArrowRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SimpleLessonUpload } from "@/components/course/simple-lesson-upload";

// Create a form schema extending the base course schema
const createCourseSchema = courseSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.string().min(1, "Please upload a course image"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()).optional(),
});

// Define the form type
type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export default function CreateCoursePage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState({
    title: "",
    type: "",
    content: "",
    duration: 5
  });
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });
  
  // Define default form values
  const defaultValues: Partial<CreateCourseFormValues> = {
    title: "",
    description: "",
    imageUrl: "",
    duration: 60,
    status: "draft",
    tags: [],
  };
  
  // Initialize the form
  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues,
  });
  
  // Redirect if not authenticated or not an instructor
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "instructor")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
  }
  
  // Handle tag additions
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim())) {
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
  
  // Handle form submission
  const onSubmit = async (data: CreateCourseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Add the instructor ID
      const courseData = {
        ...data,
        instructorId: user?.id,
      };
      
      // Submit to API
      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create course");
      }
      
      const result = await response.json();
      
      // Show success message
      toast({
        title: data.status === "published" ? "Course Published!" : "Course Saved as Draft",
        description: data.status === "published" 
          ? "Your course is now available to students." 
          : "Your course has been saved. You can publish it when ready.",
        variant: "default",
      });
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // Redirect to the course detail page
      setLocation(`/instructor/courses/${result.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
            <p className="text-muted-foreground">
              Create a course and publish it to the platform
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Details & Content</TabsTrigger>
              <TabsTrigger value="publish">Review & Publish</TabsTrigger>
            </TabsList>
            
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Provide the basic details about your course
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
                          <Input placeholder="e.g., Managing Anxiety and Depression" {...field} />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, specific, and engaging title
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
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what students will learn in this course..." 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a comprehensive overview of your course content and outcomes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image</FormLabel>
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
                                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
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
                          Upload an image that represents your course (1280x720px recommended)
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
                        <FormDescription>
                          Approximate time needed to complete the entire course
                        </FormDescription>
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
                    <Link href="/instructor">Cancel</Link>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Details & Content Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>
                    Create multiple lessons for your course with different content types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Lessons */}
                  {lessons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Added Lessons ({lessons.length})</h3>
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' && <Video className="h-5 w-5 text-blue-500" />}
                              {lesson.type === 'audio' && <AudioLines className="h-5 w-5 text-green-500" />}
                              {lesson.type === 'text' && <FileText className="h-5 w-5 text-purple-500" />}
                              {lesson.type === 'quiz' && <Edit className="h-5 w-5 text-orange-500" />}
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • {lesson.duration} min
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLessons(lessons.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  )}

                  {/* Add New Lesson */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Add New Lesson</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Lesson Title</label>
                        <Input
                          placeholder="e.g., Introduction to Anxiety Management"
                          value={currentLesson.title}
                          onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Duration (minutes)</label>
                        <Input
                          type="number"
                          min="1"
                          value={currentLesson.duration}
                          onChange={(e) => setCurrentLesson({...currentLesson, duration: parseInt(e.target.value) || 5})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Lesson Type</label>
                      <Select
                        value={currentLesson.type}
                        onValueChange={(value) => setCurrentLesson({...currentLesson, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose lesson type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              Video Lesson
                            </div>
                          </SelectItem>
                          <SelectItem value="audio">
                            <div className="flex items-center gap-2">
                              <AudioLines className="h-4 w-4 text-green-500" />
                              Audio Lesson
                            </div>
                          </SelectItem>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              Text/PDF Lesson
                            </div>
                          </SelectItem>
                          <SelectItem value="quiz">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-orange-500" />
                              Quiz
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Content Input Based on Type */}
                    {currentLesson.type === 'video' && (
                      <div>
                        <label className="text-sm font-medium">Video URL or Upload</label>
                        <div className="space-y-3">
                          {currentLesson.content && (
                            <div className="p-3 border rounded-lg bg-gray-50">
                              <p className="text-sm text-gray-600">Video file selected</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentLesson({...currentLesson, content: ""})}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          )}
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                if (!file.type.startsWith('video/')) {
                                  toast({
                                    title: "Invalid file type",
                                    description: "Please select a video file",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                if (file.size > 100 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Please select a video file smaller than 100MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                const formData = new FormData();
                                formData.append('video', file);
                                
                                try {
                                  const response = await fetch('/api/upload/video', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (!response.ok) throw new Error('Upload failed');
                                  
                                  const data = await response.json();
                                  setCurrentLesson({...currentLesson, content: data.url});
                                  
                                  toast({
                                    title: "Video uploaded successfully",
                                    description: "Your video file has been uploaded",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Upload failed",
                                    description: "There was an error uploading your video file",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="hidden"
                              id="video-upload"
                            />
                            <label htmlFor="video-upload" className="cursor-pointer">
                              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm font-medium">Click to upload video</p>
                              <p className="text-xs text-gray-500">MP4, AVI, MOV up to 100MB</p>
                            </label>
                          </div>
                          
                          <div className="text-center text-sm text-gray-500">or</div>
                          
                          <Input
                            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                            value={currentLesson.content}
                            onChange={(e) => setCurrentLesson({...currentLesson, content: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {currentLesson.type === 'audio' && (
                      <div>
                        <label className="text-sm font-medium">Audio URL or Upload</label>
                        <div className="space-y-3">
                          {currentLesson.content && (
                            <div className="p-3 border rounded-lg bg-gray-50">
                              <p className="text-sm text-gray-600">Audio file selected</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentLesson({...currentLesson, content: ""})}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          )}
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                if (!file.type.startsWith('audio/')) {
                                  toast({
                                    title: "Invalid file type",
                                    description: "Please select an audio file",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                if (file.size > 50 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Please select an audio file smaller than 50MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                const formData = new FormData();
                                formData.append('audio', file);
                                
                                try {
                                  const response = await fetch('/api/upload/audio', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (!response.ok) throw new Error('Upload failed');
                                  
                                  const data = await response.json();
                                  setCurrentLesson({...currentLesson, content: data.url});
                                  
                                  toast({
                                    title: "Audio uploaded successfully",
                                    description: "Your audio file has been uploaded",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Upload failed",
                                    description: "There was an error uploading your audio file",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="hidden"
                              id="audio-upload"
                            />
                            <label htmlFor="audio-upload" className="cursor-pointer">
                              <AudioLines className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm font-medium">Click to upload audio</p>
                              <p className="text-xs text-gray-500">MP3, WAV, OGG up to 50MB</p>
                            </label>
                          </div>
                          
                          <div className="text-center text-sm text-gray-500">or</div>
                          
                          <Input
                            placeholder="Enter audio URL (SoundCloud, etc.)"
                            value={currentLesson.content}
                            onChange={(e) => setCurrentLesson({...currentLesson, content: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {currentLesson.type === 'text' && (
                      <div>
                        <label className="text-sm font-medium">Text Content or PDF Upload</label>
                        <div className="space-y-3">
                          {currentLesson.content && currentLesson.content.startsWith('/uploads/') && (
                            <div className="p-3 border rounded-lg bg-gray-50">
                              <p className="text-sm text-gray-600">PDF file uploaded</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentLesson({...currentLesson, content: ""})}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          )}
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                if (!allowedTypes.includes(file.type)) {
                                  toast({
                                    title: "Invalid file type",
                                    description: "Please select a PDF or Word document",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                if (file.size > 10 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Please select a file smaller than 10MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                const formData = new FormData();
                                formData.append('document', file);
                                
                                try {
                                  const response = await fetch('/api/upload/document', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (!response.ok) throw new Error('Upload failed');
                                  
                                  const data = await response.json();
                                  setCurrentLesson({...currentLesson, content: data.url});
                                  
                                  toast({
                                    title: "Document uploaded successfully",
                                    description: "Your document has been uploaded",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Upload failed",
                                    description: "There was an error uploading your document",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="hidden"
                              id="document-upload"
                            />
                            <label htmlFor="document-upload" className="cursor-pointer">
                              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm font-medium">Click to upload document</p>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                            </label>
                          </div>
                          
                          <div className="text-center text-sm text-gray-500">or</div>
                          
                          <Textarea
                            placeholder="Write your lesson content here..."
                            value={currentLesson.content}
                            onChange={(e) => setCurrentLesson({...currentLesson, content: e.target.value})}
                            className="min-h-32"
                          />
                        </div>
                      </div>
                    )}

                    {currentLesson.type === 'quiz' && (
                      <div className="space-y-4">
                        <label className="text-sm font-medium">Quiz Questions</label>
                        
                        {/* Display existing questions */}
                        {quizQuestions.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Questions ({quizQuestions.length})</h4>
                            {quizQuestions.map((q, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium">Q{index + 1}: {q.question}</p>
                                    <div className="mt-2 space-y-1">
                                      {q.options.map((option: string, optIndex: number) => (
                                        <div key={optIndex} className={`text-sm ${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                          {String.fromCharCode(65 + optIndex)}. {option} {optIndex === q.correctAnswer && '✓'}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new question form */}
                        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium">Add Question</h4>
                          
                          <div>
                            <label className="text-sm font-medium">Question</label>
                            <Input
                              placeholder="Enter your question"
                              value={currentQuestion.question}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Answer Options</label>
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-sm font-medium w-8">{String.fromCharCode(65 + index)}.</span>
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...currentQuestion.options];
                                    newOptions[index] = e.target.value;
                                    setCurrentQuestion({...currentQuestion, options: newOptions});
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                                >
                                  {currentQuestion.correctAnswer === index ? "Correct" : "Mark Correct"}
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            onClick={() => {
                              if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
                                toast({
                                  title: "Incomplete question",
                                  description: "Please fill in the question and all answer options",
                                  variant: "destructive",
                                });
                                return;
                              }

                              setQuizQuestions([...quizQuestions, {...currentQuestion, id: Date.now()}]);
                              setCurrentQuestion({
                                question: "",
                                options: ["", "", "", ""],
                                correctAnswer: 0
                              });

                              toast({
                                title: "Question added",
                                description: "Your quiz question has been added",
                              });
                            }}
                            disabled={!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={() => {
                        if (!currentLesson.title || !currentLesson.type) {
                          toast({
                            title: "Missing information",
                            description: "Please provide a title and select a lesson type",
                            variant: "destructive",
                          });
                          return;
                        }

                        // For quiz lessons, check if we have questions
                        if (currentLesson.type === 'quiz' && quizQuestions.length === 0) {
                          toast({
                            title: "Quiz incomplete",
                            description: "Please add at least one question to your quiz",
                            variant: "destructive",
                          });
                          return;
                        }

                        const lessonData = {
                          ...currentLesson,
                          id: Date.now(),
                          // For quiz lessons, store the questions as content
                          content: currentLesson.type === 'quiz' ? JSON.stringify(quizQuestions) : currentLesson.content
                        };

                        setLessons([...lessons, lessonData]);
                        
                        // Reset form
                        setCurrentLesson({
                          title: "",
                          type: "",
                          content: "",
                          duration: 5
                        });
                        
                        // Reset quiz questions if it was a quiz
                        if (currentLesson.type === 'quiz') {
                          setQuizQuestions([]);
                        }

                        toast({
                          title: "Lesson added",
                          description: "Your lesson has been added to the course",
                        });
                      }}
                      disabled={!currentLesson.title || !currentLesson.type || (currentLesson.type === 'quiz' && quizQuestions.length === 0)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("publish")}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Review & Publish Tab */}
            <TabsContent value="publish" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Publish</CardTitle>
                  <CardDescription>
                    Review your course details and choose whether to publish now or save as draft
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Course Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                          <p>{form.watch("title") || "No title provided"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                          <p>{form.watch("duration") || 0} minutes</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {form.watch("tags")?.length ? (
                              form.watch("tags")?.map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No tags added</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                          <p className="text-sm">
                            {form.watch("description") || "No description provided"}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Image URL</h4>
                          <p className="text-sm break-all">
                            {form.watch("imageUrl") || "No image URL provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Publication Status</FormLabel>
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
                                  Save as Draft
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="published" id="published" />
                                <label
                                  htmlFor="published"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Publish Now
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            {field.value === "draft" 
                              ? "Your course will be saved but not visible to students. You can publish it later."
                              : "Your course will be immediately available to students."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : form.watch("status") === "published" ? "Publish Course" : "Save as Draft"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}