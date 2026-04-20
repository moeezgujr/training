import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Mail, Calendar, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface Tutor {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  totalCourses?: number;
  totalStudents?: number;
}

export default function TutorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTutorDialogOpen, setIsAddTutorDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load all tutors/instructors
  const { data: tutors, isLoading } = useQuery({
    queryKey: ["/api/admin/tutors"],
    queryFn: async () => {
      return apiRequest({ url: "/api/admin/users" });
    },
  });

  // Filter tutors
  const filteredTutors = tutors?.filter((tutor: Tutor) => 
    tutor.role === 'instructor' &&
    (tutor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tutor.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Delete tutor mutation
  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return apiRequest({
        url: `/api/admin/users/${tutorId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      toast({
        title: "Tutor removed",
        description: "The tutor has been successfully removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove tutor",
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout title="Manage Tutors">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tutor Management</h1>
        <p className="text-gray-600">
          Add and manage tutors who can create and teach courses on your platform.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10"
            placeholder="Search tutors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddTutorDialogOpen} onOpenChange={setIsAddTutorDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Tutor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tutor</DialogTitle>
            </DialogHeader>
            <AddTutorForm onSuccess={() => setIsAddTutorDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tutors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.map((tutor: Tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tutor.username}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Tutor
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTutorMutation.mutate(tutor.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{tutor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(tutor.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">
                        {tutor.totalCourses || 0}
                      </div>
                      <div className="text-xs text-gray-500">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {tutor.totalStudents || 0}
                      </div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTutors.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "No tutors found" : "No tutors yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Start by adding your first tutor to the platform"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddTutorDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Tutor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

// Add Tutor Form Component
function AddTutorForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      bio: "",
    },
  });

  const addTutorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest({
        url: "/api/admin/tutors",
        method: "POST",
        body: {
          ...data,
          role: "instructor",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      toast({
        title: "Tutor added successfully!",
        description: "The new tutor can now log in and create courses.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding tutor",
        description: error.message || "There was an error adding the tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    addTutorMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name*</label>
          <Input
            placeholder="Enter tutor's full name"
            {...form.register("username", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address*</label>
          <Input
            type="email"
            placeholder="tutor@example.com"
            {...form.register("email", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Temporary Password*</label>
          <Input
            type="password"
            placeholder="Create a temporary password"
            {...form.register("password", { required: true, minLength: 6 })}
          />
          <p className="text-xs text-gray-500">
            The tutor can change this password after their first login
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio (Optional)</label>
          <Textarea
            placeholder="Brief description of the tutor's background and expertise..."
            className="min-h-[80px]"
            {...form.register("bio")}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={addTutorMutation.isPending}
          className="w-full sm:w-auto"
        >
          {addTutorMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Adding Tutor...
            </>
          ) : (
            "Add Tutor"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}