import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Video, 
  AudioLines, 
  Link as LinkIcon,
  X,
  Plus,
  CheckCircle,
  HelpCircle,
  ClipboardList,
  Brain,
  Target,
  Clock,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Form validation schemas
const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  type: z.enum(["video", "audio", "pdf", "text"]),
  url: z.string().url("Please provide a valid URL").optional(),
  content: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute").optional(),
  order: z.coerce.number().min(1, "Order must be at least 1"),
});

const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  type: z.enum(["multiple_choice", "true_false", "fill_blank"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  points: z.coerce.number().min(1, "Points must be at least 1").default(1),
});

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  timeLimit: z.coerce.number().min(1, "Time limit must be at least 1 minute").optional(),
  passingScore: z.coerce.number().min(0).max(100, "Passing score must be between 0-100").default(70),
  allowRetakes: z.boolean().default(true),
  questions: z.array(quizQuestionSchema).min(1, "At least one question is required"),
  order: z.coerce.number().min(1, "Order must be at least 1"),
});

const assignmentSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  description: z.string().min(1, "Assignment description is required"),
  instructions: z.string().optional(),
  submissionType: z.enum(["file", "text"]),
  maxPoints: z.coerce.number().min(1, "Max points must be at least 1").default(100),
  dueDate: z.string().optional(),
  allowLateSubmissions: z.boolean().default(true),
  order: z.coerce.number().min(1, "Order must be at least 1"),
});

type LessonFormValues = z.infer<typeof lessonSchema>;
type QuizFormValues = z.infer<typeof quizSchema>;
type QuizQuestionFormValues = z.infer<typeof quizQuestionSchema>;
type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface LessonUploadProps {
  moduleId?: string;
  onContentAdded?: (content: any) => void;
  existingLessons?: LessonFormValues[];
  existingQuizzes?: QuizFormValues[];
  existingAssignments?: AssignmentFormValues[];
}

