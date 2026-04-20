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
import { AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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
  const [retakingQuizId, setRetakingQuizId] = useState<string | null>(null);
  const [completingContentIds, setCompletingContentIds] = useState<Set<string>>(new Set()); // Track completing items

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

  const quizIds = quizzes.map(q => q.id);
  const { data: allAttempts = {}, isLoading: attemptsLoading, refetch: refetchAttempts } = useQuery<Record<string, any>>({
    queryKey: ["quizAttempts", quizIds],
    queryFn: async () => {
      const results = await Promise.all(
        quizIds.map(id =>
          apiRequest("GET", `/api/quiz-attempts/${id}`)
            .then(r => r.json())
            .catch(() => null)
        )
      );

      return results.reduce((acc: Record<string, any>, attempt, index) => {
        const quizId = quizIds[index];
        if (attempt && quizId) {
          if (Array.isArray(attempt) && attempt.length > 0) {
            acc[quizId] = attempt.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
          }
        }
        return acc;
      }, {});
    },
    enabled: quizIds.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Set the first content item as active by default
  useEffect(() => {
    if (contentSorted.length > 0 && !activeContentId) {
      setActiveContentId(contentSorted[0].id);
    }
  }, [contentSorted, activeContentId]);
  
  // Fixed & improved markContentComplete
  const markContentComplete = async (contentId: string) => {
    if (completingContentIds.has(contentId)) return;

    setCompletingContentIds(prev => {
      const newSet = new Set(prev);
      newSet.add(contentId);
      return newSet;
    });

    try {
      console.log(`Marking content ${contentId} as complete...`);

      const response = await fetch(`/api/modules/content/${contentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Complete failed:", data);
        throw new Error(data.message || "Failed to mark content as complete");
      }

      console.log("Complete success:", data);

      toast({
        title: "Success",
        description: "Content marked as complete! Progress updated.",
      });

      // Force refresh course data → progress bar updates instantly
      await refetch();
    } catch (error) {
      console.error("Mark complete error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update progress. Check server logs.",
        variant: "destructive",
      });
    } finally {
      setCompletingContentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
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

  // Fixed renderContentItem with complete button everywhere
  const renderContentItem = (content: any) => {
    if (!content) return null;

    const isCompleting = completingContentIds.has(content.id);

    const completeButton = content.completed ? (
  <Button disabled variant="outline" size="sm" className="ml-auto bg-green-50 text-green-700 border-green-200">
    <CheckCircle className="h-4 w-4 mr-2" />
    Completed
  </Button>
) : (
  <Button
    onClick={() => markContentComplete(content.id)}
    disabled={isCompleting}
        size="sm"
        className="ml-auto"
      >
        {isCompleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Marking...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Complete
          </>
        )}
      </Button>
    );

    switch (content.type) {
    case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-black relative">
              <video
                ref={videoRef}
                src={content.url}
                controls
                className="w-full h-full"
                onEnded={() => markContentComplete(content.id)}
              />
            </div>
            <div className="flex justify-end">
              {completeButton}
            </div>
          </div>
        );

      case "pdf":
      case "book":
        return (
          <div className="space-y-4">
            <PDFViewer url={content.url} title={content.title} />
            <div className="flex justify-end">
              {completeButton}
            </div>
          </div>
        );

      case "audio":
        const currentIndex = contentSorted.findIndex((c) => c.id === content.id);
        const previousContent = currentIndex > 0 ? contentSorted[currentIndex - 1] : null;
        const nextContent = currentIndex < contentSorted.length - 1 ? contentSorted[currentIndex + 1] : null;

        return (
          <div className="relative">
            <EnhancedAudioPlayer
              audioUrl={content.url}
              lessonId={content.id}
              title={content.title}
              description={content.description}
              transcript={content.transcript ? JSON.parse(content.transcript) : []}
              onProgress={(progress) => {
                // Optional: auto-complete if 95%+ watched
              }}
              onComplete={() => markContentComplete(content.id)}
              onPrevious={previousContent ? () => setActiveContentId(previousContent.id) : undefined}
              onNext={nextContent ? () => setActiveContentId(nextContent.id) : undefined}
              hasPrevious={!!previousContent}
              hasNext={!!nextContent}
            />
            {/* Show button for manual complete */}
            <div className="absolute bottom-4 right-4 z-10">
              {completeButton}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-muted rounded-lg text-center">
            <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>Unsupported content type</p>
            <div className="mt-4">
              {completeButton}
            </div>
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
        if (attemptsLoading) {
          return (
            <div className="py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading quiz progress...</p>
            </div>
          );
        }

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
              <div className="space-y-6">
                {quizzes.map((quiz: Quiz) => {
                  const latestAttempt = allAttempts[quiz.id];
                  const hasPassed = latestAttempt?.passed;
                  const score = latestAttempt?.score;
                  const isRetaking = retakingQuizId === quiz.id;

                  return (
                    <Card key={quiz.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{quiz.title}</CardTitle>
                            {quiz.description && (
                              <CardDescription className="mt-1">{quiz.description}</CardDescription>
                            )}
                          </div>

                          {!isRetaking && (
                            <>
                              {hasPassed ? (
                                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  <CheckCircle className="h-4 w-4" />
                                  Passed • {score}%
                                </div>
                              ) : latestAttempt ? (
                                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                  <AlertCircle className="h-4 w-4" />
                                  Attempted • {score}%
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">Not attempted</div>
                              )}
                            </>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        {isRetaking || !latestAttempt ? (
                          <QuizTaker
                            key={quiz.id + (isRetaking ? '-retake' : '')}
                            quiz={{ ...quiz, description: quiz.description || '' }}
                            forceFreshStart={isRetaking}
                            onComplete={async (result) => {
                              await new Promise(r => setTimeout(r, 1000));
                              setRetakingQuizId(null);
                              await refetchAttempts();
                              refetch();
                              toast({
                                title: result.passed ? "Quiz Passed!" : "Quiz Completed",
                                description: `You scored ${result.score}% on "${quiz.title}"`,
                                variant: result.passed ? "default" : "destructive"
                              });
                            }}
                          />
                        ) : hasPassed ? (
                          <div className="text-center py-8 space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                            <p className="text-xl font-medium">Quiz Passed!</p>
                            <p className="text-muted-foreground">
                              Score: <strong>{score}%</strong> (Passing: {quiz.passingScore}%)
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setRetakingQuizId(quiz.id)}
                            >
                              Retake Quiz
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8 space-y-6">
                            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-red-700">Quiz Not Passed</h3>
                              <p className="text-lg text-muted-foreground mt-2">
                                Score: <strong>{score}%</strong> (Passing: {quiz.passingScore}%)
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => setRetakingQuizId(quiz.id)}
                            >
                              Retake Quiz
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
              
              {/* Notes section */}
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