import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Search,
  Filter,
  Plus,
  Archive,
  Star,
  Reply,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  courseId?: string;
  courseName?: string;
  type: 'direct' | 'course' | 'announcement';
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  
  // New message form
  const [newMessage, setNewMessage] = useState({
    recipientId: "",
    subject: "",
    content: "",
    courseId: ""
  });

  // Fetch messages with mock data for testing
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      // Return mock data for testing since messages API may not be implemented
      return [
        {
          id: "1",
          subject: "Welcome to Advanced JavaScript Course",
          content: "Welcome to the Advanced JavaScript course! I'm excited to have you in class. Please review the syllabus and let me know if you have any questions.",
          senderId: "instructor-1",
          senderName: "Dr. Sarah Johnson",
          senderAvatar: "",
          recipientId: user?.id || "",
          recipientName: user?.firstName + " " + user?.lastName || "",
          isRead: false,
          isStarred: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          courseId: "course-1",
          courseName: "Advanced JavaScript",
          type: "course" as const
        },
        {
          id: "2",
          subject: "Assignment Feedback",
          content: "Great work on your latest assignment! You demonstrated excellent understanding of async/await patterns. Keep up the good work!",
          senderId: "instructor-2",
          senderName: "Prof. Michael Chen",
          senderAvatar: "",
          recipientId: user?.id || "",
          recipientName: user?.firstName + " " + user?.lastName || "",
          isRead: true,
          isStarred: true,
          isArchived: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          courseId: "course-2",
          courseName: "React Development",
          type: "direct" as const
        },
        {
          id: "3",
          subject: "System Maintenance Notice",
          content: "The learning platform will undergo scheduled maintenance this weekend from 2 AM to 6 AM EST. During this time, some features may be temporarily unavailable.",
          senderId: "admin-1",
          senderName: "LMS Administrator",
          senderAvatar: "",
          recipientId: user?.id || "",
          recipientName: user?.firstName + " " + user?.lastName || "",
          isRead: true,
          isStarred: false,
          isArchived: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          type: "announcement" as const
        }
      ];
    },
    retry: false,
  });

  // Fetch users for compose dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Fetch user's courses for course messages
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses/enrolled"],
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Mock implementation for testing
      console.log("Sending message:", messageData);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setComposeOpen(false);
      setNewMessage({ recipientId: "", subject: "", content: "", courseId: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log("Marking message as read:", messageId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Star message mutation
  const starMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log("Starring message:", messageId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log("Deleting message:", messageId);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Message Deleted",
        description: "The message has been deleted.",
      });
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate(newMessage);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const filteredMessages = messages.filter((message: Message) => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case "inbox":
        return !message.isArchived && message.recipientId === user?.id && matchesSearch;
      case "sent":
        return !message.isArchived && message.senderId === user?.id && matchesSearch;
      case "starred":
        return message.isStarred && matchesSearch;
      case "archived":
        return message.isArchived && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const unreadCount = messages.filter((msg: Message) => 
    !msg.isRead && msg.recipientId === user?.id && !msg.isArchived
  ).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with instructors and fellow students
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Send a message to an instructor or fellow student.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">To</label>
                    <Input
                      value={newMessage.recipientId}
                      onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                      placeholder="Enter recipient email or ID..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Course (Optional)</label>
                    <Input
                      value={newMessage.courseId}
                      onChange={(e) => setNewMessage({ ...newMessage, courseId: e.target.value })}
                      placeholder="Enter course ID..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      placeholder="Enter subject..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      placeholder="Type your message..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Message List */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="inbox" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Inbox
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                    <TabsTrigger value="starred">
                      <Star className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                      <Archive className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages found</p>
                      <p className="text-sm mt-1">
                        {activeTab === "inbox" ? "Your inbox is empty" : 
                         activeTab === "sent" ? "No sent messages" :
                         activeTab === "starred" ? "No starred messages" :
                         "No archived messages"}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-muted" : ""
                        } ${!message.isRead ? "border-l-4 border-l-primary" : ""}`}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.senderAvatar} />
                              <AvatarFallback>
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${!message.isRead ? "font-semibold" : ""}`}>
                                {activeTab === "sent" ? message.recipientName : message.senderName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.courseName && `${message.courseName} • `}
                                {new Date(message.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {message.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            <Badge variant={message.type === "announcement" ? "default" : "secondary"} className="text-xs">
                              {message.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <h4 className={`text-sm mb-1 truncate ${!message.isRead ? "font-semibold" : ""}`}>
                          {message.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={selectedMessage.senderAvatar} />
                        <AvatarFallback>
                          {selectedMessage.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {selectedMessage.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                          {selectedMessage.courseName && ` • ${selectedMessage.courseName}`}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => starMessageMutation.mutate(selectedMessage.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {selectedMessage.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                      {selectedMessage.content}
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      Forward
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Message Selected</h3>
                    <p>Select a message from the list to view its contents</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}