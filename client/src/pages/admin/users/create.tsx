import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "wouter";

const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["learner", "instructor", "admin"], {
    required_error: "Please select a role",
  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Redirect if not admin
  if (!isAuthLoading && (!isAuthenticated || user?.role !== "admin")) {
    return <Redirect to={!isAuthenticated ? "/api/login" : "/dashboard"} />;
  }

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "learner",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserFormValues) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been created and will receive login instructions via email.",
      });
      navigate("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "There was an error creating the user.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(values);
  };

  if (isAuthLoading) {
    return (
      <div className="container py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground">
          Add a new user to the Meeting Matters LMS platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Enter the details for the new user. They will receive login instructions via email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This email will be used for login and communication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role for this user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="learner">
                          <div className="flex flex-col">
                            <span className="font-medium">Learner</span>
                            <span className="text-xs text-muted-foreground">
                              Can enroll in courses and access learning materials
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="instructor">
                          <div className="flex flex-col">
                            <span className="font-medium">Instructor</span>
                            <span className="text-xs text-muted-foreground">
                              Can create and manage courses, view student progress
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex flex-col">
                            <span className="font-medium">Administrator</span>
                            <span className="text-xs text-muted-foreground">
                              Full access to platform management and user control
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the appropriate role based on the user's responsibilities
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}