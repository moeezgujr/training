import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  UserPlus,
  Users,
  Search,
  Filter,
  Download,
  Upload,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Plus,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function EnrollmentControl() {
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [bulkEnrollDialog, setBulkEnrollDialog] = useState(false);
  const [accessRulesDialog, setAccessRulesDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [enrollmentData, setEnrollmentData] = useState({
    userId: '',
    courseId: '',
    enrollmentType: 'manual',
    accessLevel: 'full',
    expiryDate: '',
    notes: ''
  });
  const [bulkData, setBulkData] = useState({
    courseId: '',
    userEmails: '',
    enrollmentType: 'bulk',
    accessLevel: 'full'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['/api/admin/enrollments'],
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/admin/courses'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: accessRules } = useQuery({
    queryKey: ['/api/admin/access-rules'],
  });

  const enrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create enrollment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Created",
        description: "User has been successfully enrolled in the course.",
      });
      setEnrollDialog(false);
      setEnrollmentData({
        userId: '',
        courseId: '',
        enrollmentType: 'manual',
        accessLevel: 'full',
        expiryDate: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
    onError: () => {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to bulk enroll users');
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Bulk Enrollment Complete",
        description: `Successfully enrolled ${result.successful} users. ${result.failed} failed.`,
      });
      setBulkEnrollDialog(false);
      setBulkData({
        courseId: '',
        userEmails: '',
        enrollmentType: 'bulk',
        accessLevel: 'full'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
    onError: () => {
      toast({
        title: "Bulk Enrollment Failed",
        description: "Failed to process bulk enrollment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update enrollment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Updated",
        description: "Enrollment has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update enrollment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!enrollmentData.userId || !enrollmentData.courseId) return;
    enrollMutation.mutate(enrollmentData);
  };

  const handleBulkEnroll = () => {
    if (!bulkData.courseId || !bulkData.userEmails) return;
    
    const emails = bulkData.userEmails.split('\n').map(email => email.trim()).filter(email => email);
    bulkEnrollMutation.mutate({
      ...bulkData,
      userEmails: emails
    });
  };

  const handleStatusChange = (enrollmentId: string, newStatus: string) => {
    updateEnrollmentMutation.mutate({
      id: enrollmentId,
      data: { status: newStatus }
    });
  };

  const filteredEnrollments = enrollments?.filter((enrollment: any) => {
    const matchesSearch = !searchQuery || 
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || enrollment.courseId === filterCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  }) || [];

  const enrollmentStats = {
    total: enrollments?.length || 0,
    active: enrollments?.filter((e: any) => e.status === 'in_progress').length || 0,
    completed: enrollments?.filter((e: any) => e.status === 'completed').length || 0,
    notStarted: enrollments?.filter((e: any) => e.status === 'not_started').length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Enrollment Control" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Enrollment Control" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold">{enrollmentStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{enrollmentStats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{enrollmentStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-yellow-600">{enrollmentStats.notStarted}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search enrollments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setAccessRulesDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Access Rules
              </Button>

              <Dialog open={bulkEnrollDialog} onOpenChange={setBulkEnrollDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Enroll
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll User
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
          <CardDescription>
            Manage student enrollments and access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment: any) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{enrollment.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">{enrollment.course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={enrollment.status}
                      onValueChange={(value) => handleStatusChange(enrollment.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{enrollment.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {enrollment.accessLevel || 'Full'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(enrollment.id, 'cancelled')}
                      >
                        <UserX className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No enrollments found</h3>
              <p className="text-gray-500">No enrollments match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Enrollment Dialog */}
      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll User in Course</DialogTitle>
            <DialogDescription>
              Manually enroll a user in a course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select value={enrollmentData.userId} onValueChange={(value) => setEnrollmentData({ ...enrollmentData, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.filter((user: any) => user.role === 'learner').map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={enrollmentData.courseId} onValueChange={(value) => setEnrollmentData({ ...enrollmentData, courseId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="access-level">Access Level</Label>
                <Select value={enrollmentData.accessLevel} onValueChange={(value) => setEnrollmentData({ ...enrollmentData, accessLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="limited">Limited Access</SelectItem>
                    <SelectItem value="preview">Preview Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={enrollmentData.expiryDate}
                  onChange={(e) => setEnrollmentData({ ...enrollmentData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="enrollment-notes">Notes (Optional)</Label>
              <Input
                id="enrollment-notes"
                value={enrollmentData.notes}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, notes: e.target.value })}
                placeholder="Add any notes about this enrollment"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEnrollDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEnroll}
                disabled={!enrollmentData.userId || !enrollmentData.courseId || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Enrollment Dialog */}
      <Dialog open={bulkEnrollDialog} onOpenChange={setBulkEnrollDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Enrollment</DialogTitle>
            <DialogDescription>
              Enroll multiple users in a course at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-course">Select Course</Label>
              <Select value={bulkData.courseId} onValueChange={(value) => setBulkData({ ...bulkData, courseId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="user-emails">User Emails</Label>
              <textarea
                id="user-emails"
                className="w-full h-32 p-3 border rounded-md resize-none"
                value={bulkData.userEmails}
                onChange={(e) => setBulkData({ ...bulkData, userEmails: e.target.value })}
                placeholder="Enter email addresses, one per line:&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter one email address per line
              </p>
            </div>

            <div>
              <Label htmlFor="bulk-access-level">Access Level</Label>
              <Select value={bulkData.accessLevel} onValueChange={(value) => setBulkData({ ...bulkData, accessLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="preview">Preview Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkEnrollDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkEnroll}
                disabled={!bulkData.courseId || !bulkData.userEmails || bulkEnrollMutation.isPending}
              >
                {bulkEnrollMutation.isPending ? 'Processing...' : 'Bulk Enroll'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}