import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2,
  BookOpen,
  Video,
  FileText,
  Headphones,
  File,
  HelpCircle,
  X,
  Upload,
  CheckCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contentFormSchema = z.object({
  title: z.string().min(1, "Content title is required"),
  type: z.enum(["video", "audio", "pdf", "document", "book", "ebook"]),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  duration: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  passingScore: z.coerce.number().min(0).max(100).default(70),
});

const questionFormSchema = z.object({
  questionText: z.string().min(1, "Question is required"),
  questionType: z.enum(["multiple_choice", "true_false", "fill_blank"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  points: z.coerce.number().min(1).default(1),
});

type ContentFormData = z.infer<typeof contentFormSchema>;
type QuizFormData = z.infer<typeof quizFormSchema>;
type QuestionFormData = z.infer<typeof questionFormSchema>;

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
}

export default function ModuleContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = params.id;
  const moduleId = params.moduleId;
  
  // Content state
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Quiz state
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [managingQuizId, setManagingQuizId] = useState<string | null>(null);
  
  // Question state
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [questionOptions, setQuestionOptions] = useState<string[]>([""]);
  
  // Track previous question type to detect actual changes (not initial loads)
  const previousQuestionType = useRef<string | null>(null);

  const contentForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      type: "video",
      url: "",
      description: "",
      duration: "",
    },
  });

  const quizForm = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      passingScore: 70,
    },
  });

  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      questionType: "multiple_choice",
      options: [],
      correctAnswer: "",
      explanation: "",
      points: 1,
    },
  });

  // Watch for question type changes and reset options
  const questionType = questionForm.watch("questionType");
  useEffect(() => {
    // Only reset if the type actually changed (not on initial load during editing)
    if (previousQuestionType.current !== null && previousQuestionType.current !== questionType) {
      // User manually changed the type - reset to prevent stale data
      if (questionType === "multiple_choice") {
        setQuestionOptions(["", ""]);
      } else {
        setQuestionOptions([]);
      }
      questionForm.setValue("correctAnswer", "");
    }
    // Update the ref for next comparison
    previousQuestionType.current = questionType;
  }, [questionType]);

  // Fetch module data
  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: [`/api/admin/modules/${moduleId}`],
    enabled: !!moduleId,
  });

  // Fetch module content
  const { data: contents = [], isLoading: contentsLoading } = useQuery({
    queryKey: [`/api/admin/modules/${moduleId}/content`],
    enabled: !!moduleId,
  });

  // Fetch module quizzes
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: [`/api/admin/modules/${moduleId}/quizzes`],
    enabled: !!moduleId,
  });

  // Fetch quiz with questions when managing
  const { data: quizWithQuestions, isLoading: quizQuestionsLoading } = useQuery({
    queryKey: [`/api/admin/quizzes/${managingQuizId}`],
    enabled: !!managingQuizId,
  });

  // Create/Update content mutation
  const saveContentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const url = editingContent 
        ? `/api/admin/modules/${moduleId}/content/${editingContent.id}`
        : `/api/admin/modules/${moduleId}/content`;
      
      let response;
      
      // Handle file upload
      if (uploadMethod === "file" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", data.title);
        formData.append("type", data.type);
        formData.append("description", data.description || "");
        if (data.duration) {
          formData.append("duration", data.duration);
        }
        
        response = await fetch(url, {
          method: editingContent ? "PUT" : "POST",
          body: formData,
        });
      } else {
        // Handle URL input
        response = await fetch(url, {
          method: editingContent ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            duration: data.duration ? parseInt(data.duration) : undefined,
          }),
        });
      }
      
      if (!response.ok) throw new Error("Failed to save content");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editingContent ? "Content Updated" : "Content Created",
        description: `The content has been successfully ${editingContent ? 'updated' : 'created'}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/modules/${moduleId}/content`] });
      setIsContentDialogOpen(false);
      setEditingContent(null);
      contentForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/admin/modules/${moduleId}/content/${contentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete content");
    },
    onSuccess: () => {
      toast({
        title: "Content Deleted",
        description: "The content has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/modules/${moduleId}/content`] });
      setDeletingContentId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create/Update quiz mutation
  const saveQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      const url = editingQuiz 
        ? `/api/admin/quizzes/${editingQuiz.id}`
        : `/api/admin/modules/${moduleId}/quizzes`;
      
      const response = await fetch(url, {
        method: editingQuiz ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save quiz");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editingQuiz ? "Quiz Updated" : "Quiz Created",
        description: `The quiz has been successfully ${editingQuiz ? 'updated' : 'created'}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/modules/${moduleId}/quizzes`] });
      setIsQuizDialogOpen(false);
      setEditingQuiz(null);
      quizForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quiz");
    },
    onSuccess: () => {
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/modules/${moduleId}/quizzes`] });
      setDeletingQuizId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create/Update question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      const url = editingQuestion 
        ? `/api/admin/quizzes/${managingQuizId}/questions/${editingQuestion.id}`
        : `/api/admin/quizzes/${managingQuizId}/questions`;
      
      const payload = {
        ...data,
        correctAnswer: JSON.stringify([data.correctAnswer]),
        options: data.questionType === 'multiple_choice' 
          ? questionOptions.filter(opt => opt.trim())
          : data.questionType === 'true_false' 
            ? ['True', 'False']
            : undefined,
      };
      
      const response = await fetch(url, {
        method: editingQuestion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save question");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editingQuestion ? "Question Updated" : "Question Added",
        description: `The question has been successfully ${editingQuestion ? 'updated' : 'added'}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/quizzes/${managingQuizId}`] });
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      questionForm.reset();
      setQuestionOptions([""]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/admin/quizzes/${managingQuizId}/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete question");
    },
    onSuccess: () => {
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/quizzes/${managingQuizId}`] });
      setDeletingQuestionId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onContentSubmit = (data: ContentFormData) => {
    saveContentMutation.mutate(data);
  };

  const onQuizSubmit = (data: QuizFormData) => {
    saveQuizMutation.mutate(data);
  };

  const onQuestionSubmit = (data: QuestionFormData) => {
    // Validate based on question type
    if (data.questionType === 'multiple_choice') {
      const validOptions = questionOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: "Validation Error",
          description: "Multiple choice questions must have at least 2 non-empty options.",
          variant: "destructive",
        });
        return;
      }
      if (!data.correctAnswer || !validOptions.includes(data.correctAnswer)) {
        toast({
          title: "Validation Error",
          description: "Please select a valid correct answer from the options.",
          variant: "destructive",
        });
        return;
      }
    } else if (data.questionType === 'true_false') {
      if (data.correctAnswer !== 'True' && data.correctAnswer !== 'False') {
        toast({
          title: "Validation Error",
          description: "True/False questions must have 'True' or 'False' as the correct answer.",
          variant: "destructive",
        });
        return;
      }
    } else if (data.questionType === 'fill_blank') {
      if (!data.correctAnswer || data.correctAnswer.trim() === '') {
        toast({
          title: "Validation Error",
          description: "Fill in the blank questions must have a non-empty correct answer.",
          variant: "destructive",
        });
        return;
      }
    }
    
    saveQuestionMutation.mutate(data);
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    contentForm.reset({
      title: content.title || "",
      type: content.type || "video",
      url: content.url || "",
      description: content.description || "",
      duration: content.duration?.toString() || "",
    });
    setIsContentDialogOpen(true);
  };

  const handleAddContent = () => {
    setEditingContent(null);
    contentForm.reset();
    setUploadMethod("url");
    setSelectedFile(null);
    setFilePreview(null);
    setIsContentDialogOpen(true);
  };

  const handleEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    quizForm.reset({
      title: quiz.title || "",
      description: quiz.description || "",
      passingScore: quiz.passingScore || 70,
    });
    setIsQuizDialogOpen(true);
  };

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    quizForm.reset();
    setIsQuizDialogOpen(true);
  };

  const handleManageQuestions = (quizId: string) => {
    setManagingQuizId(quizId);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    previousQuestionType.current = null; // Reset ref for new question
    questionForm.reset({
      questionText: "",
      questionType: "multiple_choice",
      options: [],
      correctAnswer: "",
      explanation: "",
      points: 1,
    });
    setQuestionOptions(["", ""]);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    
    // Sync ref BEFORE resetting form to prevent the effect from thinking type changed
    previousQuestionType.current = question.questionType || "multiple_choice";
    
    const correctAnswerArray = typeof question.correctAnswer === 'string' 
      ? JSON.parse(question.correctAnswer)
      : question.correctAnswer;
    
    questionForm.reset({
      questionText: question.questionText || "",
      questionType: question.questionType || "multiple_choice",
      correctAnswer: correctAnswerArray[0] || "",
      explanation: question.explanation || "",
      points: question.points || 1,
    });
    
    if (question.questionType === 'multiple_choice' && question.options) {
      setQuestionOptions(question.options);
    }
    
    setIsQuestionDialogOpen(true);
  };

  const addOption = () => {
    setQuestionOptions([...questionOptions, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionOptions];
    newOptions[index] = value;
    setQuestionOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (questionOptions.length > 1) {
      setQuestionOptions(questionOptions.filter((_, i) => i !== index));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />;
      case "audio":
        return <Headphones className="h-4 w-4 text-purple-600" />;
      case "pdf":
      case "document":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "book":
      case "ebook":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user || user.role !== "admin") {
    return <div>Access denied</div>;
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Module Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The module you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => setLocation(`/admin/courses/${courseId}/edit`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show question management view if a quiz is being managed
  if (managingQuizId && quizWithQuestions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setManagingQuizId(null)}
                data-testid="button-back-to-module"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Module
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{quizWithQuestions.title}</h1>
                <p className="text-gray-600 mt-1">{quizWithQuestions.description || "Manage quiz questions"}</p>
              </div>
            </div>
            <Button 
              onClick={handleAddQuestion}
              data-testid="button-add-question"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Questions</CardTitle>
                  <CardDescription>
                    Passing Score: {quizWithQuestions.passingScore}%
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {quizWithQuestions.questions?.length || 0} Questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {quizQuestionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : quizWithQuestions.questions && quizWithQuestions.questions.length > 0 ? (
                <div className="space-y-3">
                  {quizWithQuestions.questions.map((question: any, index: number) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge>{question.questionType.replace('_', ' ')}</Badge>
                            <Badge variant="secondary">{question.points} pts</Badge>
                          </div>
                          <p className="font-medium mb-2">{question.questionText}</p>
                          {question.options && (
                            <div className="text-sm text-gray-600 space-y-1">
                              {question.options.map((option: string, i: number) => {
                                const correctAnswer = typeof question.correctAnswer === 'string' 
                                  ? JSON.parse(question.correctAnswer)[0]
                                  : question.correctAnswer[0];
                                const isCorrect = option === correctAnswer;
                                return (
                                  <div key={i} className={`flex items-center gap-2 ${isCorrect ? 'text-green-600 font-medium' : ''}`}>
                                    <span className="w-6">{String.fromCharCode(65 + i)}.</span>
                                    <span>{option}</span>
                                    {isCorrect && <span className="text-xs">(Correct)</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              Explanation: {question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            data-testid={`button-edit-question-${index}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeletingQuestionId(question.id)}
                            data-testid={`button-delete-question-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first question to get started.
                  </p>
                  <Button onClick={handleAddQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Dialog */}
          <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
                <DialogDescription>
                  {editingQuestion ? "Update the question details" : "Create a new quiz question"}
                </DialogDescription>
              </DialogHeader>
              <Form {...questionForm}>
                <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                  <FormField
                    control={questionForm.control}
                    name="questionText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your question" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={questionForm.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                  {questionForm.watch("questionType") === "multiple_choice" && (
                    <div className="space-y-2">
                      <FormLabel>Answer Options *</FormLabel>
                      {questionOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                            disabled={questionOptions.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}

                  <FormField
                    control={questionForm.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer *</FormLabel>
                        {questionForm.watch("questionType") === "multiple_choice" ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {questionOptions.filter(opt => opt.trim()).map((option, index) => (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : questionForm.watch("questionType") === "true_false" ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="True">True</SelectItem>
                              <SelectItem value="False">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Enter correct answer" />
                          </FormControl>
                        )}
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
                          <Textarea {...field} placeholder="Explain the correct answer" rows={2} />
                        </FormControl>
                        <FormDescription>
                          This will be shown to students after they answer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={questionForm.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points *</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsQuestionDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveQuestionMutation.isPending}
                      data-testid="button-submit-question"
                    >
                      {saveQuestionMutation.isPending ? "Saving..." : editingQuestion ? "Update Question" : "Add Question"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Question Confirmation */}
          <AlertDialog open={!!deletingQuestionId} onOpenChange={() => setDeletingQuestionId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this question. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletingQuestionId && deleteQuestionMutation.mutate(deletingQuestionId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation(`/admin/courses/${courseId}/edit`)}
              data-testid="button-back-to-course"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
              <p className="text-gray-600 mt-1">{module.description || "Manage module content and quizzes"}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Learning Content</CardTitle>
                  <CardDescription>
                    Add videos, audio files, PDFs, and other learning materials
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleAddContent}
                  data-testid="button-add-content"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </CardHeader>
              <CardContent>
                {contentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : contents.length > 0 ? (
                  <div className="space-y-3">
                    {contents.map((content: any, index: number) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getTypeIcon(content.type)}
                            <div className="flex-1">
                              <h4 className="font-medium">{content.title}</h4>
                              {content.description && (
                                <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {content.type}
                                </Badge>
                                {content.duration && (
                                  <span className="text-xs text-gray-500">
                                    {formatDuration(content.duration)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {content.type === 'quiz' ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleManageQuestions(content.id)}
                                  data-testid={`button-manage-questions-${index}`}
                                >
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Questions
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDeletingQuizId(content.id)}
                                  data-testid={`button-delete-quiz-${index}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditContent(content)}
                                  data-testid={`button-edit-content-${index}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDeletingContentId(content.id)}
                                  data-testid={`button-delete-content-${index}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first learning material to get started.
                    </p>
                    <Button onClick={handleAddContent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Quizzes</CardTitle>
                  <CardDescription>
                    Create interactive assessments to test student knowledge
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleAddQuiz}
                  data-testid="button-add-quiz"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
              </CardHeader>
              <CardContent>
                {quizzesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : quizzes.length > 0 ? (
                  <div className="space-y-3">
                    {quizzes.map((quiz: any, index: number) => (
                      <div key={quiz.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <HelpCircle className="h-5 w-5 text-purple-600" />
                            <div className="flex-1">
                              <h4 className="font-medium">{quiz.title}</h4>
                              {quiz.description && (
                                <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Passing: {quiz.passingScore}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleManageQuestions(quiz.id)}
                              data-testid={`button-manage-questions-${index}`}
                            >
                              Manage Questions
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditQuiz(quiz)}
                              data-testid={`button-edit-quiz-${index}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeletingQuizId(quiz.id)}
                              data-testid={`button-delete-quiz-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Quizzes Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first quiz to assess student learning.
                    </p>
                    <Button onClick={handleAddQuiz}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Dialog */}
        <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContent ? "Edit Content" : "Add Content"}</DialogTitle>
              <DialogDescription>
                {editingContent ? "Update the content details" : "Add new learning material to this module"}
              </DialogDescription>
            </DialogHeader>
            <Form {...contentForm}>
              <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-4">
                <FormField
                  control={contentForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Content title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contentForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="ebook">E-Book</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload Method Toggle */}
                <div className="space-y-3">
                  <FormLabel>Content Source</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUploadMethod("url");
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="flex-1"
                    >
                      URL Link
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUploadMethod("file")}
                      className="flex-1"
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                {uploadMethod === "url" ? (
                  <FormField
                    control={contentForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/file.pdf" />
                        </FormControl>
                        <FormDescription>
                          Enter the URL where the content is hosted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <FormLabel>Upload File</FormLabel>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Input
                        type="file"
                        accept={
                          contentForm.watch("type") === "video" ? "video/*" :
                          contentForm.watch("type") === "audio" ? "audio/*" :
                          contentForm.watch("type") === "pdf" ? "application/pdf" :
                          "*/*"
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            // Create preview for certain file types
                            if (file.type.startsWith("image/")) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFilePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setFilePreview(null);
                            }
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {selectedFile ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button type="button" variant="outline" size="sm">
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">
                              {contentForm.watch("type") === "video" && "MP4, MOV, AVI, WebM"}
                              {contentForm.watch("type") === "audio" && "MP3, WAV, OGG, M4A"}
                              {contentForm.watch("type") === "pdf" && "PDF files only"}
                              {!["video", "audio", "pdf"].includes(contentForm.watch("type")) && "All file types supported"}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {filePreview && (
                      <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                    )}
                  </div>
                )}

                <FormField
                  control={contentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Brief description" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Only show duration field for URL-based content */}
                {uploadMethod === "url" && (
                  <FormField
                    control={contentForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="300" />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete this content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Show helper text for file uploads */}
                {uploadMethod === "file" && selectedFile && (
                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      ℹ️ Duration will be calculated automatically
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      For audio and video files, we'll extract the exact duration. For PDFs, we'll estimate reading time based on file size.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsContentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveContentMutation.isPending}
                    data-testid="button-submit-content"
                  >
                    {saveContentMutation.isPending ? "Saving..." : editingContent ? "Update Content" : "Add Content"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Quiz Dialog */}
        <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuiz ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
              <DialogDescription>
                {editingQuiz ? "Update the quiz details" : "Create a new quiz for this module"}
              </DialogDescription>
            </DialogHeader>
            <Form {...quizForm}>
              <form onSubmit={quizForm.handleSubmit(onQuizSubmit)} className="space-y-4">
                <FormField
                  control={quizForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Module Assessment Quiz" />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Brief description of the quiz" rows={3} />
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
                      <FormLabel>Passing Score (%) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" />
                      </FormControl>
                      <FormDescription>
                        Minimum score required to pass (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuizDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveQuizMutation.isPending}
                    data-testid="button-submit-quiz"
                  >
                    {saveQuizMutation.isPending ? "Saving..." : editingQuiz ? "Update Quiz" : "Create Quiz"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Content Confirmation */}
        <AlertDialog open={!!deletingContentId} onOpenChange={() => setDeletingContentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this content. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingContentId && deleteContentMutation.mutate(deletingContentId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Quiz Confirmation */}
        <AlertDialog open={!!deletingQuizId} onOpenChange={() => setDeletingQuizId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this quiz and all its questions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingQuizId && deleteQuizMutation.mutate(deletingQuizId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
