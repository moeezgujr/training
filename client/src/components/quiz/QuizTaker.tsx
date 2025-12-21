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
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  AlertCircle,
  BookOpen,
  Timer,
  Target,
  Award
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  points: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
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

interface QuizTakerProps {
  quiz: Quiz;
  onComplete?: (result: any) => void;
}

const quizAnswerSchema = z.record(z.string());

export function QuizTaker({ quiz, onComplete }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(quizAnswerSchema),
    defaultValues: answers
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
      const response = await apiRequest("POST", "/api/quiz-attempts", {
        quizId: quiz.id,
        answers,
        timeSpent
      });

      const result = await response.json();
      setQuizResult(result);
      setShowFeedback(true);
      
      if (onComplete) {
        onComplete(result);
      }

      toast({
        title: result.passed ? "Quiz Passed!" : "Quiz Completed",
        description: `You scored ${result.score}% (${result.attempt.correctAnswers}/${result.attempt.totalQuestions} correct)`,
        variant: result.passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showFeedback && quizResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Results Header */}
        <Card className={`border-2 ${quizResult.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {quizResult.passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <Target className="h-16 w-16 text-gray-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {quizResult.passed ? "Congratulations!" : "Quiz Complete"}
            </CardTitle>
            <CardDescription>
              You scored {quizResult.score}% on "{quiz.title}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{quizResult.score}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {quizResult.attempt.correctAnswers}/{quizResult.attempt.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{quizResult.passingScore}%</div>
                <div className="text-sm text-gray-600">Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatTime(timeSpent)}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Badge 
                variant={quizResult.passed ? "default" : "destructive"} 
                className="text-lg px-4 py-2"
              >
                {quizResult.passed ? (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    PASSED
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    NOT PASSED
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Question Review & Feedback
            </CardTitle>
            <CardDescription>
              Review your answers and learn from explanations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizResult.feedback.map((feedback: QuizFeedback, index: number) => (
              <div 
                key={feedback.questionId} 
                className={`border rounded-lg p-4 ${
                  feedback.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {feedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant={feedback.isCorrect ? "default" : "destructive"} className="text-xs">
                        {feedback.points} {feedback.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium mb-3">{feedback.questionText}</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Your Answer:</Label>
                        <div className={`mt-1 p-2 rounded ${
                          feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {feedback.userAnswer || "No answer provided"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Correct Answer:</Label>
                        <div className="mt-1 p-2 rounded bg-green-100 text-green-800">
                          {feedback.correctAnswer}
                        </div>
                      </div>
                    </div>
                    
                    {feedback.explanation && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Explanation:</strong> {feedback.explanation}
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{quiz.title}</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeSpent)}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Pass: {quiz.passingScore}%
              </div>
            </div>
          </CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {currentQuestionIndex + 1}
            </span>
            Question {currentQuestionIndex + 1}
            <Badge variant="outline" className="ml-auto">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.questionText}</h3>

            {/* Multiple Choice */}
            {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                    <Label 
                      htmlFor={`${currentQuestion.id}-${index}`} 
                      className="flex-grow cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQuestion.questionType === 'true_false' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                  <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
                  <Label htmlFor={`${currentQuestion.id}-true`} className="flex-grow cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                  <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
                  <Label htmlFor={`${currentQuestion.id}-false`} className="flex-grow cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {/* Fill in the Blank */}
            {currentQuestion.questionType === 'fill_blank' && (
              <Input
                placeholder="Enter your answer..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="text-lg p-3"
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {!isLastQuestion ? (
                <Button onClick={goToNextQuestion}>
                  Next Question
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Answer Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white border-blue-600'
                    : answers[question.id]
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">
              {Object.keys(answers).length} of {totalQuestions} questions answered
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}