export function LessonUpload({ 
  moduleId, 
  onContentAdded, 
  existingLessons = [],
  existingQuizzes = [],
  existingAssignments = []
}: LessonUploadProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessons, setLessons] = useState<LessonFormValues[]>(existingLessons);
  const [quizzes, setQuizzes] = useState<QuizFormValues[]>(existingQuizzes);
  const [assignments, setAssignments] = useState<AssignmentFormValues[]>(existingAssignments);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestionFormValues[]>([]);
  
  const lessonForm = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "video",
      url: "",
      content: "",
      duration: 5,
      order: lessons.length + 1,
    },
  });

  const quizForm = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      allowRetakes: true,
      questions: [],
      order: quizzes.length + 1,
    },
  });

  const assignmentForm = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      submissionType: "text",
      maxPoints: 100,
      allowLateSubmissions: true,
      order: assignments.length + 1,
    },
  });

  const questionForm = useForm<QuizQuestionFormValues>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 1,
    },
  });
  
  const watchedLessonType = lessonForm.watch("type");
  const watchedQuestionType = questionForm.watch("type");
  
  // Lesson submission
  const onLessonSubmit = async (values: LessonFormValues) => {
    try {
      setIsSubmitting(true);
      const newLesson = { ...values };
      setLessons([...lessons, newLesson]);
      onContentAdded?.({ type: "lesson", content: newLesson });
      
      lessonForm.reset({
        title: "",
        description: "",
        type: "video",
        url: "",
        content: "",
        duration: 5,
        order: lessons.length + 2,
      });
      
      toast({
        title: "Lesson Added",
        description: "Your lesson has been added to the module.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quiz submission
  const onQuizSubmit = async (values: QuizFormValues) => {
    try {
      setIsSubmitting(true);
      const newQuiz = { ...values, questions: currentQuestions };
      setQuizzes([...quizzes, newQuiz]);
      onContentAdded?.({ type: "quiz", content: newQuiz });
      
      quizForm.reset({
        title: "",
        description: "",
        timeLimit: 30,
        passingScore: 70,
        allowRetakes: true,
        questions: [],
        order: quizzes.length + 2,
      });
      setCurrentQuestions([]);
      
      toast({
        title: "Quiz Added",
        description: "Your quiz has been added to the module.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assignment submission
  const onAssignmentSubmit = async (values: AssignmentFormValues) => {
    try {
      setIsSubmitting(true);
      const newAssignment = { ...values };
      setAssignments([...assignments, newAssignment]);
      onContentAdded?.({ type: "assignment", content: newAssignment });
      
      assignmentForm.reset({
        title: "",
        description: "",
        instructions: "",
        submissionType: "text",
        maxPoints: 100,
        allowLateSubmissions: true,
        order: assignments.length + 2,
      });
      
      toast({
        title: "Assignment Added",
        description: "Your assignment has been added to the module.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add question to current quiz
  const addQuestionToQuiz = (question: QuizQuestionFormValues) => {
    setCurrentQuestions([...currentQuestions, question]);
    questionForm.reset({
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 1,
    });
    
    toast({
      title: "Question Added",
      description: "Question added to the current quiz.",
    });
  };
  
  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
    
    toast({
      title: "Lesson Removed",
      description: "The lesson has been removed from the module.",
      variant: "default",
    });
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "audio":
        return <AudioLines className="h-4 w-4 text-orange-500" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Content Overview</CardTitle>
          <CardDescription>
            All content items that will be included in this module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 border rounded-md bg-blue-50 dark:bg-blue-950/20">
              <Video className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Lessons</p>
                <p className="text-xs text-muted-foreground">{lessons.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
              <HelpCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Quizzes</p>
                <p className="text-xs text-muted-foreground">{quizzes.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-md bg-orange-50 dark:bg-orange-950/20">
              <ClipboardList className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">Assignments</p>
                <p className="text-xs text-muted-foreground">{assignments.length} items</p>
              </div>
            </div>
          </div>

          {/* All Content Items */}
          {(lessons.length > 0 || quizzes.length > 0 || assignments.length > 0) && (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={`lesson-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-3 flex-grow">
                    {getTypeIcon(lesson.type)}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">Lesson</Badge>
                        <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
                        {lesson.duration && <span>{lesson.duration} min</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeLesson(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {quizzes.map((quiz, index) => (
                <div key={`quiz-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-green-50/50 dark:bg-green-950/10">
                  <div className="flex items-center gap-3 flex-grow">
                    <HelpCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{quiz.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">Quiz</Badge>
                        <span>{quiz.questions.length} questions</span>
                        {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setQuizzes(quizzes.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {assignments.map((assignment, index) => (
                <div key={`assignment-${index}`} className="flex items-center justify-between p-3 border rounded-md bg-orange-50/50 dark:bg-orange-950/10">
                  <div className="flex items-center gap-3 flex-grow">
                    <ClipboardList className="h-4 w-4 text-orange-500" />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{assignment.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">Assignment</Badge>
                        <Badge variant="outline" className="text-xs">{assignment.submissionType}</Badge>
                        <span>{assignment.maxPoints} pts</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setAssignments(assignments.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add New Lesson Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Lesson
          </CardTitle>
          <CardDescription>
            Upload or link to lesson content for your course module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Introduction to Mindfulness" {...field} />
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
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
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
                              <AudioLines className="h-4 w-4 text-orange-500" />
                              Audio Content
                            </div>
                          </SelectItem>
                          <SelectItem value="pdf">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-500" />
                              PDF Document
                            </div>
                          </SelectItem>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              Text Content
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
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
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchedLessonType !== "text" && (
                <FormField
                  control={lessonForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Content URL
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            watchedLessonType === "video" 
                              ? "https://youtube.com/watch?v=..." 
                              : watchedLessonType === "audio"
                              ? "https://example.com/audio.mp3"
                              : "https://example.com/document.pdf"
                          }
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {watchedLessonType === "video" && "YouTube, Vimeo, or direct video file URL"}
                        {watchedLessonType === "audio" && "Direct link to audio file (MP3, WAV, etc.)"}
                        {watchedLessonType === "pdf" && "Direct link to PDF document"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {watchedLessonType === "text" && (
                <FormField
                  control={lessonForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your lesson content here..."
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Write your lesson content directly here
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        Estimated time to complete this lesson
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={lessonForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        Order of this lesson in the module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Lesson"}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Upload Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Content Upload Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Supported Content Types:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Video: YouTube, Vimeo, MP4 files</li>
                <li>• Audio: MP3, WAV, podcast links</li>
                <li>• Documents: PDF files, Google Docs</li>
                <li>• Text: Written content, articles</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Keep videos under 15 minutes</li>
                <li>• Use clear, descriptive titles</li>
                <li>• Add accurate duration estimates</li>
                <li>• Order lessons logically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}