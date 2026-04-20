import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Video,
  PlayCircle,
  Search,
  Clock,
  Users,
  Star,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Home,
  Zap,
  GraduationCap,
  Target,
  CheckCircle,
  ArrowRight,
  X,
  Maximize2,
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipForward,
  RotateCcw
} from 'lucide-react';

interface TourInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
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

export default function TourInterface({ isOpen, onClose }: TourInterfaceProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<TourSection | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  // Fetch tour data
  const { data: tourSections = [] } = useQuery({
    queryKey: ['/api/admin/tour-sections'],
    retry: false,
  });

  const { data: tourFAQs = [] } = useQuery({
    queryKey: ['/api/admin/tour-faqs'],
    retry: false,
  });

  const { data: tourSettings } = useQuery({
    queryKey: ['/api/admin/tour-settings'],
    retry: false,
  });

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

  // Filter sections based on search and category
  const filteredSections = Array.isArray(tourSections) ? tourSections.filter((section: any) => {
    const matchesSearch = section.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || section.category === activeTab;
    return matchesSearch && matchesCategory && section.isActive;
  }) : [];

  const filteredFAQs = Array.isArray(tourFAQs) ? tourFAQs.filter((faq: any) => {
    const matchesSearch = faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || faq.category === activeTab;
    return matchesSearch && matchesCategory && faq.isActive;
  }) : [];

  const startTourSection = (section: TourSection) => {
    setSelectedSection(section);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (selectedSection && currentStep < selectedSection.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const progress = selectedSection ? 
    ((currentStep + 1) / selectedSection.steps.length) * 100 : 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="relative h-full">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-center">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Target className="h-8 w-8" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold">Take a Tour of Meeting Matters</h1>
                  <p className="text-blue-100 max-w-2xl mx-auto">
                    Welcome to your learning journey! Explore our platform with this comprehensive, 
                    interactive tour designed to help you master every feature.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center gap-4"
                >
                  <Button
                    onClick={() => setShowVideo(true)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Watch Introduction Video
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Interactive Tour
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    View FAQ Guide
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tour sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-blue-500"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="basics" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Basics
                </TabsTrigger>
                <TabsTrigger value="learning" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Learning
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="teaching" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Teaching
                </TabsTrigger>
              </TabsList>

              {/* Tour Sections Content */}
              <div className="mt-6">
                <ScrollArea className="h-[400px]">
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredSections.map((section: any) => {
                      const IconComponent = categoryIcons[section.category as keyof typeof categoryIcons] || BookOpen;
                      return (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="border-2 hover:border-blue-300 transition-all duration-200 cursor-pointer h-full">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg flex-shrink-0",
                                  categoryColors[section.category as keyof typeof categoryColors]
                                )}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-sm truncate">{section.title}</h3>
                                    {section.isNew && (
                                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {section.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {section.duration}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {section.steps?.length || 0} steps
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => startTourSection(section)}
                                      className="h-7 px-3 text-xs"
                                    >
                                      Start
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {filteredSections.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tour sections found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search terms' : 'No tours available for this category'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Video Modal */}
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-red-600" />
                Introduction Video
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {tourSettings?.introVideoUrl ? (
                  <iframe
                    src={tourSettings.introVideoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Introduction Video"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <PlayCircle className="h-16 w-16 mx-auto text-slate-400" />
                    <div>
                      <h3 className="font-semibold text-slate-600">Welcome to Meeting Matters</h3>
                      <p className="text-sm text-muted-foreground">
                        Your introduction video will appear here
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoPlaying(!videoPlaying)}
                      >
                        {videoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoMuted(!videoMuted)}
                      >
                        {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Video
                </Button>
                <Button onClick={() => setShowVideo(false)}>
                  Continue to Tour
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Interactive Tour Modal */}
        <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            {selectedSection && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                      {selectedSection.title}
                    </DialogTitle>
                    <Badge variant="outline" className="text-xs">
                      Step {currentStep + 1} of {selectedSection.steps.length}
                    </Badge>
                  </div>
                  <Progress value={progress} className="mt-2" />
                </DialogHeader>

                <div className="space-y-6">
                  {selectedSection.steps[currentStep] && (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-lg mb-2 text-blue-900">
                          {selectedSection.steps[currentStep].title}
                        </h3>
                        <p className="text-blue-700">
                          {selectedSection.steps[currentStep].content}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          Target: {selectedSection.steps[currentStep].target}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSection(null)}
                      >
                        Exit Tour
                      </Button>
                      <Button
                        onClick={() => {
                          if (currentStep < selectedSection.steps.length - 1) {
                            nextStep();
                          } else {
                            setSelectedSection(null);
                          }
                        }}
                      >
                        {currentStep < selectedSection.steps.length - 1 ? 'Next Step' : 'Complete Tour'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}