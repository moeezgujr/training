import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Download,
  Star
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function InstructorAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/instructor/courses"],
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/instructor/assignments"],
  });

  // Mock assignment data - in real app would come from API
  const mockAssignments = [
    {
      id: "1",
      title: "Psychology Research Paper",
      studentName: "Sarah Johnson",
      studentAvatar: null,
      courseTitle: "Introduction to Psychology",
      submittedAt: "2024-01-20T10:30:00Z",
      dueDate: "2024-01-21T23:59:00Z",
      status: "pending",
      grade: null,
      content: "This research paper explores the cognitive biases in decision making...",
      attachments: ["research-paper.pdf", "references.docx"],
      feedback: ""
    },
    {
      id: "2",
      title: "Data Analysis Project",
      studentName: "Michael Chen", 
      studentAvatar: null,
      courseTitle: "Advanced Data Science",
      submittedAt: "2024-01-19T14:15:00Z",
      dueDate: "2024-01-22T23:59:00Z",
      status: "reviewed",
      grade: 85,
      content: "Analysis of customer behavior patterns using machine learning algorithms...",
      attachments: ["analysis.ipynb", "dataset.csv", "report.pdf"],
      feedback: "Excellent work on the statistical analysis. Consider exploring more advanced clustering techniques."
    },
    {
      id: "3",
      title: "Marketing Campaign Proposal",
      studentName: "Emily Rodriguez",
      studentAvatar: null,
      courseTitle: "Digital Marketing Fundamentals",
      submittedAt: "2024-01-18T09:45:00Z", 
      dueDate: "2024-01-19T23:59:00Z",
      status: "overdue",
      grade: null,
      content: "Comprehensive digital marketing strategy for a startup company...",
      attachments: ["proposal.pdf", "budget-breakdown.xlsx"],
      feedback: ""
    }
  ];

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    const matchesCourse = courseFilter === "all" || assignment.courseTitle.includes(courseFilter);
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const pendingAssignments = filteredAssignments.filter(a => a.status === "pending");
  const reviewedAssignments = filteredAssignments.filter(a => a.status === "reviewed");
  const overdueAssignments = filteredAssignments.filter(a => a.status === "overdue");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "reviewed": return <CheckCircle className="h-4 w-4" />;
      case "overdue": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={assignment.studentAvatar} />
              <AvatarFallback>{assignment.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{assignment.title}</CardTitle>
              <CardDescription className="text-sm">
                by {assignment.studentName} • {assignment.courseTitle}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(assignment.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(assignment.status)}
              {assignment.status}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Calendar className="h-3 w-3 mr-1" />
                Submitted
              </div>
              <div className="font-medium">
                {new Date(assignment.submittedAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Clock className="h-3 w-3 mr-1" />
                Due Date
              </div>
              <div className="font-medium">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Attachments</div>
              <div className="flex flex-wrap gap-2">
                {assignment.attachments.map((file: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {file}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {assignment.grade && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">Grade</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">{assignment.grade}/100</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedAssignment(assignment)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{assignment.title}</DialogTitle>
                  <DialogDescription>
                    Submitted by {assignment.studentName} for {assignment.courseTitle}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Assignment Content</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{assignment.content}</p>
                    </div>
                  </div>
                  
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {assignment.attachments.map((file: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="text-sm">{file}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Grade & Feedback</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium">Grade (0-100)</label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            defaultValue={assignment.grade || ""} 
                            placeholder="Enter grade"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Feedback</label>
                        <Textarea 
                          defaultValue={assignment.feedback} 
                          placeholder="Provide detailed feedback for the student..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save Grade & Feedback
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Student
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {assignment.status === "pending" && (
              <Button size="sm" variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Grade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments & Reviews</h1>
            <p className="text-muted-foreground">
              Review student submissions and provide feedback
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your feedback
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{reviewedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Graded submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course: any) => (
                <SelectItem key={course.id} value={course.title}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Assignments ({filteredAssignments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewedAssignments.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueAssignments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredAssignments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || courseFilter !== "all"
                    ? "Try adjusting your search or filters" 
                    : "Assignment submissions will appear here"
                  }
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviewed" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviewedAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {overdueAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}