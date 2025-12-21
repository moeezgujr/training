import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Upload, 
  FileText, 
  CheckCircle, 
  Calendar,
  Clock,
  Award,
  FileX,
  FileCheck
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export function AssignmentSubmission({
  assignmentId,
  courseId,
  moduleId,
  onComplete,
}: {
  assignmentId: string;
  courseId: string;
  moduleId: string;
  onComplete?: () => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textSubmission, setTextSubmission] = useState("");
  const [fileSubmission, setFileSubmission] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: ["/api/assignments", assignmentId],
    enabled: !!assignmentId,
  });

  // Get existing submission if any
  const { data: submission } = useQuery({
    queryKey: ["/api/assignments", assignmentId, "submission"],
    enabled: !!assignmentId,
  });

  // Submit assignment
  const { mutate: submitAssignment } = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsSubmitting(true);
      setUploadProgress(0);
      
      const xhr = new XMLHttpRequest();
      
      return new Promise<any>((resolve, reject) => {
        xhr.open("POST", `/api/assignments/${assignmentId}/submit`);
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error("Invalid response format"));
            }
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Upload aborted"));
        
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      setFileSubmission(null);
      setTextSubmission("");
      
      toast({
        title: "Assignment submitted!",
        description: "Your assignment has been submitted successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/assignments", assignmentId, "submission"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId] });
      
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      setIsSubmitting(false);
      
      toast({
        title: "Submission failed",
        description: error.message || "There was a problem submitting your assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSubmission(e.target.files[0]);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!assignment) return;
    
    const formData = new FormData();
    
    if (assignment.submissionType === "file") {
      if (!fileSubmission) {
        toast({
          title: "File required",
          description: "Please select a file to upload.",
          variant: "destructive",
        });
        return;
      }
      
      formData.append("file", fileSubmission);
    } else {
      if (!textSubmission.trim()) {
        toast({
          title: "Text required",
          description: "Please enter your submission text.",
          variant: "destructive",
        });
        return;
      }
      
      formData.append("text", textSubmission);
    }
    
    submitAssignment(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-32 w-full rounded-lg mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  // Error state - assignment not found
  if (!assignment) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Assignment Not Found"
        description="The assignment you're looking for doesn't exist or has been removed."
        actionHref={`/courses/${courseId}/modules/${moduleId}`}
        actionText="Back to Module"
      />
    );
  }

  // Format due date if exists
  const formattedDueDate = assignment.dueDate 
    ? new Date(assignment.dueDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // If assignment is already submitted and graded
  if (submission && submission.status === "graded") {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription className="mt-1">
                {assignment.description}
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Graded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium text-lg">
                Grade: {submission.grade}%
              </span>
            </div>
            
            {submission.instructorFeedback && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-2">Instructor Feedback:</h4>
                <p className="text-sm">{submission.instructorFeedback}</p>
              </div>
            )}
          </div>
          
          {submission.submissionType === "file" && submission.fileUrl && (
            <div className="flex justify-start mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                  <FileCheck className="mr-2 h-4 w-4" />
                  View Submission
                </a>
              </Button>
            </div>
          )}
          
          {submission.submissionType === "text" && submission.text && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Your Submission:</h4>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{submission.text}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}/modules/${moduleId}`}>
              Back to Module
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If assignment is already submitted but not graded yet
  if (submission && ["submitted", "in_progress"].includes(submission.status)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription className="mt-1">
                {assignment.description}
              </CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              Submitted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Assignment Submitted</AlertTitle>
            <AlertDescription>
              Your assignment has been submitted and is waiting for review by your instructor.
            </AlertDescription>
          </Alert>
          
          {submission.submissionType === "file" && submission.fileUrl && (
            <div className="flex justify-start mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                  <FileCheck className="mr-2 h-4 w-4" />
                  View Submission
                </a>
              </Button>
            </div>
          )}
          
          {submission.submissionType === "text" && submission.text && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Your Submission:</h4>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{submission.text}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseId}/modules/${moduleId}`}>
              Back to Module
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Regular assignment submission view
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription className="mt-1">
              {assignment.description}
            </CardDescription>
          </div>
          {assignment.dueDate && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Due: {formattedDueDate}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {assignment.submissionType === "file" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-lg p-6">
              {fileSubmission ? (
                <div className="text-center">
                  <FileText className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="mb-1 font-medium">{fileSubmission.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(fileSubmission.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFileSubmission(null)}
                    className="mt-2"
                  >
                    <FileX className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, or other documents (max 10MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="text-submission" className="text-sm font-medium">
              Your Answer:
            </label>
            <Textarea
              id="text-submission"
              placeholder="Type your answer here..."
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              rows={8}
            />
          </div>
        )}

        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          asChild
        >
          <Link href={`/courses/${courseId}/modules/${moduleId}`}>
            Cancel
          </Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (assignment.submissionType === "file" && !fileSubmission) || (assignment.submissionType === "text" && !textSubmission.trim())}
        >
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </CardFooter>
    </Card>
  );
}