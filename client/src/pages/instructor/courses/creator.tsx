import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2, 
  Video, 
  Volume2, 
  FileText, 
  HelpCircle,
  Upload,
  Save,
  BookOpen,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CheckCircle
} from "lucide-react";

// Types
interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'quiz';
  url?: string;
  description?: string;
  order: number;
  duration?: number;
}

// Validation schemas
const courseSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters"),
  description: z.string().min(20, "Course description must be at least 20 characters"),
  imageUrl: z.string().min(1, "Please upload a course image"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  tags: z.array(z.string()).optional(),
});

const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  description: z.string().min(1, "Module description is required"),
});

const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  type: z.enum(['video', 'audio', 'pdf', 'quiz']),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
});

// Sortable Lesson Component
function SortableLesson({ 
  lesson, 
  onEdit, 
  onDelete, 
  getTypeIcon 
}: {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  getTypeIcon: (type: string) => JSX.Element;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          {getTypeIcon(lesson.type)}
          <Badge variant="secondary" className="text-xs">
            {lesson.type}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium">{lesson.title}</h4>
          {lesson.description && (
            <p className="text-sm text-gray-600">{lesson.description}</p>
          )}
          {lesson.duration && (
            <p className="text-xs text-gray-500">{lesson.duration} minutes</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Module Component
function SortableModule({ 
  module, 
  onEditModule, 
  onDeleteModule, 
  onAddLesson, 
  onEditLesson, 
  onDeleteLesson,
  onReorderLessons 
}: {
  module: Module;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessons: Lesson[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = module.lessons.findIndex((lesson) => lesson.id === over.id);
      
      const reorderedLessons = arrayMove(module.lessons, oldIndex, newIndex).map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));
      
      onReorderLessons(module.id, reorderedLessons);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'audio': return <Volume2 className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'quiz': return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{module.lessons.length} lessons</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddLesson(module.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditModule(module)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteModule(module.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleLessonDragEnd}
        >
          <SortableContext items={module.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {module.lessons.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No lessons yet. Add your first lesson!</p>
                  <Button 
                    variant="ghost" 
                    className="mt-2"
                    onClick={() => onAddLesson(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lesson
                  </Button>
                </div>
              ) : (
                module.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                    <div className="flex-1">
                      <SortableLesson
                        lesson={lesson}
                        onEdit={() => onEditLesson(lesson)}
                        onDelete={() => onDeleteLesson(lesson.id)}
                        getTypeIcon={getTypeIcon}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

// File Upload Component
// Lesson prerequisite selector component
function LessonPrerequisiteSelector({ 
  modules, 
  currentModuleId, 
  onPrerequisitesChange, 
  selectedPrerequisites 
}: {
  modules: Module[];
  currentModuleId: string;
  onPrerequisitesChange: (prerequisites: string[]) => void;
  selectedPrerequisites: string[];
}) {
  // Get available lessons from other modules
  const availableLessons = modules
    .filter(module => module.id !== currentModuleId)
    .flatMap(module => module.lessons || [])
    .filter(lesson => lesson.type !== 'quiz' && !lesson.id.startsWith('temp-'));

  const handleLessonToggle = (lessonId: string, checked: boolean) => {
    if (checked) {
      onPrerequisitesChange([...selectedPrerequisites, lessonId]);
    } else {
      onPrerequisitesChange(selectedPrerequisites.filter(id => id !== lessonId));
    }
  };

  if (!availableLessons.length) {
    return (
      <div className="text-sm text-gray-500 italic">
        No existing lessons available as prerequisites. Create and save other lessons first.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {availableLessons.map((lesson: Lesson) => (
        <div key={lesson.id} className="flex items-center space-x-2">
          <Checkbox
            id={`prereq-${lesson.id}`}
            checked={selectedPrerequisites.includes(lesson.id)}
            onCheckedChange={(checked) => handleLessonToggle(lesson.id, checked as boolean)}
          />
          <label
            htmlFor={`prereq-${lesson.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {lesson.title}
          </label>
        </div>
      ))}
    </div>
  );
}

function FileUploadField({ 
  type, 
  onFileSelect 
}: { 
  type: 'video' | 'audio' | 'pdf'; 
  onFileSelect: (file: File) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'pdf': return 'application/pdf';
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      <input
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileChange}
        className="hidden"
        id={`file-upload-${type}`}
      />
      <label htmlFor={`file-upload-${type}`} className="cursor-pointer">
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Click to upload {type} file
        </p>
      </label>
    </div>
  );
}

// Main Course Creator Component
export default function CourseCreator() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courseImageUrl, setCourseImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "multiple_choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 1,
  });
  const { toast } = useToast();

  // Form instances
  const courseForm = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      duration: 60,
      tags: [],
    },
  });

  const moduleForm = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const lessonForm = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      type: "video" as const,
      description: "",
      duration: undefined,
    },
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await apiRequest("POST", "/api/instructor/courses", courseData);
      return await response.json();
    },
    onSuccess: (response: any) => {
      console.log("Course creation response:", response);
      console.log("Response structure:", JSON.stringify(response, null, 2));
      console.log("Response ID:", response?.id);
      
      setCourseData(response);
      setCurrentStep(2);
      toast({
        title: "Success",
        description: "Course created successfully! Now add your modules and lessons.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save modules mutation
  const saveModulesMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      console.log("=== SAVE MODULES DEBUG ===");
      console.log("Current courseData:", courseData);
      console.log("Course ID:", courseData?.id);
      console.log("Current step:", currentStep);
      
      if (!courseData || !courseData.id) {
        throw new Error("No course found. Please create the course first before adding modules.");
      }
      
      console.log("Making API request to:", `/api/instructor/courses/${courseData.id}/modules`);
      const response = await apiRequest("POST", `/api/instructor/courses/${courseData.id}/modules`, moduleData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course structure saved successfully!",
      });
      setLocation('/instructor');
    },
    onError: (error: any) => {
      console.error("Frontend save error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save course structure. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Publish course mutation
  const publishCourseMutation = useMutation({
    mutationFn: async () => {
      if (!courseData?.id) throw new Error("No course ID");
      await apiRequest("PATCH", `/api/instructor/courses/${courseData.id}/publish`);
    },
    onSuccess: () => {
      toast({
        title: "Course Published!",
        description: "Your course is now live and available to students.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instructor/courses'] });
      setLocation('/instructor');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish course.",
        variant: "destructive",
      });
    },
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setCourseImageUrl(result.url);
      courseForm.setValue('imageUrl', result.url);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Step 1: Create course
  const onSubmitCourse = async (data: any) => {
    createCourseMutation.mutate({
      ...data,
      status: 'draft',
    });
  };

  // Handle module drag end
  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModules((modules) => {
        const oldIndex = modules.findIndex((module) => module.id === active.id);
        const newIndex = modules.findIndex((module) => module.id === over.id);
        
        return arrayMove(modules, oldIndex, newIndex).map((module, index) => ({
          ...module,
          order: index + 1
        }));
      });
    }
  };

  // Module operations
  const addModule = (data: { title: string; description: string }) => {
    const newModule: Module = {
      id: `temp-module-${Date.now()}`,
      title: data.title,
      description: data.description,
      order: modules.length + 1,
      lessons: [],
    };
    setModules([...modules, newModule]);
    setIsModuleDialogOpen(false);
    moduleForm.reset();
  };

  const editModule = (module: Module) => {
    setEditingModule(module);
    moduleForm.setValue("title", module.title);
    moduleForm.setValue("description", module.description);
    setIsModuleDialogOpen(true);
  };

  const updateModule = (data: { title: string; description: string }) => {
    if (!editingModule) return;
    
    setModules(modules.map(module => 
      module.id === editingModule.id 
        ? { ...module, title: data.title, description: data.description }
        : module
    ));
    setIsModuleDialogOpen(false);
    setEditingModule(null);
    moduleForm.reset();
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
  };

  // Lesson operations
  const addLesson = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setEditingLesson(null);
    setSelectedFile(null);
    lessonForm.reset();
    setIsLessonDialogOpen(true);
  };

  const editLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCurrentModuleId(lesson.moduleId);
    lessonForm.setValue("title", lesson.title);
    lessonForm.setValue("type", lesson.type);
    lessonForm.setValue("description", lesson.description || "");
    lessonForm.setValue("duration", lesson.duration);
    setIsLessonDialogOpen(true);
  };

  // File upload handler with automatic duration calculation
  const handleFileUpload = async (file: File, type: 'video' | 'audio' | 'pdf') => {
    setUploading(true);
    try {
      const formData = new FormData();
      const fieldName = type === 'pdf' ? 'document' : type;
      formData.append(fieldName, file);

      const endpoint = type === 'pdf' ? '/api/upload/document' : `/api/upload/${type}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return {
        url: result.url,
        duration: result.duration,
        durationMethod: result.durationMethod
      };
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveLesson = async (data: { title: string; type: 'video' | 'audio' | 'pdf' | 'quiz'; description?: string; duration?: number }) => {
    const moduleIndex = modules.findIndex(m => m.id === currentModuleId);
    if (moduleIndex === -1) return;

    let lessonUrl = undefined;
    let calculatedDuration = data.duration;

    // Handle file upload for non-quiz lessons
    if (data.type !== 'quiz' && selectedFile) {
      const uploadResult = await handleFileUpload(selectedFile, data.type);
      if (!uploadResult) return; // Upload failed
      
      lessonUrl = uploadResult.url;
      // Use calculated duration from upload if available, otherwise use manual input
      if (uploadResult.duration) {
        calculatedDuration = uploadResult.duration;
        
        // Show toast to inform user about automatic duration calculation
        toast({
          title: "Duration Calculated",
          description: `Lesson duration automatically set to ${uploadResult.duration} minutes based on ${data.type} content.`,
        });
      }
    }

    if (editingLesson) {
      // Update existing lesson
      const updatedModules = [...modules];
      const lessonIndex = updatedModules[moduleIndex].lessons.findIndex(l => l.id === editingLesson.id);
      if (lessonIndex !== -1) {
        updatedModules[moduleIndex].lessons[lessonIndex] = {
          ...editingLesson,
          ...data,
          url: lessonUrl || editingLesson.url,
          duration: calculatedDuration,
        };
        setModules(updatedModules);
      }
    } else {
      // Add new lesson
      const newLesson: Lesson = {
        id: `temp-lesson-${Date.now()}`,
        moduleId: currentModuleId,
        title: data.title,
        type: data.type,
        url: lessonUrl,
        description: data.description,
        order: modules[moduleIndex].lessons.length + 1,
        duration: calculatedDuration,
      };
      
      const updatedModules = [...modules];
      updatedModules[moduleIndex].lessons.push(newLesson);
      setModules(updatedModules);
    }

    setIsLessonDialogOpen(false);
    setEditingLesson(null);
    setSelectedFile(null);
    lessonForm.reset();
  };

  const deleteLesson = (lessonId: string) => {
    setModules(modules.map(module => ({
      ...module,
      lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
        .map((lesson, index) => ({ ...lesson, order: index + 1 }))
    })));
  };

  const reorderLessons = (moduleId: string, reorderedLessons: Lesson[]) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lessons: reorderedLessons }
        : module
    ));
  };

  // Save all modules
  const saveAllModules = () => {
    console.log("=== FRONTEND SAVE DEBUG START ===");
    console.log("Modules array:", modules);
    console.log("Modules length:", modules.length);
    console.log("Course data:", courseData);
    
    const moduleData = {
      modules: modules.map(module => ({
        ...module,
        lessons: module.lessons
      }))
    };
    
    console.log("Module data being sent:", JSON.stringify(moduleData, null, 2));
    console.log("=== CALLING MUTATION ===");
    saveModulesMutation.mutate(moduleData);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/instructor')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="text-gray-600">
                {currentStep === 1 ? "Set up your course details" : "Build your course structure with modules and lessons"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
              {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span className="font-medium">Course Details</span>
          </div>
          <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
              2
            </div>
            <span className="font-medium">Course Structure</span>
          </div>
        </div>

        {/* Step 1: Course Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Provide the basic details for your course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={courseForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Complete React Development Course" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={courseForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 120" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FormLabel>Course Image</FormLabel>
                        <div className="mt-2">
                          {courseImageUrl ? (
                            <div className="relative">
                              <img 
                                src={courseImageUrl} 
                                alt="Course" 
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setCourseImageUrl("");
                                  courseForm.setValue('imageUrl', '');
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="course-image-upload"
                                disabled={uploadingImage}
                              />
                              <label htmlFor="course-image-upload" className="cursor-pointer">
                                {uploadingImage ? (
                                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                                ) : (
                                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                )}
                                <p className="text-sm text-gray-600">
                                  {uploadingImage ? "Uploading..." : "Click to upload course image"}
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={createCourseMutation.isPending || !courseImageUrl}
                    >
                      {createCourseMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Course...
                        </>
                      ) : (
                        <>
                          Continue to Course Structure
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Course Structure */}
        {currentStep === 2 && courseData && (
          <div className="space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="text-lg font-medium">{courseData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold">
                      {modules.reduce((total, module) => total + module.lessons.length, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                </div>
                
                {/* Debug Information */}
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
                  Debug: Course ID: {courseData?.id || 'MISSING'} | Modules: {modules.length} | 
                  Can Save: {!(!courseData?.id || modules.length === 0) ? 'YES' : 'NO'} | 
                  Step: {currentStep}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button onClick={() => setIsModuleDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={saveAllModules} 
                  disabled={saveModulesMutation.isPending || modules.length === 0 || !courseData?.id}
                  variant="outline"
                  title={!courseData?.id ? "Course ID missing" : modules.length === 0 ? "Add modules first" : "Save course structure"}
                >
                  {saveModulesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Course
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    console.log("Publish button clicked. Current state:", {
                      courseData,
                      courseId: courseData?.id,
                      modulesLength: modules.length,
                      isPending: publishCourseMutation.isPending
                    });
                    publishCourseMutation.mutate();
                  }} 
                  disabled={publishCourseMutation.isPending || modules.length === 0 || !courseData?.id}
                  variant="default"
                  title={!courseData?.id ? "Course ID missing" : modules.length === 0 ? "Add modules first" : "Publish course"}
                >
                  {publishCourseMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish Course
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Modules List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleModuleDragEnd}
            >
              <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {modules.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No modules yet</h3>
                        <p className="text-gray-600 mb-4">Create your first module to get started</p>
                        <Button onClick={() => setIsModuleDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Module
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    modules.map((module, index) => (
                      <div key={module.id} className="relative">
                        <div className="absolute -left-8 top-4 text-lg font-bold text-gray-300">
                          {index + 1}
                        </div>
                        <SortableModule
                          module={module}
                          onEditModule={editModule}
                          onDeleteModule={deleteModule}
                          onAddLesson={addLesson}
                          onEditLesson={editLesson}
                          onDeleteLesson={deleteLesson}
                          onReorderLessons={reorderLessons}
                        />
                      </div>
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Module Dialog */}
        <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Edit Module" : "Add New Module"}
              </DialogTitle>
              <DialogDescription>
                {editingModule 
                  ? "Update the module details below."
                  : "Create a new module for your course."}
              </DialogDescription>
            </DialogHeader>
            <Form {...moduleForm}>
              <form 
                onSubmit={moduleForm.handleSubmit(editingModule ? updateModule : addModule)}
                className="space-y-4"
              >
                <FormField
                  control={moduleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Introduction to React" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of what this module covers..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingModule ? "Update Module" : "Add Module"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </DialogTitle>
              <DialogDescription>
                {editingLesson 
                  ? "Update the lesson details below."
                  : "Create a new lesson for this module."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <Form {...lessonForm}>
                <form 
                  onSubmit={lessonForm.handleSubmit(saveLesson)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                <FormField
                  control={lessonForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Creating Your First Component" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lessonForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lesson type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              Video Lesson
                            </div>
                          </SelectItem>
                          <SelectItem value="audio">
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4 text-green-500" />
                              Audio Lesson
                            </div>
                          </SelectItem>
                          <SelectItem value="pdf">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-500" />
                              PDF Document
                            </div>
                          </SelectItem>
                          <SelectItem value="quiz">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-4 w-4 text-purple-500" />
                              Quiz
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload for non-quiz lessons */}
                {lessonForm.watch("type") !== "quiz" && (
                  <div>
                    <label className="text-sm font-medium">Upload File</label>
                    <FileUploadField 
                      type={lessonForm.watch("type") as 'video' | 'audio' | 'pdf'}
                      onFileSelect={setSelectedFile}
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Quiz Builder for quiz lessons */}
                {lessonForm.watch("type") === "quiz" && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Quiz Questions ({quizQuestions.length})</h4>
                      
                      {quizQuestions.map((question, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-50 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">Q{index + 1}: {question.question}</p>
                              <div className="text-sm text-gray-600 mt-1">
                                {question.type === "multiple_choice" && (
                                  <div>
                                    {question.options.map((option: string, optIndex: number) => (
                                      <div key={optIndex} className={optIndex === question.correctAnswer ? "font-medium text-green-600" : ""}>
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {question.type === "true_false" && (
                                  <div className="font-medium text-green-600">
                                    Answer: {question.correctAnswer ? "True" : "False"}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newQuestions = quizQuestions.filter((_, i) => i !== index);
                                setQuizQuestions(newQuestions);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">Add New Question</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Question Type</label>
                            <Select 
                              value={currentQuestion.type} 
                              onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Question</label>
                            <Textarea
                              placeholder="Enter your question..."
                              value={currentQuestion.question}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                            />
                          </div>

                          {currentQuestion.type === "multiple_choice" && (
                            <div>
                              <label className="text-sm font-medium">Answer Options</label>
                              {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
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
                          )}

                          {currentQuestion.type === "true_false" && (
                            <div>
                              <label className="text-sm font-medium">Correct Answer</label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={currentQuestion.correctAnswer === true ? "default" : "outline"}
                                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: true})}
                                >
                                  True
                                </Button>
                                <Button
                                  type="button"
                                  variant={currentQuestion.correctAnswer === false ? "default" : "outline"}
                                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: false})}
                                >
                                  False
                                </Button>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Explanation (Optional)</label>
                            <Textarea
                              placeholder="Explain the correct answer..."
                              value={currentQuestion.explanation}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                            />
                          </div>

                          <Button
                            type="button"
                            onClick={() => {
                              if (!currentQuestion.question.trim()) {
                                toast({
                                  title: "Error",
                                  description: "Please enter a question",
                                  variant: "destructive"
                                });
                                return;
                              }

                              if (currentQuestion.type === "multiple_choice") {
                                const filledOptions = currentQuestion.options.filter(opt => opt.trim());
                                if (filledOptions.length < 2) {
                                  toast({
                                    title: "Error", 
                                    description: "Please provide at least 2 answer options",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                              }

                              setQuizQuestions([...quizQuestions, currentQuestion]);
                              setCurrentQuestion({
                                type: "multiple_choice",
                                question: "",
                                options: ["", "", "", ""],
                                correctAnswer: 0,
                                explanation: "",
                                points: 1,
                              });
                              
                              toast({
                                title: "Question Added",
                                description: "Quiz question added successfully"
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Prerequisites */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Lesson Prerequisites</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Set which other lessons students must complete before accessing this lesson.
                  </p>
                  
                  <LessonPrerequisiteSelector 
                    modules={modules}
                    currentModuleId={currentModuleId}
                    onPrerequisitesChange={setSelectedPrerequisites}
                    selectedPrerequisites={selectedPrerequisites}
                  />
                </div>

                <FormField
                  control={lessonForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of this lesson..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lessonForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes, optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 15" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  </div>
                </form>
              </Form>
            </div>
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => {
                setIsLessonDialogOpen(false);
                setEditingLesson(null);
                setSelectedPrerequisites([]);
                setSelectedFile(null);
                setQuizQuestions([]);
                setCurrentQuestion({
                  type: "multiple_choice",
                  question: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                  explanation: "",
                  points: 1,
                });
                lessonForm.reset();
              }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploading}
                onClick={lessonForm.handleSubmit(saveLesson)}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  editingLesson ? "Update Lesson" : "Add Lesson"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}