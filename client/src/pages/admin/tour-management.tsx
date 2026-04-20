import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Eye,
  Settings,
  BookOpen,
  Video,
  Image,
  FileText,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Star,
  Globe,
  Home,
  Users,
  Shield,
  Lightbulb,
  PlayCircle,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Clock,
  Target,
  Zap,
  Award,
  GraduationCap,
  MessageSquare,
  Download,
  Share
} from 'lucide-react';

interface TourSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'basics' | 'learning' | 'advanced' | 'teaching';
  duration: string;
  videoUrl?: string;
  isNew: boolean;
  isActive: boolean;
  order: number;
  steps: TourStep[];
}

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
}

interface TourFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  order: number;
  tags: string[];
}

interface TourSettings {
  introVideoUrl: string;
  welcomeMessage: string;
  completionMessage: string;
  showProgressIndicator: boolean;
  autoStartForNewUsers: boolean;
  enableSearch: boolean;
  enableCategories: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export default function TourManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingSection, setEditingSection] = useState<TourSection | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<TourFAQ | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch tour data
  const { data: tourSections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['/api/admin/tour-sections'],
    retry: false,
  });

  const { data: tourFAQs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ['/api/admin/tour-faqs'],
    retry: false,
  });

  const { data: tourSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/tour-settings'],
    retry: false,
  });

  // Mutations
  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: Partial<TourSection>) => {
      return await apiRequest('POST', '/api/admin/tour-sections', sectionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-sections'] });
      toast({ title: "Success", description: "Tour section created successfully" });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create tour section", variant: "destructive" });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TourSection> & { id: string }) => {
      return await apiRequest('PUT', `/api/admin/tour-sections/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-sections'] });
      toast({ title: "Success", description: "Tour section updated successfully" });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update tour section", variant: "destructive" });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/tour-sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-sections'] });
      toast({ title: "Success", description: "Tour section deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete tour section", variant: "destructive" });
    },
  });

  const createFAQMutation = useMutation({
    mutationFn: async (faqData: Partial<TourFAQ>) => {
      return await apiRequest('POST', '/api/admin/tour-faqs', faqData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-faqs'] });
      toast({ title: "Success", description: "FAQ created successfully" });
      setEditingFAQ(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create FAQ", variant: "destructive" });
    },
  });

  const updateFAQMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TourFAQ> & { id: string }) => {
      return await apiRequest('PUT', `/api/admin/tour-faqs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-faqs'] });
      toast({ title: "Success", description: "FAQ updated successfully" });
      setEditingFAQ(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update FAQ", variant: "destructive" });
    },
  });

  const deleteFAQMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/tour-faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-faqs'] });
      toast({ title: "Success", description: "FAQ deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete FAQ", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<TourSettings>) => {
      return await apiRequest('PUT', '/api/admin/tour-settings', settingsData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tour-settings'] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  // Filter functions
  const filteredSections = Array.isArray(tourSections) ? tourSections.filter((section: any) => {
    const matchesSearch = section.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const filteredFAQs = Array.isArray(tourFAQs) ? tourFAQs.filter((faq: any) => {
    const matchesSearch = faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const categoryIcons = {
    basics: Home,
    learning: BookOpen,
    advanced: Zap,
    teaching: GraduationCap,
  };

  const categoryColors = {
    basics: 'bg-blue-100 text-blue-700 border-blue-200',
    learning: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    advanced: 'bg-purple-100 text-purple-700 border-purple-200',
    teaching: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Tour Management
              </h1>
              <p className="text-slate-600">
                Customize onboarding experiences, FAQs, and interactive guides
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview Tour
              </Button>
              <Button
                onClick={() => setEditingSection({ 
                  id: '', title: '', description: '', icon: 'BookOpen', 
                  category: 'basics', duration: '5 min', isNew: false, 
                  isActive: true, order: 0, steps: [] 
                })}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Tour Section
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Tours</p>
                  <p className="text-2xl font-bold">{filteredSections.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Active FAQs</p>
                  <p className="text-2xl font-bold">{filteredFAQs.filter((faq: any) => faq.isActive).length}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Categories</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <Target className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <Award className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tours, FAQs, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="basics">Basics</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Interactive Tours
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ Guide
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-red-600" />
                    Introduction Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <PlayCircle className="h-12 w-12 mx-auto text-slate-400" />
                      <p className="text-sm text-muted-foreground">Welcome Video Preview</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intro-video">Video URL</Label>
                    <Input 
                      id="intro-video"
                      placeholder="https://youtube.com/watch?v=..."
                      defaultValue={tourSettings?.introVideoUrl || ''}
                    />
                  </div>
                  <Button className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Update Video
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Welcome Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Take a Tour of Meeting Matters</h3>
                    <p className="text-blue-700 text-sm">
                      Welcome to your learning journey! Explore our platform with this comprehensive, 
                      interactive tour designed to help you master every feature.
                    </p>
                  </div>
                  <Textarea
                    placeholder="Customize welcome message..."
                    className="min-h-[100px]"
                    defaultValue={tourSettings?.welcomeMessage || ''}
                  />
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Message
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Video className="h-6 w-6 text-red-600" />
                    <span className="font-medium">Watch Introduction Video</span>
                    <span className="text-xs text-muted-foreground">Preview the welcome experience</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Start Interactive Tour</span>
                    <span className="text-xs text-muted-foreground">Test the guided walkthrough</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <HelpCircle className="h-6 w-6 text-emerald-600" />
                    <span className="font-medium">View FAQ Guide</span>
                    <span className="text-xs text-muted-foreground">Browse help documentation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
            <div className="grid gap-6">
              {filteredSections.map((section: any, index: number) => {
                const IconComponent = categoryIcons[section.category as keyof typeof categoryIcons] || BookOpen;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={cn(
                              "p-3 rounded-lg",
                              categoryColors[section.category as keyof typeof categoryColors]
                            )}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                {section.isNew && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    New
                                  </Badge>
                                )}
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    categoryColors[section.category as keyof typeof categoryColors]
                                  )}
                                >
                                  {section.category}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{section.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {section.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {section.steps?.length || 0} steps
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  {section.isActive ? 'Active' : 'Inactive'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSection(section)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSectionMutation.mutate(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {filteredSections.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tour sections found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first interactive tour to guide users through your platform.
                    </p>
                    <Button
                      onClick={() => setEditingSection({ 
                        id: '', title: '', description: '', icon: 'BookOpen', 
                        category: 'basics', duration: '5 min', isNew: false, 
                        isActive: true, order: 0, steps: [] 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tour Section
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">FAQ Management</h2>
                <p className="text-muted-foreground">Manage frequently asked questions and help content</p>
              </div>
              <Button
                onClick={() => setEditingFAQ({ 
                  id: '', question: '', answer: '', category: 'basics', 
                  isActive: true, order: 0, tags: [] 
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq: any, index: number) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{faq.question}</h3>
                            <Badge 
                              variant="outline"
                              className={cn(
                                "text-xs",
                                categoryColors[faq.category as keyof typeof categoryColors]
                              )}
                            >
                              {faq.category}
                            </Badge>
                            {!faq.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {faq.answer}
                          </p>
                          {faq.tags && faq.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {faq.tags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingFAQ(faq)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFAQMutation.mutate(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredFAQs.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create helpful FAQ content to assist your users.
                    </p>
                    <Button
                      onClick={() => setEditingFAQ({ 
                        id: '', question: '', answer: '', category: 'basics', 
                        isActive: true, order: 0, tags: [] 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create FAQ
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Tour Configuration</CardTitle>
                  <CardDescription>Configure how tours are displayed and behave</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-start for new users</Label>
                      <p className="text-xs text-muted-foreground">Automatically start tour for first-time users</p>
                    </div>
                    <Switch defaultChecked={tourSettings?.autoStartForNewUsers} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Show progress indicator</Label>
                      <p className="text-xs text-muted-foreground">Display progress bar during tours</p>
                    </div>
                    <Switch defaultChecked={tourSettings?.showProgressIndicator} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable search</Label>
                      <p className="text-xs text-muted-foreground">Allow users to search tour content</p>
                    </div>
                    <Switch defaultChecked={tourSettings?.enableSearch} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable categories</Label>
                      <p className="text-xs text-muted-foreground">Show category filters in tour interface</p>
                    </div>
                    <Switch defaultChecked={tourSettings?.enableCategories} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of tours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        defaultValue={tourSettings?.primaryColor || '#3b82f6'}
                        className="w-16 h-10" 
                      />
                      <Input 
                        defaultValue={tourSettings?.primaryColor || '#3b82f6'}
                        placeholder="#3b82f6" 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        defaultValue={tourSettings?.secondaryColor || '#10b981'}
                        className="w-16 h-10" 
                      />
                      <Input 
                        defaultValue={tourSettings?.secondaryColor || '#10b981'}
                        placeholder="#10b981" 
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Completion Message</Label>
                    <Textarea
                      placeholder="Congratulations! You've completed the tour..."
                      defaultValue={tourSettings?.completionMessage || ''}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Export Configuration</h3>
                    <p className="text-sm text-muted-foreground">Download tour settings and content</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? 'Edit Tour Section' : 'Create Tour Section'}
            </DialogTitle>
            <DialogDescription>
              Configure the tour section details and interactive steps
            </DialogDescription>
          </DialogHeader>
          {editingSection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingSection.category}
                    onValueChange={(value) => setEditingSection({...editingSection, category: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basics">Basics</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="teaching">Teaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({...editingSection, description: e.target.value})}
                  placeholder="Brief description of what this tour covers"
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={editingSection.duration}
                    onChange={(e) => setEditingSection({...editingSection, duration: e.target.value})}
                    placeholder="e.g., 5 min"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video URL (optional)</Label>
                  <Input
                    value={editingSection.videoUrl || ''}
                    onChange={(e) => setEditingSection({...editingSection, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSection.isActive}
                    onCheckedChange={(checked) => setEditingSection({...editingSection, isActive: checked})}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSection.isNew}
                    onCheckedChange={(checked) => setEditingSection({...editingSection, isNew: checked})}
                  />
                  <Label>Mark as New</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingSection.id) {
                      updateSectionMutation.mutate(editingSection);
                    } else {
                      createSectionMutation.mutate(editingSection);
                    }
                  }}
                  disabled={createSectionMutation.isPending || updateSectionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingSection.id ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={() => setEditingFAQ(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ?.id ? 'Edit FAQ' : 'Create FAQ'}
            </DialogTitle>
            <DialogDescription>
              Add helpful information for your users
            </DialogDescription>
          </DialogHeader>
          {editingFAQ && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({...editingFAQ, question: e.target.value})}
                  placeholder="What question are you answering?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({...editingFAQ, answer: e.target.value})}
                  placeholder="Provide a helpful answer..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingFAQ.category}
                    onValueChange={(value) => setEditingFAQ({...editingFAQ, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basics">Basics</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="teaching">Teaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={editingFAQ.isActive}
                    onCheckedChange={(checked) => setEditingFAQ({...editingFAQ, isActive: checked})}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={editingFAQ.tags?.join(', ') || ''}
                  onChange={(e) => setEditingFAQ({...editingFAQ, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                  placeholder="help, getting-started, features"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingFAQ(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingFAQ.id) {
                      updateFAQMutation.mutate(editingFAQ);
                    } else {
                      createFAQMutation.mutate(editingFAQ);
                    }
                  }}
                  disabled={createFAQMutation.isPending || updateFAQMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingFAQ.id ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Tour Preview</DialogTitle>
            <DialogDescription>
              Preview how the tour appears to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Tour Interface Preview */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Take a Tour of Meeting Matters</h2>
                <p className="text-blue-100">
                  Welcome to your learning journey! Explore our platform with this comprehensive, 
                  interactive tour designed to help you master every feature.
                </p>
              </div>
              <div className="flex justify-center gap-4 mb-6">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Introduction Video
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Interactive Tour
                </Button>
              </div>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <HelpCircle className="h-4 w-4 mr-2" />
                View FAQ Guide
              </Button>
            </div>

            {/* Category Tabs Preview */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-center mb-4">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {['All', 'Basics', 'Learning', 'Advanced', 'Teaching'].map((tab) => (
                    <button key={tab} className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white">
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tour sections..." className="pl-10" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSections.slice(0, 4).map((section: any) => {
                  const IconComponent = categoryIcons[section.category as keyof typeof categoryIcons] || BookOpen;
                  return (
                    <div key={section.id} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "p-2 rounded-lg",
                          categoryColors[section.category as keyof typeof categoryColors]
                        )}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{section.title}</h3>
                          <p className="text-xs text-muted-foreground">{section.duration}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{section.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}