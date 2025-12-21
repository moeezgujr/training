import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Image as ImageIcon, ArrowRight, ArrowLeft, Check, BookOpen, Settings, FileImage } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  imageUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  imageFile: z.any().optional(),
  previewVideoUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  duration: z.number().min(1, {
    message: "Duration must be at least 1 hour.",
  }),
  tags: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface Module {
  title: string;
  description: string;
  order: number;
}

export default function AddCoursePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  
  // Check if user is admin or instructor
  const isAuthorized = user?.role === "admin" || user?.role === "instructor";
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      previewVideoUrl: "",
      duration: 1,
      tags: "",
    },
  });
  
  // Add Course mutation (step 3)
  const addCourseMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== Course Creation Started ===");
      console.log("Form values:", values);
      console.log("Selected file:", selectedFile);
      console.log("User role:", user?.role);
      
      let finalImageUrl = values.imageUrl;
      
      // Upload image if file is selected (check if it's a proper File object)
      if (selectedFile && selectedFile instanceof File) {
        console.log("Uploading image file...");
        const formData = new FormData();
        formData.append("image", selectedFile); // Changed from "file" to "image"
        
        try {
          const uploadResponse = await fetch("/api/upload/image", { // Changed from /api/upload to /api/upload/image
            method: "POST",
            body: formData,
            credentials: "include", // Add credentials for auth
          });
          
          if (!uploadResponse.ok) {
            console.error("Image upload failed with status:", uploadResponse.status);
            throw new Error("Failed to upload image");
          }
          
          const uploadData = await uploadResponse.json();
          console.log("Image uploaded successfully:", uploadData);
          finalImageUrl = uploadData.url;
        } catch (error) {
          console.error("Image upload error:", error);
          throw new Error("Failed to upload image: " + (error instanceof Error ? error.message : String(error)));
        }
      } else {
        console.log("No valid file selected, using imageUrl:", values.imageUrl);
      }
      
      // Use admin endpoint if user is admin, otherwise use instructor endpoint
      const endpoint = user?.role === "admin" ? "/api/admin/courses" : "/api/instructor/courses";
      console.log("Using endpoint:", endpoint);
      
      const courseData = {
        title: values.title,
        description: values.description,
        imageUrl: finalImageUrl,
        previewVideoUrl: values.previewVideoUrl || null,
        duration: values.duration,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: "draft",
      };
      console.log("Course data to send:", courseData);
      
      console.log("Making POST request to:", endpoint);
      
      try {
        const response = await apiRequest("POST", endpoint, courseData);
        console.log("Response received:", response);
        
        if (!response.ok) {
          console.error("Response not ok:", response.status, response.statusText);
          const errorText = await response.text();
          console.error("Error response body:", errorText);
          throw new Error(`Failed to create course: ${response.status} ${response.statusText}`);
        }
        
        console.log("Parsing response JSON...");
        const data = await response.json();
        console.log("Course created successfully:", data);
        return data;
      } catch (error) {
        console.error("Course creation error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to create course: " + String(error));
      }
    },
    onSuccess: (data) => {
      setCreatedCourseId(data.id);
      // Move to step 4 to add modules
      setCurrentStep(4);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Course",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add modules mutation (step 4)
  const addModulesMutation = useMutation({
    mutationFn: async () => {
      if (!createdCourseId) throw new Error("No course created");
      
      // Convert modules to the format expected by the server
      const modulesData = modules.map((module, index) => ({
        id: `temp-module-${index + 1}`,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: [] // No lessons yet, will be added later
      }));
      
      console.log("Sending modules to server:", modulesData);
      
      // Send all modules in one request
      const response = await apiRequest("POST", `/api/instructor/courses/${createdCourseId}/modules`, {
        modules: modulesData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save modules:", errorText);
        throw new Error("Failed to save modules");
      }
      
      return createdCourseId;
    },
    onSuccess: (courseId) => {
      toast({
        title: "Course Created Successfully!",
        description: `Course created with ${modules.length} module${modules.length !== 1 ? 's' : ''}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setLocation(`/admin/courses/${courseId}/edit`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Modules",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("imageUrl", ""); // Clear URL if file is selected
    }
  };
  
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setSelectedFile(null);
    setImagePreview(url);
  };
  
  async function onSubmit(values: FormValues) {
    console.log("=== onSubmit called ===");
    console.log("Form values:", values);
    console.log("Current step:", currentStep);
    
    // Final validation for step 3
    console.log("Triggering validation for duration and tags...");
    const isValid = await form.trigger(["duration", "tags"]);
    console.log("Validation result:", isValid);
    
    if (!isValid) {
      console.log("Validation failed, showing errors:", form.formState.errors);
      return;
    }
    
    // Ensure we have an image (check if selectedFile is a proper File object)
    const hasValidFile = selectedFile && selectedFile instanceof File;
    const hasValidUrl = values.imageUrl && values.imageUrl.trim().length > 0;
    
    console.log("Checking image:", { 
      selectedFile, 
      hasValidFile,
      imageUrl: values.imageUrl,
      hasValidUrl 
    });
    
    if (!hasValidFile && !hasValidUrl) {
      console.log("No valid image provided, showing toast");
      toast({
        title: "Image Required",
        description: "Please upload an image file or provide a valid image URL",
        variant: "destructive",
      });
      return;
    }
    
    console.log("All validation passed, calling mutation...");
    addCourseMutation.mutate(values);
  }
  
  const addModule = () => {
    if (!newModuleTitle.trim() || !newModuleDescription.trim()) {
      toast({
        title: "Module Fields Required",
        description: "Please enter both title and description for the module",
        variant: "destructive",
      });
      return;
    }
    
    const newModule: Module = {
      title: newModuleTitle,
      description: newModuleDescription,
      order: modules.length + 1,
    };
    
    setModules([...modules, newModule]);
    setNewModuleTitle("");
    setNewModuleDescription("");
  };
  
  const removeModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    // Reorder remaining modules
    const reorderedModules = updatedModules.map((m, i) => ({ ...m, order: i + 1 }));
    setModules(reorderedModules);
  };
  
  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger(["title", "description"]);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      // Validate that either file is selected or URL is provided
      if (!selectedFile && !form.watch("imageUrl")) {
        toast({
          title: "Image Required",
          description: "Please upload an image or provide an image URL",
          variant: "destructive",
        });
        return;
      }
      // Validate URL format if URL is provided
      if (form.watch("imageUrl")) {
        const isValid = await form.trigger(["imageUrl"]);
        if (!isValid) return;
      }
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const finishCourse = () => {
    // If modules exist, create them; otherwise just redirect
    if (modules.length > 0) {
      addModulesMutation.mutate();
    } else {
      toast({
        title: "Course Created Successfully!",
        description: "You can add modules and content later.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setLocation(`/admin/courses/${createdCourseId}/edit`);
    }
  };
  
  // Redirect non-authorized users
  if (!isLoading && isAuthenticated && !isAuthorized) {
    setLocation("/");
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[70vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }
  
  const steps = [
    { id: 1, name: "Basic Information", icon: BookOpen },
    { id: 2, name: "Course Image", icon: FileImage },
    { id: 3, name: "Details & Tags", icon: Settings },
    { id: 4, name: "Add Modules", icon: BookOpen },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Create New Course
          </h1>
          <p className="text-gray-600">Follow the steps below to create your course</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step.id 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                          : 'bg-gray-200 text-gray-400'}
                    `}>
                      {currentStep > step.id ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 mb-6 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Step {currentStep} of {steps.length}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter the basic information about your course"}
              {currentStep === 2 && "Upload a cover image for your course"}
              {currentStep === 3 && "Add course duration and relevant tags"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Course Title *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Introduction to Psychology"
                              className="h-12 text-base"
                              data-testid="input-courseTitle"
                            />
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
                          <FormLabel className="text-lg">Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={6} 
                              placeholder="Provide a detailed description of what students will learn in this course..."
                              className="text-base resize-none"
                              data-testid="textarea-courseDescription"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 20 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Step 2: Course Image */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Image Upload */}
                      <div className="space-y-4">
                        <FormLabel className="text-lg">Upload Course Image</FormLabel>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                            data-testid="input-courseImageFile"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                              Click to upload course cover image
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG up to 10MB
                            </p>
                          </label>
                        </div>
                        {selectedFile && (
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            {selectedFile.name}
                          </p>
                        )}
                      </div>
                      
                      {/* OR Divider + Image URL */}
                      <div className="space-y-4">
                        <FormLabel className="text-lg">Or Use Image URL</FormLabel>
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="https://example.com/image.jpg"
                                  className="h-12"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleImageUrlChange(e.target.value);
                                  }}
                                  data-testid="input-courseImageUrl"
                                />
                              </FormControl>
                              <FormDescription>
                                Enter a direct URL to an image
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-6">
                        <FormLabel className="text-lg mb-3 block">Preview</FormLabel>
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-video bg-gray-100">
                          <img 
                            src={imagePreview} 
                            alt="Course preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 3: Details & Tags */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Course Duration (hours) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              className="h-12 text-base"
                              placeholder="e.g., 24"
                              data-testid="input-courseDuration"
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated time to complete the course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Course Tags *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Psychology, Mental Health, Therapy"
                              className="h-12 text-base"
                              data-testid="input-courseTags"
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated tags to help students find your course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="previewVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Course Introduction Video (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., https://www.youtube.com/embed/xxxxx or video file URL"
                              className="h-12 text-base"
                              data-testid="input-coursePreviewVideo"
                            />
                          </FormControl>
                          <FormDescription>
                            Add a preview/introduction video URL to showcase your course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Summary Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Course Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Title:</span>
                          <p className="text-gray-600">{form.watch("title") || "Not set"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span>
                          <p className="text-gray-600">{form.watch("duration")} hours</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tags:</span>
                          <p className="text-gray-600">{form.watch("tags") || "Not set"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Image:</span>
                          <p className="text-gray-600">
                            {selectedFile ? `File: ${selectedFile.name}` : 
                             form.watch("imageUrl") ? "URL provided" : "Not set"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Step 4: Add Modules (Optional) */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Course created successfully!</strong> You can now add modules to organize your course content, or skip this step and add them later.
                      </p>
                    </div>
                    
                    {/* Add New Module Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Add New Module</CardTitle>
                        <CardDescription>Create modules to organize your course content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Module Title *</label>
                          <Input
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="e.g., Introduction to Psychology"
                            className="h-11"
                            data-testid="input-moduleTitle"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Module Description *</label>
                          <Textarea
                            value={newModuleDescription}
                            onChange={(e) => setNewModuleDescription(e.target.value)}
                            placeholder="Describe what students will learn in this module..."
                            className="min-h-[100px]"
                            data-testid="input-moduleDescription"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addModule}
                          className="w-full"
                          variant="outline"
                          data-testid="button-addModule"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Add Module
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Module List */}
                    {modules.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Course Modules ({modules.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {modules.map((module, index) => (
                            <div
                              key={index}
                              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                              data-testid={`module-item-${index}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Module {module.order}
                                  </span>
                                  <h4 className="font-semibold text-gray-900">{module.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{module.description}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeModule(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-removeModule-${index}`}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 1 ? () => setLocation("/admin/courses") : (currentStep === 4 ? () => setLocation(`/admin/courses/${createdCourseId}/edit`) : prevStep)}
                    className="h-11 px-8"
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {currentStep === 1 ? "Cancel" : currentStep === 4 ? "Skip & Continue" : "Previous"}
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      data-testid="button-next"
                    >
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : currentStep === 3 ? (
                    <Button
                      type="submit"
                      disabled={addCourseMutation.isPending || !isAuthorized}
                      onClick={() => {
                        console.log("=== Button clicked ===");
                        console.log("Is authorized:", isAuthorized);
                        console.log("Is pending:", addCourseMutation.isPending);
                        console.log("User:", user);
                      }}
                      className="h-11 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      data-testid="button-createCourse"
                    >
                      {addCourseMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Create Course & Continue
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={finishCourse}
                      disabled={addModulesMutation.isPending}
                      className="h-11 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      data-testid="button-finishCourse"
                    >
                      {addModulesMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Finish Setup
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>After creating the course, you'll be able to add modules, lessons, and content</p>
        </div>
      </div>
    </div>
  );
}
