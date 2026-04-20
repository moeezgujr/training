import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
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
import { PrerequisiteManager } from "@/components/PrerequisiteManager";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  PlayCircle,
  ArrowLeft,
  Loader2
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

// Component for selecting prerequisites for new lessons
interface LessonPrerequisiteSelectorProps {
  courseId: string;
  currentModuleId: string;
  onPrerequisitesChange: (prerequisites: string[]) => void;
  selectedPrerequisites: string[];
}

function LessonPrerequisiteSelector({ 
  courseId, 
  currentModuleId, 
  onPrerequisitesChange, 
  selectedPrerequisites 
}: LessonPrerequisiteSelectorProps) {
  // Get available lessons from course data
  const { data: course } = useQuery({
    queryKey: [`/api/instructor/courses/${courseId}`],
    enabled: !!courseId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  const availableLessons = course?.modules?.flatMap((module: any) => 
    module.content?.filter((lesson: any) => 
      lesson.type !== 'quiz' && 
      !lesson.id.startsWith('temp-') &&
      lesson.moduleId !== currentModuleId // Don't show lessons from the same module
    ) || []
  ) || [];

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
      {availableLessons.map((lesson: any) => (
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

// Main Course Builder Component
export default function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState<Module[]>([]);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
  const { toast } = useToast();

  // Form instances
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

  // Fetch course data
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/instructor/courses/${courseId}`],
    enabled: !!courseId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  // Load modules when course data is available
  useEffect(() => {
    if (course?.modules) {
      const formattedModules = course.modules.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.content?.map((content: any) => ({
          id: content.id,
          moduleId: module.id,
          title: content.title,
          type: content.type,
          url: content.url,
          description: content.description,
          order: content.order,
          duration: content.duration,
        })) || [],
      }));
      setModules(formattedModules);
    }
  }, [course]);

  // Save modules mutation
  const saveModulesMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const response = await apiRequest("POST", `/api/instructor/courses/${courseId}/modules`, moduleData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course structure saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/instructor/courses/${courseId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save course structure. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // File upload handler
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
      return result.url;
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

    // Handle file upload for non-quiz lessons
    if (data.type !== 'quiz' && selectedFile) {
      lessonUrl = await handleFileUpload(selectedFile, data.type);
      if (!lessonUrl) return; // Upload failed
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
        duration: data.duration,
      };
      
      const updatedModules = [...modules];
      updatedModules[moduleIndex].lessons.push(newLesson);
      setModules(updatedModules);
    }

    setIsLessonDialogOpen(false);
    setEditingLesson(null);
    setSelectedFile(null);
    setSelectedPrerequisites([]);
    lessonForm.reset();
    
    // If this was a new lesson and we have prerequisites selected, 
    // we'll need to save them after the lesson is saved to the backend
    if (!editingLesson && selectedPrerequisites.length > 0) {
      // Store prerequisites to be applied when the lesson is saved to backend
      // This will be handled in the saveAllModules function
    }
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
    const moduleData = {
      modules: modules.map(module => ({
        ...module,
        lessons: module.lessons
      }))
    };
    saveModulesMutation.mutate(moduleData);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/instructor/courses')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Course Builder</h1>
              <p className="text-gray-600">
                {course?.title ? `Building: ${course.title}` : "Organize your course into modules and lessons"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsModuleDialogOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
            <Button 
              onClick={saveAllModules} 
              disabled={saveModulesMutation.isPending}
            >
              {saveModulesMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Structure
            </Button>
          </div>
        </div>

        {/* Course Info */}
        {course && (
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Modules</p>
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
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Edit Lesson" : "Add New Lesson"}
              </DialogTitle>
              <DialogDescription>
                {editingLesson 
                  ? "Update the lesson details below."
                  : "Create a new lesson for this module."}
              </DialogDescription>
            </DialogHeader>
            <Form {...lessonForm}>
              <form 
                onSubmit={lessonForm.handleSubmit(saveLesson)}
                className="space-y-4"
              >
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
                      type={lessonForm.watch("type")}
                      onFileSelect={setSelectedFile}
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}

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
                
                {/* Lesson Prerequisites */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Lesson Prerequisites</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Set which other lessons students must complete before accessing this lesson.
                  </p>
                  
                  {editingLesson && !editingLesson.id.startsWith('temp-') ? (
                    <PrerequisiteManager
                      type="lesson"
                      itemId={editingLesson.id}
                      itemTitle={editingLesson.title}
                    />
                  ) : (
                    <LessonPrerequisiteSelector 
                      courseId={courseId}
                      currentModuleId={currentModuleId}
                      onPrerequisitesChange={(prerequisites) => {
                        // Store prerequisites temporarily for new lessons
                        setSelectedPrerequisites(prerequisites);
                      }}
                      selectedPrerequisites={selectedPrerequisites}
                    />
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsLessonDialogOpen(false);
                    setEditingLesson(null);
                    setSelectedPrerequisites([]);
                    setSelectedFile(null);
                    lessonForm.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
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
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}