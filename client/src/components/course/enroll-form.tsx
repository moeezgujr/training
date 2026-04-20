import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

const enrollmentSchema = z.object({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions to enroll.",
  }),
  notes: z.string().optional(),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollFormProps {
  courseId: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollForm({ courseId, courseName, isOpen, onClose }: EnrollFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Form definition
  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      agreeToTerms: false,
      notes: "",
    },
  });
  
  // Enroll in course mutation
  const { mutate: enrollInCourse, isPending } = useMutation({
    mutationFn: async (data: EnrollmentFormValues) => {
      return await apiRequest("POST", `/api/courses/${courseId}/enroll`, {
        courseId,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      // Show success state
      setIsEnrolled(true);
      
      // Update enrolled courses cache
      queryClient.invalidateQueries({ queryKey: ["/api/courses/enrolled"] });
      
      toast({
        title: "Enrollment successful!",
        description: `You have been enrolled in ${courseName}.`,
      });
      
      // Reset form after 2 seconds and redirect to dashboard
      setTimeout(() => {
        form.reset();
        onClose();
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "There was a problem enrolling in this course. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: EnrollmentFormValues) => {
    enrollInCourse(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {isEnrolled ? (
          // Success state
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Enrollment Successful!</h3>
            <p className="text-center text-muted-foreground mb-4">
              You have successfully enrolled in <span className="font-medium">{courseName}</span>.
            </p>
            <p className="text-center text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          // Enrollment form
          <>
            <DialogHeader>
              <DialogTitle>Enroll in Course</DialogTitle>
              <DialogDescription>
                Complete the form below to enroll in <span className="font-medium">{courseName}</span>.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Optional notes field */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Let the instructor know if you have any questions or special requirements..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Terms and conditions checkbox */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            By enrolling, you agree to follow course guidelines and 
                            commit to completing the required assignments.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}