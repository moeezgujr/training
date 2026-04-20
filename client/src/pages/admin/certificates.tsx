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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  Award,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Send,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Settings
} from "lucide-react";
import { format } from "date-fns";

export default function CertificateManagement() {
  const [templateDialog, setTemplateDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    type: 'course_completion',
    template: '',
    isActive: true
  });
  const [issueData, setIssueData] = useState({
    studentId: '',
    courseId: '',
    certificateType: 'course_completion',
    customText: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['/api/admin/certificates'],
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/admin/certificate-templates'],
  });

  const { data: students } = useQuery({
    queryKey: ['/api/admin/students'],
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/admin/courses'],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/certificate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Certificate template has been successfully created.",
      });
      setTemplateDialog(false);
      setTemplateData({
        name: '',
        description: '',
        type: 'course_completion',
        template: '',
        isActive: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certificate-templates'] });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to issue certificate');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Certificate Issued",
        description: "Certificate has been successfully issued to the student.",
      });
      setIssueDialog(false);
      setIssueData({
        studentId: '',
        courseId: '',
        certificateType: 'course_completion',
        customText: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certificates'] });
    },
    onError: () => {
      toast({
        title: "Issue Failed",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadCertificateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/certificates/${id}/download`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to download certificate');
      return response.blob();
    },
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Download Started",
        description: "Certificate download has started.",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = () => {
    if (!templateData.name || !templateData.template) return;
    createTemplateMutation.mutate(templateData);
  };

  const handleIssueCertificate = () => {
    if (!issueData.studentId || !issueData.courseId) return;
    issueCertificateMutation.mutate(issueData);
  };

  const handleDownload = (certificateId: string) => {
    downloadCertificateMutation.mutate(certificateId);
  };

  const filteredCertificates = certificates?.filter((cert: any) => {
    const matchesSearch = !searchQuery || 
      cert.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || cert.type === filterType;
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const stats = {
    totalCertificates: certificates?.length || 0,
    issuedToday: certificates?.filter((c: any) => {
      const today = new Date().toDateString();
      return new Date(c.issuedAt).toDateString() === today;
    }).length || 0,
    activeTemplates: templates?.filter((t: any) => t.isActive).length || 0,
    completionCertificates: certificates?.filter((c: any) => c.type === 'course_completion').length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Certificate Management" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Certificate Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Issued Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.issuedToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold">{stats.activeTemplates}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Certificates</p>
                <p className="text-2xl font-bold">{stats.completionCertificates}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course_completion">Course Completion</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Issue Certificate
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
          <CardDescription>
            Manage and track issued certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate: any) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{certificate.certificateNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{certificate.student?.name}</p>
                      <p className="text-sm text-gray-600">{certificate.student?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{certificate.course?.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {certificate.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        certificate.status === 'issued' ? 'default' :
                        certificate.status === 'pending' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {certificate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(certificate.issuedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(certificate.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/certificates/verify/${certificate.verificationCode}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No certificates found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'No certificates match your current filters.'
                  : 'Issue your first certificate to get started.'}
              </p>
              <Button onClick={() => setIssueDialog(true)}>
                <Send className="w-4 h-4 mr-2" />
                Issue Certificate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Management Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Templates</DialogTitle>
            <DialogDescription>
              Manage certificate templates for different types of achievements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  placeholder="Course Completion Certificate"
                />
              </div>

              <div>
                <Label htmlFor="template-type">Certificate Type</Label>
                <Select value={templateData.type} onValueChange={(value) => setTemplateData({ ...templateData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course_completion">Course Completion</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                placeholder="Template for course completion certificates"
              />
            </div>

            <div>
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={templateData.template}
                onChange={(e) => setTemplateData({ ...templateData, template: e.target.value })}
                placeholder="Certificate template HTML/text content..."
                className="min-h-32"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={!templateData.name || !templateData.template || createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>
              Issue a certificate to a student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="student-select">Select Student</Label>
              <Select value={issueData.studentId} onValueChange={(value) => setIssueData({ ...issueData, studentId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course-select">Select Course</Label>
              <Select value={issueData.courseId} onValueChange={(value) => setIssueData({ ...issueData, courseId: value })}>
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
              <Label htmlFor="certificate-type">Certificate Type</Label>
              <Select value={issueData.certificateType} onValueChange={(value) => setIssueData({ ...issueData, certificateType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course_completion">Course Completion</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-text">Custom Text (Optional)</Label>
              <Textarea
                id="custom-text"
                value={issueData.customText}
                onChange={(e) => setIssueData({ ...issueData, customText: e.target.value })}
                placeholder="Additional text for the certificate..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIssueDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleIssueCertificate}
                disabled={!issueData.studentId || !issueData.courseId || issueCertificateMutation.isPending}
              >
                {issueCertificateMutation.isPending ? 'Issuing...' : 'Issue Certificate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}