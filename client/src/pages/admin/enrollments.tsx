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
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  UserPlus,
  Users,
  Search,
  Upload,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

export default function EnrollmentControl() {
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [bulkEnrollDialog, setBulkEnrollDialog] = useState(false);

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

  const enrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create enrollment');
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({ title: "Enrollment Created", description: "User has been successfully enrolled." });
      setEnrollDialog(false);
      setEnrollmentData({ userId: '', courseId: '', enrollmentType: 'manual', accessLevel: 'full', expiryDate: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
    onError: () => {
      toast({ title: "Enrollment Failed", variant: "destructive" });
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
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: (result) => {
      toast({ title: "Bulk Enrollment Complete", description: `Successfully enrolled ${result.successful ?? 'all'} users.` });
      setBulkEnrollDialog(false);
      setBulkData({ courseId: '', userEmails: '', enrollmentType: 'bulk', accessLevel: 'full' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update enrollment');
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({ title: "Enrollment Updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrollments'] });
    },
  });

  const handleEnroll = () => {
    if (!enrollmentData.userId || !enrollmentData.courseId) return;
    enrollMutation.mutate(enrollmentData);
  };

  const handleBulkEnroll = () => {
    if (!bulkData.courseId || !bulkData.userEmails) return;
    const emails = bulkData.userEmails.split('\n').map((e) => e.trim()).filter((e) => e);
    bulkEnrollMutation.mutate({ ...bulkData, userEmails: emails });
  };

  const handleStatusChange = (enrollmentId: string, newStatus: string) => {
    updateEnrollmentMutation.mutate({ id: enrollmentId, data: { status: newStatus } });
  };

  const filteredEnrollments = enrollments?.filter((enrollment: any) => {
    const matchesSearch = !searchQuery || 
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="p-6 bg-transparent min-h-screen">
        <AdminHeader title="Enrollment Control" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <AdminHeader title="Enrollment Control" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Enrollments", val: enrollmentStats.total, icon: Users, color: "text-blue-400" },
          { label: "Active Students", val: enrollmentStats.active, icon: UserCheck, color: "text-green-400" },
          { label: "Completed", val: enrollmentStats.completed, icon: CheckCircle, color: "text-blue-400" },
          { label: "Not Started", val: enrollmentStats.notStarted, icon: Clock, color: "text-yellow-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20 shadow-none border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.val}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-none border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search enrollments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-white/20">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-white/20">
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={bulkEnrollDialog} onOpenChange={setBulkEnrollDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Enroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-gray-950 border-white/20 text-white backdrop-blur-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Bulk Enrollment</DialogTitle>
                    <DialogDescription className="text-gray-400">Enroll multiple users at once</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Select Course</Label>
                      <Select onValueChange={(v) => setBulkData({ ...bulkData, courseId: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white">{courses?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">User Emails</Label>
                      <textarea
                        className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-gray-500"
                        value={bulkData.userEmails}
                        onChange={(e) => setBulkData({ ...bulkData, userEmails: e.target.value })}
                        placeholder="one@email.com&#10;two@email.com"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setBulkEnrollDialog(false)} className="border-white/10 text-white">Cancel</Button>
                      <Button onClick={handleBulkEnroll} className="bg-white text-black">Bulk Enroll</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-black hover:bg-gray-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enroll User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-950 border-white/20 text-white backdrop-blur-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Enroll User in Course</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Select User</Label>
                      <Select onValueChange={(v) => setEnrollmentData({ ...enrollmentData, userId: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white">{users?.filter((u: any) => u.role === 'learner').map((u: any) => <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Select Course</Label>
                      <Select onValueChange={(v) => setEnrollmentData({ ...enrollmentData, courseId: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-gray-900 text-white">{courses?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEnrollDialog(false)} className="border-white/10 text-white">Cancel</Button>
                      <Button onClick={handleEnroll} className="bg-white text-black">Enroll User</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/10 shadow-none border">
        <CardHeader>
          <CardTitle className="text-white">Course Enrollments</CardTitle>
          <CardDescription className="text-gray-300">Manage student access and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-300">Student</TableHead>
                <TableHead className="text-gray-300">Course</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Progress</TableHead>
                <TableHead className="text-gray-300">Enrolled Date</TableHead>
                <TableHead className="text-gray-300">Access</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment: any) => (
                <TableRow key={enrollment.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{enrollment.user.firstName} {enrollment.user.lastName}</p>
                      <p className="text-sm text-gray-400">{enrollment.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span>{enrollment.course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={enrollment.status} onValueChange={(v) => handleStatusChange(enrollment.id, v)}>
                      <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white border-white/20">
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${enrollment.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-white">{enrollment.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {enrollment.createdAt ? format(new Date(enrollment.createdAt), 'MMM dd, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-white bg-white/5">{enrollment.accessLevel || 'Full'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/20" onClick={() => handleStatusChange(enrollment.id, 'cancelled')}>
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">No enrollments found</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}