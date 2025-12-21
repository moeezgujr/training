import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Course, Module, Quiz, Assignment } from "@/lib/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { CourseProgressIndicator } from "@/components/course-progress-indicator";
import { QuizTaker } from "@/components/quiz/QuizTaker";
import { AssignmentSubmission } from "@/components/assignments/assignment-submission";
import { NoteTaking } from "@/components/course/note-taking";
import { AccessStatusIndicator, WithAccessControl } from "@/components/AccessStatusIndicator";
import { EnhancedAudioPlayer } from "@/components/EnhancedAudioPlayer";
import { PDFViewer } from "@/components/PDFViewer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  File,
  Video,
  FileAudio,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  ClipboardList,
  Play,
  CircleDashed,
  StickyNote
} from "lucide-react";

export default function CourseModuleViewer() {
  const { courseId, moduleId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("content");
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Get course and module data
  const { data: course, isLoading: isLoadingCourse, refetch } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Find the current module and all modules in the course
  const currentModule = course?.modules?.find((m: Module) => m.id === moduleId);
  const allModules = course?.modules || [];
  const currentModuleIndex = allModules.findIndex((m: Module) => m.id === moduleId);
  const prevModule = currentModuleIndex > 0 ? allModules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < allModules.length - 1 ? allModules[currentModuleIndex + 1] : null;
  
  // For content navigation within the module
  const moduleContent = currentModule?.content || [];
  const contentSorted = [...moduleContent].sort((a, b) => a.order - b.order);
  const quizzes = currentModule?.quizzes || [];
  const assignments = currentModule?.assignments || [];
  
  // Set the first content item as active by default
  useEffect(() => {
    if (contentSorted.length > 0 && !activeContentId) {
      setActiveContentId(contentSorted[0].id);
    }
  }, [contentSorted, activeContentId]);
  
  // Handle marking content as complete
  const markContentComplete = async (contentId: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}/complete`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark content as complete");
      }
      
      toast({
        title: "Progress saved",
        description: "Your progress has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = (result: any) => {
    if (result.passed) {
      toast({
        title: "Quiz passed!",
        description: `Congratulations! You scored ${result.score}% on this quiz.`,
      });
    } else {
      toast({
        title: "Quiz not passed",
        description: `You scored ${result.score}%. The passing score is ${result.passingScore}%. Try again.`,
        variant: "destructive",
      });
    }
  };
  
  // Handle assignment submission
  const handleAssignmentComplete = () => {
    toast({
      title: "Assignment submitted",
      description: "Your assignment has been submitted successfully.",
    });
  };
  
  // Loading state
  if (isLoadingCourse) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state - course not found
  if (!course) {
    return (
      <div className="container py-6">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Course Not Found"
          description="The course you're looking for doesn't exist or you don't have access to it."
          actionHref="/courses"
          actionText="Browse Courses"
        />
      </div>
    );
  }
  
  // Error state - module not found
  if (!currentModule) {
    return (
      <div className="container py-6">
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Module Not Found"
          description="The module you're looking for doesn't exist or has been removed."
          actionHref={`/courses/${courseId}`}
          actionText="Back to Course"
        />
      </div>
    );
  }
  
  // Get the active content item
  const activeContent = contentSorted.find((c) => c.id === activeContentId);
  
  // Helper function to get the current media time (for notes)
  const getCurrentMediaTime = (): number | undefined => {
    if (activeContent) {
      if (activeContent.type === "video" && videoRef.current) {
        return videoRef.current.currentTime;
      } else if (activeContent.type === "audio" && audioRef.current) {
        return audioRef.current.currentTime;
      }
    }
    return undefined;
  };

  // Helper function to render the content based on its type
  const renderContentItem = (content: any) => {
    if (!content) return null;
    
    switch (content.type) {
      case "video":
        return (
          <div className="aspect-video bg-black">
            <video
              ref={videoRef}
              src={content.url}
              controls
              className="w-full h-full"
              onEnded={() => markContentComplete(content.id)}
            />
          </div>
        );
        
      case "pdf":
      case "book":
        return (
          <div className="space-y-4">
            <PDFViewer url={content.url} title={content.title} />
            <div className="flex justify-end">
              <Button
                onClick={() => markContentComplete(content.id)}
                className="ml-auto"
                size="sm"
                data-testid="button-mark-complete"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          </div>
        );
        
      case "audio":
        const currentIndex = contentSorted.findIndex((c) => c.id === content.id);
        const previousContent = currentIndex > 0 ? contentSorted[currentIndex - 1] : null;
        const nextContent = currentIndex < contentSorted.length - 1 ? contentSorted[currentIndex + 1] : null;
        
        return (
          <EnhancedAudioPlayer
            audioUrl={content.url}
            lessonId={content.id}
            title={content.title}
            description={content.description}
            transcript={content.transcript ? JSON.parse(content.transcript) : []}
            onProgress={(progress) => {
              // Handle progress updates if needed
            }}
            onComplete={() => markContentComplete(content.id)}
            onPrevious={previousContent ? () => setActiveContentId(previousContent.id) : undefined}
            onNext={nextContent ? () => setActiveContentId(nextContent.id) : undefined}
            hasPrevious={!!previousContent}
            hasNext={!!nextContent}
          />
        );
        
      default:
        return (
          <div className="p-6 bg-muted rounded-lg text-center">
            <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>Unsupported content type</p>
          </div>
        );
    }
  };
  
  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <div className="space-y-6">
            {activeContent && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{activeContent.title}</h2>
                  {activeContent.description && (
                    <p className="text-muted-foreground">{activeContent.description}</p>
                  )}
                </div>
                
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {renderContentItem(activeContent)}
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = contentSorted.findIndex((c) => c.id === activeContentId);
                      if (currentIndex > 0) {
                        setActiveContentId(contentSorted[currentIndex - 1].id);
                      }
                    }}
                    disabled={contentSorted.findIndex((c) => c.id === activeContentId) === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentIndex = contentSorted.findIndex((c) => c.id === activeContentId);
                      if (currentIndex < contentSorted.length - 1) {
                        setActiveContentId(contentSorted[currentIndex + 1].id);
                      }
                    }}
                    disabled={contentSorted.findIndex((c) => c.id === activeContentId) === contentSorted.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        );
        
      case "quizzes":
        return (
          <div className="space-y-6">
            {quizzes.length === 0 ? (
              <EmptyState
                icon={<FileQuestion className="h-8 w-8" />}
                title="No Quizzes Available"
                description="There are no quizzes in this module yet."
                size="sm"
              />
            ) : (
              <div className="space-y-8">
                {quizzes.map((quiz: Quiz) => (
                  <div key={quiz.id} className="space-y-4">
                    <QuizTaker 
                      quiz={{ ...quiz, description: quiz.description || '' }} 
                      onComplete={(result) => {
                        toast({
                          title: result.passed ? "Quiz Passed!" : "Quiz Completed",
                          description: `You scored ${result.score}% on "${quiz.title}"`,
                          variant: result.passed ? "default" : "destructive"
                        });
                        // Refresh course data to update progress
                        refetch();
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case "assignments":
        return (
          <div className="space-y-6">
            {assignments.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-8 w-8" />}
                title="No Assignments Available"
                description="There are no assignments in this module yet."
                size="sm"
              />
            ) : (
              <div className="space-y-8">
                {assignments.map((assignment: Assignment) => (
                  <div key={assignment.id} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{assignment.title}</CardTitle>
                            <CardDescription>{assignment.description}</CardDescription>
                          </div>
                          {assignment.status === "graded" ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              <span className="font-medium">
                                {assignment.grade}% - Completed
                              </span>
                            </div>
                          ) : assignment.status === "submitted" ? (
                            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Submitted
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              {assignment.dueDate ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}` : "Pending"}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setActiveTab(`assignment-${assignment.id}`)}
                          variant={assignment.status === "graded" ? "outline" : "default"}
                        >
                          {assignment.status === "graded" ? "View Submission" : "Submit Assignment"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        // Handle assignment detail views
        
        if (activeTab.startsWith("assignment-")) {
          const assignmentId = activeTab.split("-")[1];
          return (
            <AssignmentSubmission 
              assignmentId={assignmentId} 
              courseId={courseId!}
              moduleId={moduleId!}
              onComplete={handleAssignmentComplete}
            />
          );
        }
        
        return null;
    }
  };
  
  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <File className="h-4 w-4" />;
      case "audio": return <FileAudio className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };
  
  // Main component render
  return (
    <div className="container py-6 space-y-6">
      {/* Course navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{course?.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <CourseProgressIndicator 
            progress={(course as any)?.progress || 0} 
            showLabel 
            size="sm"
          />
        </div>
      </div>
      
      {/* Module content layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar for navigation */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Module Content</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-1">
                {contentSorted.map((content) => (
                  <Button
                    key={content.id}
                    variant={activeContentId === content.id && activeTab === "content" ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setActiveContentId(content.id);
                      setActiveTab("content");
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getContentTypeIcon(content.type)}
                      <span className="truncate">{content.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Module navigation */}
          <div className="flex flex-col gap-2">
            {prevModule && (
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate(`/courses/${courseId}/modules/${prevModule.id}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <div className="truncate text-left">
                  <span className="block text-xs text-muted-foreground">Previous</span>
                  <span className="truncate block">{prevModule.title}</span>
                </div>
              </Button>
            )}
            
            {nextModule && (
              <Button 
                variant="outline" 
                className="justify-end"
                onClick={() => navigate(`/courses/${courseId}/modules/${nextModule.id}`)}
              >
                <div className="truncate text-right">
                  <span className="block text-xs text-muted-foreground">Next</span>
                  <span className="truncate block">{nextModule.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                Quizzes
                {quizzes.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {quizzes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                Assignments
                {assignments.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {assignments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="min-h-[300px]">
              {renderTabContent()}
              
              {/* Notes section - displays below content when viewing content */}
              {activeTab === "content" && activeContent && (
                <div id="notes-section" className="mt-8 pt-4 border-t">
                  <NoteTaking 
                    contentId={activeContent.id} 
                    timestamp={
                      activeContent.type === "video" || activeContent.type === "audio" 
                        ? getCurrentMediaTime() 
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}