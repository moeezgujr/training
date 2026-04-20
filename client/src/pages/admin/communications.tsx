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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Mail,
  Bell,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Settings,
  Phone
} from "lucide-react";
import { format } from "date-fns";

export default function CommunicationsManagement() {
  const [emailDialog, setEmailDialog] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: 'all',
    specificUsers: [] as string[],
    courseId: '',
    scheduleDate: '',
    template: ''
  });
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
    specificUsers: [] as string[],
    courseId: '',
    actionUrl: '',
    scheduleDate: ''
  });
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email',
    variables: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communications, isLoading } = useQuery({
    queryKey: ['/api/admin/communications'],
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/admin/communication-templates'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/admin/courses'],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send email');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Email has been successfully sent to recipients.",
      });
      setEmailDialog(false);
      setEmailData({
        subject: '',
        message: '',
        recipients: 'all',
        specificUsers: [],
        courseId: '',
        scheduleDate: '',
        template: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communications'] });
    },
    onError: () => {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/communications/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Notification has been successfully sent to recipients.",
      });
      setNotificationDialog(false);
      setNotificationData({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        specificUsers: [],
        courseId: '',
        actionUrl: '',
        scheduleDate: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communications'] });
    },
    onError: () => {
      toast({
        title: "Send Failed",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/communication-templates', {
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
        description: "Communication template has been successfully created.",
      });
      setTemplateDialog(false);
      setTemplateData({
        name: '',
        subject: '',
        content: '',
        type: 'email',
        variables: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communication-templates'] });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!emailData.subject || !emailData.message) return;
    sendEmailMutation.mutate(emailData);
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) return;
    sendNotificationMutation.mutate(notificationData);
  };

  const handleCreateTemplate = () => {
    if (!templateData.name || !templateData.content) return;
    createTemplateMutation.mutate(templateData);
  };

  const filteredCommunications = communications?.filter((comm: any) => {
    const matchesSearch = !searchQuery || 
      comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || comm.type === filterType;
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const stats = {
    totalSent: communications?.length || 0,
    emailsSent: communications?.filter((c: any) => c.type === 'email').length || 0,
    notificationsSent: communications?.filter((c: any) => c.type === 'notification').length || 0,
    activeTemplates: templates?.filter((t: any) => t.isActive).length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Communications Management" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Communications Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.emailsSent}</p>
              </div>
              <Mail className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-2xl font-bold">{stats.notificationsSent}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-500" />
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
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Communications</TabsTrigger>
          <TabsTrigger value="history">Communication History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send Email
                </CardTitle>
                <CardDescription>
                  Send emails to students, instructors, or specific groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Compose Email
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>

            {/* Send Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Send Notification
                </CardTitle>
                <CardDescription>
                  Send in-app notifications to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      Create Notification
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search communications..."
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
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communications History */}
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                View all sent communications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject/Title</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunications.map((communication: any) => (
                    <TableRow key={communication.id}>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {communication.type === 'email' ? (
                            <Mail className="w-3 h-3" />
                          ) : communication.type === 'notification' ? (
                            <Bell className="w-3 h-3" />
                          ) : (
                            <Phone className="w-3 h-3" />
                          )}
                          {communication.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{communication.subject || communication.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {communication.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{communication.recipientCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            communication.status === 'sent' ? 'default' :
                            communication.status === 'scheduled' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {communication.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {communication.sentAt 
                          ? format(new Date(communication.sentAt), 'MMM dd, yyyy HH:mm')
                          : communication.scheduledAt
                          ? format(new Date(communication.scheduledAt), 'MMM dd, yyyy HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {communication.status === 'scheduled' && (
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCommunications.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No communications found</h3>
                  <p className="text-gray-500">No communications match your current filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Communication Templates</CardTitle>
                  <CardDescription>
                    Create and manage reusable communication templates
                  </CardDescription>
                </div>
                <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates?.map((template: any) => (
                  <Card key={template.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                        </div>
                        <Badge variant="outline">
                          {template.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {template.content}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) || []}

                {(!templates || templates.length === 0) && (
                  <Card className="border-dashed border-2 col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Settings className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No templates created</h3>
                      <p className="text-gray-500 mb-4">Create your first communication template.</p>
                      <Button onClick={() => setTemplateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Send an email to students, instructors, or specific users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email-recipients">Recipients</Label>
                <Select value={emailData.recipients} onValueChange={(value) => setEmailData({ ...emailData, recipients: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="instructors">All Instructors</SelectItem>
                    <SelectItem value="course">Course Students</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {emailData.recipients === 'course' && (
                <div>
                  <Label htmlFor="email-course">Select Course</Label>
                  <Select value={emailData.courseId} onValueChange={(value) => setEmailData({ ...emailData, courseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose course" />
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
              )}
            </div>

            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Enter your email message..."
                className="min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="email-schedule">Schedule Send (Optional)</Label>
              <Input
                id="email-schedule"
                type="datetime-local"
                value={emailData.scheduleDate}
                onChange={(e) => setEmailData({ ...emailData, scheduleDate: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={!emailData.subject || !emailData.message || sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? 'Sending...' : emailData.scheduleDate ? 'Schedule Email' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Send an in-app notification to users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={notificationData.title}
                onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                placeholder="Enter notification title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification-type">Type</Label>
                <Select value={notificationData.type} onValueChange={(value) => setNotificationData({ ...notificationData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notification-recipients">Recipients</Label>
                <Select value={notificationData.recipients} onValueChange={(value) => setNotificationData({ ...notificationData, recipients: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="instructors">All Instructors</SelectItem>
                    <SelectItem value="course">Course Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                placeholder="Enter notification message..."
              />
            </div>

            <div>
              <Label htmlFor="notification-action">Action URL (Optional)</Label>
              <Input
                id="notification-action"
                value={notificationData.actionUrl}
                onChange={(e) => setNotificationData({ ...notificationData, actionUrl: e.target.value })}
                placeholder="/courses/123"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotificationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={!notificationData.title || !notificationData.message || sendNotificationMutation.isPending}
              >
                {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Communication Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for emails or notifications
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
                  placeholder="Welcome Email Template"
                />
              </div>

              <div>
                <Label htmlFor="template-type">Type</Label>
                <Select value={templateData.type} onValueChange={(value) => setTemplateData({ ...templateData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-subject">Subject/Title</Label>
              <Input
                id="template-subject"
                value={templateData.subject}
                onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                placeholder="Welcome to the course!"
              />
            </div>

            <div>
              <Label htmlFor="template-content">Content</Label>
              <Textarea
                id="template-content"
                value={templateData.content}
                onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                placeholder="Dear {{student_name}}, welcome to {{course_title}}..."
                className="min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="template-variables">Available Variables</Label>
              <Input
                id="template-variables"
                value={templateData.variables}
                onChange={(e) => setTemplateData({ ...templateData, variables: e.target.value })}
                placeholder="student_name, course_title, instructor_name"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={!templateData.name || !templateData.content || createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}