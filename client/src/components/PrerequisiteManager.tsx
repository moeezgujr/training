import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface ModuleContent {
  id: string;
  title: string;
  type: string;
  moduleId: string;
}

interface PrerequisiteManagerProps {
  type: 'course' | 'lesson';
  itemId: string;
  itemTitle: string;
}

export function PrerequisiteManager({ type, itemId, itemTitle }: PrerequisiteManagerProps) {
  const [selectedPrerequisite, setSelectedPrerequisite] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing prerequisites
  const { data: prerequisites = [], isLoading: loadingPrerequisites } = useQuery({
    queryKey: [`/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites`);
      return response.json();
    }
  });

  // Fetch available items for prerequisites
  const { data: availableItems = [] } = useQuery({
    queryKey: [type === 'course' ? '/api/courses' : '/api/lessons'],
    queryFn: async () => {
      if (type === 'course') {
        const response = await apiRequest("GET", "/api/courses");
        const courses = await response.json();
        // Filter out current course and already selected prerequisites
        return courses.filter((course: Course) => 
          course.id !== itemId && 
          !prerequisites.some((prereq: Course) => prereq.id === course.id)
        );
      } else {
        // For lessons, we need to fetch all lessons from all courses
        const response = await apiRequest("GET", "/api/courses");
        const courses = await response.json();
        const allLessons: ModuleContent[] = [];
        
        for (const course of courses) {
          const courseResponse = await apiRequest("GET", `/api/courses/${course.id}`);
          const courseData = await courseResponse.json();
          if (courseData.modules) {
            courseData.modules.forEach((module: any) => {
              if (module.content) {
                module.content.forEach((content: ModuleContent) => {
                  allLessons.push({
                    ...content,
                    title: `${course.title} - ${module.title} - ${content.title}`
                  });
                });
              }
            });
          }
        }
        
        // Filter out current lesson and already selected prerequisites
        return allLessons.filter((lesson: ModuleContent) => 
          lesson.id !== itemId && 
          !prerequisites.some((prereq: ModuleContent) => prereq.id === lesson.id)
        );
      }
    },
    enabled: !loadingPrerequisites
  });

  // Add prerequisite mutation
  const addPrerequisiteMutation = useMutation({
    mutationFn: async (prerequisiteId: string) => {
      const response = await apiRequest("POST", `/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites`, {
        [type === 'course' ? 'prerequisiteCourseId' : 'prerequisiteLessonId']: prerequisiteId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prerequisite added successfully"
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [type === 'course' ? '/api/courses' : '/api/lessons'] 
      });
      setSelectedPrerequisite("");
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to add prerequisite",
        variant: "destructive"
      });
    }
  });

  // Remove prerequisite mutation
  const removePrerequisiteMutation = useMutation({
    mutationFn: async (prerequisiteId: string) => {
      const response = await apiRequest("DELETE", `/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites/${prerequisiteId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prerequisite removed successfully"
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/prerequisites`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [type === 'course' ? '/api/courses' : '/api/lessons'] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove prerequisite",
        variant: "destructive"
      });
    }
  });

  const handleAddPrerequisite = () => {
    if (selectedPrerequisite) {
      addPrerequisiteMutation.mutate(selectedPrerequisite);
    }
  };

  const handleRemovePrerequisite = (prerequisiteId: string) => {
    removePrerequisiteMutation.mutate(prerequisiteId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Prerequisites for {itemTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Prerequisites */}
        <div>
          <h4 className="font-medium mb-2">Current Prerequisites</h4>
          {prerequisites.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Unlock className="h-4 w-4" />
              <span>No prerequisites - accessible to all users</span>
            </div>
          ) : (
            <div className="space-y-2">
              {prerequisites.map((prereq: Course | ModuleContent) => (
                <div key={prereq.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{prereq.title}</span>
                    <Badge variant="secondary">Required</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePrerequisite(prereq.id)}
                    disabled={removePrerequisiteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Prerequisite */}
        <div>
          <h4 className="font-medium mb-2">Add New Prerequisite</h4>
          <div className="flex gap-2">
            <Select value={selectedPrerequisite} onValueChange={setSelectedPrerequisite}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`Select a ${type} to require...`} />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item: Course | ModuleContent) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddPrerequisite}
              disabled={!selectedPrerequisite || addPrerequisiteMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Users must complete all prerequisite {type === 'course' ? 'courses' : 'lessons'} 
            before they can access this {type}. Prerequisites will show lock icons in the interface.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}