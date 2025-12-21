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
import { Label } from "@/components/ui/label";
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
  HelpCircle,
  ClipboardList,
  FileAudio
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAudioPlayer } from "@/components/EnhancedAudioPlayer";

// Simple form schemas
const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  type: z.enum(["video", "audio", "pdf", "text"]),
  url: z.string().url("Please provide a valid URL").optional(),
  content: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute").optional(),
});

const questionSchema = z.object({
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
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

const assignmentSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  description: z.string().min(1, "Assignment description is required"),
  submissionType: z.enum(["file", "text"]),
  maxPoints: z.coerce.number().min(1, "Max points must be at least 1").default(100),
});

type LessonFormValues = z.infer<typeof lessonSchema>;
type QuestionFormValues = z.infer<typeof questionSchema>;
type QuizFormValues = z.infer<typeof quizSchema>;
type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface SimpleLessonUploadProps {
  onContentAdded?: (content: any) => void;
}

export function SimpleLessonUpload({ onContentAdded }: SimpleLessonUploadProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<any[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<QuestionFormValues[]>([]);
  
  const lessonForm = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "video",
      url: "",
      content: "",
      duration: 5,
    },
  });

  const quizForm = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      questions: [],
    },
  });

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 1,
    },
  });

  const assignmentForm = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      submissionType: "text",
      maxPoints: 100,
    },
  });

  const watchedLessonType = lessonForm.watch("type");
  const watchedQuestionType = questionForm.watch("type");

  const onLessonSubmit = async (values: LessonFormValues) => {
    const newContent = { type: "lesson", ...values };
    setContent([...content, newContent]);
    onContentAdded?.(newContent);
    
    lessonForm.reset();
    toast({
      title: "Lesson Added!",
      description: "Your lesson has been added to the course.",
    });
  };

  const onQuizSubmit = async (values: QuizFormValues) => {
    if (currentQuestions.length === 0) {
      toast({
        title: "No Questions Added",
        description: "Please add at least one question to your quiz.",
        variant: "destructive",
      });
      return;
    }

    const newContent = { type: "quiz", ...values, questions: currentQuestions };
    setContent([...content, newContent]);
    onContentAdded?.(newContent);
    
    quizForm.reset();
    setCurrentQuestions([]);
    toast({
      title: "Quiz Added!",
      description: `Your quiz with ${currentQuestions.length} questions has been added to the course.`,
    });
  };

  const addQuestion = async (values: QuestionFormValues) => {
    setCurrentQuestions([...currentQuestions, values]);
    questionForm.reset({
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      points: 1,
    });
    
    toast({
      title: "Question Added!",
      description: "Question added to your quiz.",
    });
  };

  const removeQuestion = (index: number) => {
    setCurrentQuestions(currentQuestions.filter((_, i) => i !== index));
    toast({
      title: "Question Removed",
      description: "The question has been removed from your quiz.",
    });
  };

  const onAssignmentSubmit = async (values: AssignmentFormValues) => {
    const newContent = { type: "assignment", ...values };
    setContent([...content, newContent]);
    onContentAdded?.(newContent);
    
    assignmentForm.reset();
    toast({
      title: "Assignment Added!",
      description: "Your assignment has been added to the course.",
    });
  };

  const removeContent = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
    toast({
      title: "Content Removed",
      description: "The content has been removed from your course.",
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
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-green-500" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      {content.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Content ({content.length} items)</CardTitle>
            <CardDescription>
              Content that will be included in your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                  <div className="flex items-center gap-3 flex-grow">
                    {getTypeIcon(item.type)}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                        {item.duration && <span>{item.duration} min</span>}
                        {item.maxPoints && <span>{item.maxPoints} pts</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeContent(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Creation Tabs */}
      <Tabs defaultValue="lesson" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lesson">Add Lesson</TabsTrigger>
          <TabsTrigger value="quiz">Create Quiz</TabsTrigger>
          <TabsTrigger value="assignment">Add Assignment</TabsTrigger>
          <TabsTrigger value="audio">Audio Player</TabsTrigger>
        </TabsList>

        {/* Lesson Tab */}
        <TabsContent value="lesson">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Add New Lesson
              </CardTitle>
              <CardDescription>
                Upload or link to lesson content
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
                              <SelectItem value="video">Video Lesson</SelectItem>
                              <SelectItem value="audio">Audio Content</SelectItem>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                              <SelectItem value="text">Text Content</SelectItem>
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

                  {/* File Attachments for Description */}
                  <div className="space-y-3">
                    <Label>Lesson Attachments</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 bg-muted/10">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <h4 className="font-medium mb-2">Add Supporting Files</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload worksheets, PDFs, documents, or other materials for this lesson
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const fileNames = files.map(f => f.name).join(", ");
                              const currentDescription = lessonForm.getValues("description") || "";
                              const newDescription = currentDescription + 
                                (currentDescription ? "\n\n" : "") + 
                                `📎 Attached files: ${fileNames}`;
                              
                              lessonForm.setValue("description", newDescription);
                              
                              toast({
                                title: `${files.length} File(s) Added! 📎`,
                                description: `Added to lesson description: ${fileNames.length > 50 ? fileNames.substring(0, 50) + "..." : fileNames}`,
                              });
                            }
                          }}
                          className="max-w-sm mx-auto"
                        />
                        <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">DOC</Badge>
                          <Badge variant="outline">Images</Badge>
                          <Badge variant="outline">ZIP</Badge>
                          <Badge variant="outline">TXT</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Max 10MB per file • Multiple files supported
                        </p>
                      </div>
                    </div>
                  </div>

                  {watchedLessonType !== "text" && (
                    <div className="space-y-4">
                      <FormField
                        control={lessonForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-content"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Link to your video, audio, or PDF content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedLessonType === "audio" && (
                        <div className="border-2 border-dashed rounded-lg p-6 bg-muted/20">
                          <div className="text-center">
                            <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h4 className="font-medium mb-2">Or Upload Audio File Directly</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Upload an audio file instead of providing a URL
                            </p>
                            <Input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Check file size (50MB limit)
                                  if (file.size > 50 * 1024 * 1024) {
                                    toast({
                                      title: "File Too Large",
                                      description: "Please select an audio file smaller than 50MB",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  // Create URL for the file and set it in the form
                                  const url = URL.createObjectURL(file);
                                  lessonForm.setValue("url", url);
                                  
                                  toast({
                                    title: "Audio File Uploaded! 🎵",
                                    description: `${file.name} is ready to be included in your lesson`,
                                  });
                                }
                              }}
                              className="max-w-sm mx-auto"
                            />
                            <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
                              <Badge variant="outline">MP3</Badge>
                              <Badge variant="outline">WAV</Badge>
                              <Badge variant="outline">OGG</Badge>
                              <Badge variant="outline">AAC</Badge>
                              <Badge variant="outline">M4A</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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

                  <div className="flex justify-end">
                    <Button type="submit">
                      Add Lesson
                      <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz">
          <div className="space-y-6">
            {/* Quiz Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Create Quiz
                </CardTitle>
                <CardDescription>
                  Build a comprehensive quiz with multiple questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...quizForm}>
                  <div className="space-y-4">
                    <FormField
                      control={quizForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Module 1 Assessment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quizForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instructions for the quiz..."
                              className="min-h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quiz Attachments */}
                    <div className="space-y-3">
                      <Label>Quiz Reference Materials</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 bg-muted/10">
                        <div className="text-center">
                          <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                          <h4 className="font-medium mb-2">Add Reference Materials</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Upload charts, diagrams, reading materials, or other resources for this quiz
                          </p>
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const fileNames = files.map(f => f.name).join(", ");
                                const currentDescription = quizForm.getValues("description") || "";
                                const newDescription = currentDescription + 
                                  (currentDescription ? "\n\n" : "") + 
                                  `📎 Reference materials: ${fileNames}`;
                                
                                quizForm.setValue("description", newDescription);
                                
                                toast({
                                  title: `${files.length} File(s) Added to Quiz! 📝`,
                                  description: `Reference materials: ${fileNames.length > 50 ? fileNames.substring(0, 50) + "..." : fileNames}`,
                                });
                              }
                            }}
                            className="max-w-sm mx-auto"
                          />
                          <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Badge variant="outline">Charts</Badge>
                            <Badge variant="outline">Diagrams</Badge>
                            <Badge variant="outline">PDF</Badge>
                            <Badge variant="outline">Images</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={quizForm.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={quizForm.control}
                        name="passingScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passing Score (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} max={100} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Current Questions */}
            {currentQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Questions ({currentQuestions.length})</CardTitle>
                  <CardDescription>
                    Questions that will be included in this quiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentQuestions.map((question, index) => (
                      <div key={index} className="border rounded-md p-4 bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Question {index + 1}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.points} pts
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm mb-2">{question.question}</h4>
                            
                            {question.type === "multiple_choice" && question.options && (
                              <div className="text-xs text-muted-foreground">
                                <p className="mb-1">Options:</p>
                                <ul className="list-disc list-inside ml-2">
                                  {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                    <li key={optIndex} className={option === question.correctAnswer ? "font-semibold text-green-600" : ""}>
                                      {option} {option === question.correctAnswer && "✓"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {question.type === "true_false" && (
                              <div className="text-xs text-muted-foreground">
                                <p>Correct answer: <span className="font-semibold text-green-600">{question.correctAnswer}</span></p>
                              </div>
                            )}
                            
                            {question.explanation && (
                              <div className="text-xs text-muted-foreground mt-2">
                                <p><strong>Explanation:</strong> {question.explanation}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Question
                </CardTitle>
                <CardDescription>
                  Add a new question to your quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...questionForm}>
                  <form onSubmit={questionForm.handleSubmit(addQuestion)} className="space-y-4">
                    <FormField
                      control={questionForm.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your question here..."
                              className="min-h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={questionForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={questionForm.control}
                        name="points"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchedQuestionType === "multiple_choice" && (
                      <div className="space-y-3">
                        <FormLabel>Answer Options</FormLabel>
                        {[0, 1, 2, 3].map((index) => (
                          <FormField
                            key={index}
                            control={questionForm.control}
                            name={`options.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder={`Option ${index + 1}`}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}

                    <FormField
                      control={questionForm.control}
                      name="correctAnswer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            {watchedQuestionType === "true_false" ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select correct answer" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="True">True</SelectItem>
                                  <SelectItem value="False">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                placeholder={
                                  watchedQuestionType === "multiple_choice" 
                                    ? "Enter the exact text of the correct option"
                                    : "Enter the correct answer"
                                }
                                {...field} 
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={questionForm.control}
                      name="explanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why this is the correct answer..."
                              className="min-h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit">
                        Add Question
                        <Plus className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Finalize Quiz */}
            {currentQuestions.length > 0 && (
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">
                        Quiz Ready ({currentQuestions.length} questions)
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Click "Create Quiz" to add this quiz to your course
                      </p>
                    </div>
                    <Button 
                      onClick={quizForm.handleSubmit(onQuizSubmit)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create Quiz
                      <HelpCircle className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Add Assignment
              </CardTitle>
              <CardDescription>
                Create an assignment for students to complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...assignmentForm}>
                <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-4">
                  <FormField
                    control={assignmentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Reflection Essay" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assignmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed instructions for the assignment..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Assignment Attachments */}
                  <div className="space-y-3">
                    <Label>Assignment Resources</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 bg-muted/10">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <h4 className="font-medium mb-2">Add Supporting Materials</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload templates, rubrics, example files, or other resources for this assignment
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xlsx,.pptx"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const fileNames = files.map(f => f.name).join(", ");
                              const currentDescription = assignmentForm.getValues("description") || "";
                              const newDescription = currentDescription + 
                                (currentDescription ? "\n\n" : "") + 
                                `📎 Assignment resources: ${fileNames}`;
                              
                              assignmentForm.setValue("description", newDescription);
                              
                              toast({
                                title: `${files.length} File(s) Added to Assignment! 📋`,
                                description: `Resources: ${fileNames.length > 50 ? fileNames.substring(0, 50) + "..." : fileNames}`,
                              });
                            }
                          }}
                          className="max-w-sm mx-auto"
                        />
                        <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Badge variant="outline">Templates</Badge>
                          <Badge variant="outline">Rubrics</Badge>
                          <Badge variant="outline">Examples</Badge>
                          <Badge variant="outline">Instructions</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={assignmentForm.control}
                      name="submissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Submission Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select submission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text Response</SelectItem>
                              <SelectItem value="file">File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.control}
                      name="maxPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Points</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Add Assignment
                      <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Player Tab */}
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Audio Content Player</CardTitle>
              <CardDescription>
                Upload and test your audio content for courses with the enhanced player
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedAudioPlayer
                audioUrl="/attached_assets/ANX1 6-2021 pt1.MP3"
                lessonId="demo-audio-upload"
                title="Sample Audio Content"
                description="Test the enhanced audio player with your content"
                transcript={[]}
                onProgress={(progress) => {
                  console.log(`Audio progress: ${progress}`);
                }}
                onComplete={() => {
                  console.log("Audio completed!");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}