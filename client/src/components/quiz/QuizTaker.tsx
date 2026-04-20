import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  AlertCircle,
  BookOpen,
  Timer,
  Target,
  Award,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  points: number;
  explanation?: string;
  correctAnswer?: string | string[] | undefined;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
  courseId?: string;
}

interface QuizFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  attempt: {
    correctAnswers: number;
    totalQuestions: number;
  };
  passingScore: number;
  feedback: QuizFeedback[];
  timeSpent: number;
  message: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: string;
}

interface QuizTakerProps {
  quiz: Quiz;
  onComplete?: (result: QuizResult) => void;
  forceFreshStart?: boolean; // When true → always show quiz form (retake mode)
}

const quizAnswerSchema = z.record(z.string().optional());

export function QuizTaker({ quiz, onComplete, forceFreshStart = false }: QuizTakerProps) {
  const queryClient = useQueryClient();

  // Fetch previous attempts
  const { data: attempts = [], isLoading: attemptsLoading } = useQuery<QuizAttempt[]>({
    queryKey: ["quizAttempts", quiz.id],
    queryFn: () => apiRequest("GET", `/api/quiz-attempts/${quiz.id}`).then(r => r.json()),
    enabled: !!quiz?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const latestAttempt = attempts.length > 0 
    ? attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(quizAnswerSchema),
    defaultValues: answers,
  });

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Sync form values
  useEffect(() => {
    Object.entries(answers).forEach(([key, value]) => {
      form.setValue(key, value);
    });
  }, [answers, form]);

  // Guard: no questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This quiz has no questions. Please contact your instructor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading attempts
  if (attemptsLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Checking your previous attempts...</p>
      </div>
    );
  }

  // IMPORTANT: In retake mode (forceFreshStart=true) we ALWAYS show the quiz form
  // Only show previous results when NOT in retake mode and there is an attempt
  if (!forceFreshStart && latestAttempt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              {latestAttempt.passed ? (
                <Trophy className="h-24 w-24 text-yellow-500" />
              ) : (
                <XCircle className="h-24 w-24 text-red-500" />
              )}
            </div>
            
            <CardTitle className="text-4xl mb-2">
              {latestAttempt.passed ? "Congratulations!" : "Quiz Completed"}
            </CardTitle>
            
            <CardDescription className="text-xl">
              You scored <strong className={latestAttempt.passed ? "text-green-600" : "text-red-600"}>
                {latestAttempt.score}%
              </strong> on "{quiz.title}"
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl font-bold">{latestAttempt.score}%</div>
                <div className="text-sm text-muted-foreground mt-1">Your Score</div>
              </div>
              <div>
                <div className="text-4xl font-bold">
                  {latestAttempt.correctAnswers}/{latestAttempt.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Correct</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{quiz.passingScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Required</div>
              </div>
              <div>
                <div className="text-4xl font-bold">
                  {Math.floor(latestAttempt.timeSpent / 60)}:{(latestAttempt.timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Time Taken</div>
              </div>
            </div>

            <div className="pt-4">
              <Badge 
                variant={latestAttempt.passed ? "default" : "destructive"} 
                className="text-xl px-8 py-3"
              >
                {latestAttempt.passed ? "PASSED" : "NOT PASSED"}
              </Badge>
            </div>

            <div className="mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/courses/${quiz.courseId ?? 'back'}/modules`}>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Course
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // If we reach here → show quiz form (first attempt OR retake mode)
  // ──────────────────────────────────────────────────────────────

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Question</CardTitle>
            <CardDescription>Unable to load the current question. Please refresh the page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    form.setValue(questionId, answer);
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", `/api/quizzes/${quiz.id}/submit`, {
        answers,
        timeSpent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const result: QuizResult = await response.json();
      
      // Immediately invalidate cache so parent sees new attempt
      await queryClient.invalidateQueries({ queryKey: ["quizAttempts", quiz.id] });
      
      setQuizResult(result);
      setShowFeedback(true);
      
      if (onComplete) {
        onComplete(result);
      }

      toast({
        title: result.passed ? "Quiz Passed! 🎉" : "Quiz Completed",
        description: `You scored ${result.score}% (${result.attempt.correctAnswers}/${result.attempt.totalQuestions} correct)`,
        variant: result.passed ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  };

  // Results View (only after fresh submission in current session)
  if (showFeedback && quizResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className={`border-2 ${quizResult.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              {quizResult.passed ? (
                <Trophy className="h-20 w-20 text-yellow-500" />
              ) : (
                <Target className="h-20 w-20 text-gray-500" />
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {quizResult.passed ? "Congratulations!" : "Quiz Completed"}
            </CardTitle>
            <CardDescription className="text-xl">
              You scored <strong>{quizResult.score}%</strong> on "{quiz.title}"
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
              <div>
                <div className="text-3xl font-bold">{quizResult.score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {quizResult.attempt.correctAnswers}/{quizResult.attempt.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{quizResult.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Required</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatTime(quizResult.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="text-center">
              <Badge 
                variant={quizResult.passed ? "default" : "destructive"} 
                className="text-lg px-6 py-2"
              >
                {quizResult.passed ? (
                  <>
                    <Award className="h-5 w-5 mr-2 inline" />
                    PASSED
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2 inline" />
                    NOT PASSED
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" />
              Question Review & Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizResult.feedback.map((fb: QuizFeedback, index: number) => (
              <div 
                key={fb.questionId}
                className={`p-5 rounded-lg border ${
                  fb.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {fb.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-lg">Question {index + 1}</span>
                      <Badge variant={fb.isCorrect ? "default" : "destructive"}>
                        {fb.points} {fb.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </div>

                    <h4 className="font-medium text-lg mb-4">{fb.questionText}</h4>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">Your Answer</Label>
                        <div className={`p-3 rounded border ${
                          fb.isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                        }`}>
                          {fb.userAnswer || "— not answered —"}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">Correct Answer</Label>
                        <div className="p-3 rounded border bg-green-100 border-green-300">
                          {fb.correctAnswer}
                        </div>
                      </div>
                    </div>

                    {fb.explanation && (
                      <Alert className="bg-white">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Explanation:</strong> {fb.explanation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal quiz taking interface
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-2xl">{quiz.title}</span>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Timer className="h-4 w-4" />
                {formatTime(timeSpent)}
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                Pass: {quiz.passingScore}%
              </div>
            </div>
          </CardTitle>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
        </CardHeader>
      </Card>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2 text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {currentQuestionIndex + 1}
              </div>
              Question {currentQuestionIndex + 1}
            </div>
            <Badge variant="outline">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <h3 className="text-xl font-medium">{currentQuestion.questionText}</h3>

          {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${idx}`} />
                    <Label 
                      htmlFor={`${currentQuestion.id}-${idx}`} 
                      className="flex-grow cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.questionType === 'true_false' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((value) => (
                  <div 
                    key={value}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={value.toLowerCase()} id={`${currentQuestion.id}-${value}`} />
                    <Label 
                      htmlFor={`${currentQuestion.id}-${value}`} 
                      className="flex-grow cursor-pointer text-base"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.questionType === 'fill_blank' && (
            <Form {...form}>
              <FormField
                control={form.control}
                name={currentQuestion.id}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Type your answer here..."
                        className="text-lg p-4"
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button 
                onClick={goToNextQuestion}
                className="w-full sm:w-auto"
              >
                Next Question
              </Button>
            ) : (
              <Button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Jump to Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground border-primary'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Answered: <strong>{Object.keys(answers).length}</strong> / {totalQuestions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}