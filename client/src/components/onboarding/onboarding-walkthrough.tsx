import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  Users, 
  MessageCircle, 
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  Trophy,
  Heart,
  Video,
  Navigation,
  Settings,
  FileText,
  Calendar,
  Zap,
  Rocket,
  Star,
  Globe,
  Shield,
  Lightbulb,
  Camera,
  Headphones,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Grid,
  List,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  Home,
  User,
  BookmarkPlus,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { FAQSection } from './faq-section';

interface TourSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basics' | 'learning' | 'advanced' | 'instructor' | 'admin';
  duration: string;
  steps: TourStep[];
  videoUrl?: string;
  isNew?: boolean;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  tips?: string[];
  demo?: boolean;
}

const tourSections: TourSection[] = [
  {
    id: 'welcome-intro',
    title: 'Welcome to Meeting Matters',
    description: 'Get started with our comprehensive learning platform',
    icon: <Sparkles className="h-6 w-6" />,
    category: 'basics',
    duration: '3 min',
    videoUrl: '/intro-video.mp4',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Your Learning Journey',
        description: 'Meeting Matters is your complete learning management system designed to help you master new skills and achieve your goals.',
        position: 'center',
        tips: ['Navigate using the sidebar menu', 'Use the search bar to find content quickly', 'Check your progress in the dashboard']
      }
    ]
  },
  {
    id: 'navigation-basics',
    title: 'Platform Navigation',
    description: 'Master the interface and core navigation features',
    icon: <Navigation className="h-6 w-6" />,
    category: 'basics',
    duration: '5 min',
    steps: [
      {
        id: 'dashboard',
        title: 'Your Dashboard',
        description: 'The dashboard shows your learning progress, enrolled courses, and recent activity.',
        targetElement: '[data-tour="dashboard"]',
        position: 'bottom',
        action: { label: 'View Dashboard', href: '/dashboard' },
        tips: ['Check daily progress here', 'View upcoming deadlines', 'Access quick course links']
      },
      {
        id: 'sidebar',
        title: 'Navigation Menu',
        description: 'Use the sidebar to access all platform features including courses, messages, and settings.',
        targetElement: '[data-tour="sidebar"]',
        position: 'right',
        tips: ['Hover to expand menu items', 'Access all features from here', 'Use keyboard shortcuts for speed']
      },
      {
        id: 'search',
        title: 'Global Search',
        description: 'Find courses, content, instructors, and resources instantly with our powerful search.',
        targetElement: '[data-tour="search"]',
        position: 'bottom',
        demo: true,
        tips: ['Use filters to narrow results', 'Search by topic, instructor, or difficulty', 'Save searches for later']
      }
    ]
  },
  {
    id: 'enrollment-mastery',
    title: 'Course Enrollment Guide',
    description: 'Master the complete enrollment process from discovery to access',
    icon: <BookmarkPlus className="h-6 w-6" />,
    category: 'learning',
    duration: '8 min',
    isNew: true,
    steps: [
      {
        id: 'course-discovery',
        title: 'Finding the Right Course',
        description: 'Use our advanced search and filtering to discover courses that match your learning goals and skill level.',
        action: { label: 'Explore Courses', href: '/courses' },
        position: 'center',
        tips: ['Use category filters to narrow options', 'Check prerequisites before enrolling', 'Read student reviews and ratings', 'Preview course content with sample lessons']
      },
      {
        id: 'enrollment-process',
        title: 'Enrollment Steps',
        description: 'Complete enrollment in just a few clicks. For paid courses, secure payment processing ensures your data is protected.',
        position: 'center',
        demo: true,
        tips: ['Free courses start immediately', 'Paid courses require payment confirmation', 'Check for available discounts', 'Review refund policy before purchasing']
      },
      {
        id: 'post-enrollment',
        title: 'After Enrollment',
        description: 'Access your course immediately and start learning. Your progress is automatically saved.',
        action: { label: 'View Dashboard', href: '/dashboard' },
        position: 'center',
        tips: ['Bookmark important lessons', 'Set learning schedule reminders', 'Join course discussion forums', 'Download mobile app for offline access']
      }
    ]
  },
  {
    id: 'payment-billing',
    title: 'Payments & Billing',
    description: 'Understand payment options, billing, and refund policies',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'basics',
    duration: '6 min',
    isNew: true,
    steps: [
      {
        id: 'payment-methods',
        title: 'Payment Options',
        description: 'We accept credit cards, PayPal, and bank transfers. All transactions are secured with industry-standard encryption.',
        position: 'center',
        tips: ['Save payment methods for faster checkout', 'Look for student discounts', 'Consider annual subscriptions for savings', 'Corporate billing available for teams']
      },
      {
        id: 'pricing-discounts',
        title: 'Pricing & Discounts',
        description: 'Take advantage of student discounts, early bird pricing, and promotional offers to save on courses.',
        action: { label: 'View Promotions', href: '/promotions' },
        position: 'center',
        tips: ['Verify student status for 20% discount', 'Sign up for promotional emails', 'Bundle courses for better pricing', 'Check for seasonal sales']
      },
      {
        id: 'billing-management',
        title: 'Billing Management',
        description: 'View payment history, download receipts, and manage subscription billing from your account settings.',
        action: { label: 'Billing Settings', href: '/settings/billing' },
        position: 'center',
        tips: ['Download receipts for tax purposes', 'Update payment methods before expiration', 'Cancel subscriptions anytime', 'Contact support for billing issues']
      }
    ]
  },
  {
    id: 'certificates-achievements',
    title: 'Certificates & Achievements',
    description: 'Earn, download, and verify your learning certificates',
    icon: <Award className="h-6 w-6" />,
    category: 'learning',
    duration: '5 min',
    isNew: true,
    steps: [
      {
        id: 'earning-certificates',
        title: 'How to Earn Certificates',
        description: 'Complete all course modules, pass quizzes with 80% or higher, and submit required assignments to earn your certificate.',
        position: 'center',
        tips: ['Track progress in real-time', 'Retake quizzes to improve scores', 'Submit assignments before deadlines', 'Attend live sessions if required']
      },
      {
        id: 'download-certificates',
        title: 'Downloading Certificates',
        description: 'Access and download your certificates in PDF format. Each certificate includes a unique verification code for authenticity.',
        action: { label: 'My Certificates', href: '/certificates' },
        position: 'center',
        demo: true,
        tips: ['Certificates available immediately after completion', 'Download high-quality PDFs for printing', 'Share on LinkedIn and social media', 'Keep digital copies for your records']
      },
      {
        id: 'certificate-verification',
        title: 'Certificate Verification',
        description: 'Your certificates can be verified by employers or institutions using the unique verification code printed on each certificate.',
        action: { label: 'Verify Certificate', href: '/verify' },
        position: 'center',
        tips: ['Verification codes prevent fraud', 'Instant verification online', 'Employer verification instructions included', 'Certificates remain valid indefinitely']
      }
    ]
  },
  {
    id: 'course-discovery',
    title: 'Discovering Courses',
    description: 'Find and enroll in courses that match your learning goals',
    icon: <BookOpen className="h-6 w-6" />,
    category: 'learning',
    duration: '7 min',
    steps: [
      {
        id: 'course-catalog',
        title: 'Course Catalog',
        description: 'Browse our extensive library of courses organized by categories and skill levels.',
        action: { label: 'Browse Courses', href: '/courses' },
        position: 'center',
        tips: ['Filter by difficulty level', 'Check course ratings and reviews', 'Preview course content before enrolling']
      },
      {
        id: 'course-details',
        title: 'Course Information',
        description: 'View detailed course information including curriculum, instructor bio, and student reviews.',
        position: 'center',
        tips: ['Read the full course description', 'Check prerequisites', 'View instructor credentials']
      },
      {
        id: 'enrollment',
        title: 'Course Enrollment',
        description: 'Enroll in courses and manage your learning schedule.',
        position: 'center',
        tips: ['Add courses to wishlist first', 'Check your schedule before enrolling', 'Set learning goals and deadlines']
      }
    ]
  },
  {
    id: 'learning-experience',
    title: 'Interactive Learning',
    description: 'Explore videos, quizzes, assignments, and multimedia content',
    icon: <PlayCircle className="h-6 w-6" />,
    category: 'learning',
    duration: '8 min',
    isNew: true,
    steps: [
      {
        id: 'video-player',
        title: 'Video Learning',
        description: 'Watch high-quality video lessons with interactive features like speed control and note-taking.',
        position: 'center',
        demo: true,
        tips: ['Adjust playback speed as needed', 'Take notes while watching', 'Use keyboard shortcuts for control']
      },
      {
        id: 'audio-content',
        title: 'Audio Lessons',
        description: 'Listen to audio content and podcasts for learning on the go.',
        position: 'center',
        tips: ['Download for offline listening', 'Use the audio player controls', 'Create custom playlists']
      },
      {
        id: 'interactive-quizzes',
        title: 'Quizzes and Assessments',
        description: 'Test your knowledge with interactive quizzes and receive instant feedback.',
        position: 'center',
        demo: true,
        tips: ['Review explanations for wrong answers', 'Retake quizzes to improve scores', 'Track quiz performance over time']
      },
      {
        id: 'assignments',
        title: 'Assignments and Projects',
        description: 'Complete practical assignments and submit your work for instructor feedback.',
        position: 'center',
        tips: ['Read assignment requirements carefully', 'Submit before deadlines', 'Use the file upload feature']
      }
    ]
  },
  {
    id: 'progress-tracking',
    title: 'Progress and Achievements',
    description: 'Monitor your learning progress and earn certificates',
    icon: <Trophy className="h-6 w-6" />,
    category: 'learning',
    duration: '4 min',
    steps: [
      {
        id: 'progress-dashboard',
        title: 'Learning Progress',
        description: 'Track your completion rates, time spent learning, and skill development.',
        position: 'center',
        tips: ['Set daily learning goals', 'Review weekly progress reports', 'Compare progress across courses']
      },
      {
        id: 'certificates',
        title: 'Certificates and Badges',
        description: 'Earn certificates upon course completion and collect achievement badges.',
        action: { label: 'View Certificates', href: '/certificates' },
        position: 'center',
        tips: ['Download PDF certificates', 'Share achievements on social media', 'Add certificates to your portfolio']
      }
    ]
  },
  {
    id: 'communication',
    title: 'Messages and Community',
    description: 'Connect with instructors and fellow learners',
    icon: <MessageCircle className="h-6 w-6" />,
    category: 'learning',
    duration: '5 min',
    steps: [
      {
        id: 'messaging-system',
        title: 'Messaging Platform',
        description: 'Send messages to instructors and classmates, organize conversations by course.',
        action: { label: 'Open Messages', href: '/messages' },
        position: 'center',
        tips: ['Use course-specific message threads', 'Star important messages', 'Enable notification preferences']
      },
      {
        id: 'discussion-forums',
        title: 'Course Discussions',
        description: 'Participate in course discussions, ask questions, and help other students.',
        position: 'center',
        tips: ['Search previous discussions first', 'Use clear, descriptive titles', 'Vote on helpful responses']
      }
    ]
  },
  {
    id: 'instructor-tools',
    title: 'Instructor Features',
    description: 'Create and manage courses, track student progress',
    icon: <Users className="h-6 w-6" />,
    category: 'instructor',
    duration: '12 min',
    steps: [
      {
        id: 'course-creation',
        title: 'Creating Courses',
        description: 'Use our course builder to create engaging content with videos, quizzes, and assignments.',
        action: { label: 'Create Course', href: '/instructor/courses/create' },
        position: 'center',
        tips: ['Plan your course structure first', 'Use templates for consistency', 'Preview before publishing']
      },
      {
        id: 'content-management',
        title: 'Content Upload',
        description: 'Upload videos, audio files, PDFs, and other learning materials.',
        position: 'center',
        demo: true,
        tips: ['Optimize file sizes for faster loading', 'Use descriptive file names', 'Organize content in modules']
      },
      {
        id: 'student-analytics',
        title: 'Student Analytics',
        description: 'Monitor student progress, engagement, and performance across your courses.',
        action: { label: 'View Analytics', href: '/instructor' },
        position: 'center',
        tips: ['Check engagement metrics regularly', 'Identify struggling students early', 'Use data to improve content']
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Platform Features',
    description: 'Explore advanced tools and customization options',
    icon: <Settings className="h-6 w-6" />,
    category: 'advanced',
    duration: '6 min',
    isNew: true,
    steps: [
      {
        id: 'note-taking',
        title: 'Digital Notebook',
        description: 'Take notes, bookmark content, and organize your learning materials.',
        action: { label: 'Open Notebook', href: '/notebook' },
        position: 'center',
        tips: ['Organize notes by course or topic', 'Use tags for easy searching', 'Export notes as needed']
      },
      {
        id: 'calendar-integration',
        title: 'Learning Calendar',
        description: 'Schedule study sessions, set reminders, and track deadlines.',
        position: 'center',
        tips: ['Sync with external calendars', 'Set study reminders', 'Block time for focused learning']
      },
      {
        id: 'offline-learning',
        title: 'Offline Access',
        description: 'Download content for offline learning when internet access is limited.',
        position: 'center',
        tips: ['Download before traveling', 'Manage storage space', 'Sync progress when back online']
      }
    ]
  },
  {
    id: 'technical-support',
    title: 'Technical Support & Troubleshooting',
    description: 'Get help with technical issues and platform navigation',
    icon: <Settings className="h-6 w-6" />,
    category: 'basics',
    duration: '4 min',
    isNew: true,
    steps: [
      {
        id: 'common-issues',
        title: 'Common Technical Issues',
        description: 'Solutions for frequent problems like login issues, video playback problems, and browser compatibility.',
        position: 'center',
        tips: ['Clear browser cache and cookies', 'Try different browsers (Chrome, Firefox, Safari)', 'Check internet connection speed', 'Disable browser extensions temporarily']
      },
      {
        id: 'platform-navigation',
        title: 'Platform Navigation',
        description: 'Learn to navigate between different sections, access your courses, and find important features quickly.',
        action: { label: 'Dashboard Tour', href: '/dashboard' },
        position: 'center',
        tips: ['Use breadcrumb navigation', 'Bookmark frequently accessed pages', 'Keyboard shortcuts available', 'Mobile app provides offline access']
      },
      {
        id: 'contact-support',
        title: 'Getting Help',
        description: 'Multiple ways to get support: live chat, email support, help documentation, and community forums.',
        action: { label: 'Contact Support', href: '/support' },
        position: 'center',
        tips: ['Live chat available 9 AM - 6 PM EST', 'Email support responds within 24 hours', 'Check FAQ before contacting support', 'Community forums for peer help']
      }
    ]
  },
  {
    id: 'learning-analytics',
    title: 'Progress Tracking & Analytics',
    description: 'Monitor your learning progress and achievements',
    icon: <Trophy className="h-6 w-6" />,
    category: 'learning',
    duration: '6 min',
    isNew: true,
    steps: [
      {
        id: 'progress-dashboard',
        title: 'Progress Dashboard',
        description: 'View detailed analytics of your learning journey including completion rates, time spent, and skill development.',
        action: { label: 'View Progress', href: '/progress' },
        position: 'center',
        tips: ['Set weekly learning goals', 'Track streak counters', 'Compare progress with peers', 'Export progress reports']
      },
      {
        id: 'learning-analytics',
        title: 'Learning Analytics',
        description: 'Understand your learning patterns, strengths, and areas for improvement with detailed analytics.',
        position: 'center',
        demo: true,
        tips: ['Review quiz performance trends', 'Identify knowledge gaps', 'Optimize study schedule', 'Set personalized learning paths']
      },
      {
        id: 'achievement-system',
        title: 'Achievements & Badges',
        description: 'Earn badges and achievements for completing milestones, maintaining streaks, and excelling in assessments.',
        action: { label: 'View Achievements', href: '/achievements' },
        position: 'center',
        tips: ['Share achievements on social media', 'Unlock special content with badges', 'Compete in learning challenges', 'Build your learning portfolio']
      }
    ]
  }
];

interface OnboardingWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingWalkthrough({ isOpen, onClose, onComplete }: OnboardingWalkthroughProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'tour' | 'video' | 'faq'>('overview');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('OnboardingWalkthrough isOpen changed:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredSections = tourSections.filter(section => {
    const matchesSearch = searchQuery === '' || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.steps.some(step => 
        step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesRole = section.category === 'basics' || 
      section.category === 'learning' ||
      section.category === 'advanced' ||
      (section.category === 'instructor' && (user?.role === 'instructor' || user?.role === 'admin')) ||
      (section.category === 'admin' && user?.role === 'admin');
    
    return matchesSearch && matchesRole;
  });

  const currentSection = selectedSection ? tourSections.find(s => s.id === selectedSection) : null;
  const currentStep = currentSection?.steps[currentStepIndex];

  const nextStep = () => {
    if (currentSection && currentStepIndex < currentSection.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleSectionComplete();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSectionComplete = () => {
    if (selectedSection && !completedSections.includes(selectedSection)) {
      setCompletedSections([...completedSections, selectedSection]);
    }
    setActiveView('overview');
    setSelectedSection(null);
    setCurrentStepIndex(0);
  };

  const handleClose = () => {
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const startTour = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentStepIndex(0);
    setActiveView('tour');
  };

  const watchIntroVideo = () => {
    setActiveView('video');
    setIsVideoPlaying(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <Home className="h-4 w-4" />;
      case 'learning': return <BookOpen className="h-4 w-4" />;
      case 'advanced': return <Settings className="h-4 w-4" />;
      case 'instructor': return <Users className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'from-blue-500 to-indigo-500';
      case 'learning': return 'from-green-500 to-emerald-500';
      case 'advanced': return 'from-purple-500 to-violet-500';
      case 'instructor': return 'from-orange-500 to-red-500';
      case 'admin': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <X className="h-6 w-6" />
        </motion.button>

        {/* Main Content Container */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-6xl"
          >
            {/* Overview View */}
            {activeView === 'overview' && (
              <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl max-h-[90vh] flex flex-col">
                <CardHeader className="text-center pb-6 flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 mb-4"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                      <Rocket className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Take a Tour of Meeting Matters
                    </CardTitle>
                  </motion.div>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Welcome to your learning journey! Explore our platform with this comprehensive, interactive tour designed to help you master every feature.
                  </p>
                </CardHeader>

                <CardContent className="p-8 overflow-y-auto flex-1">
                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-4 justify-center mb-8"
                  >
                    <Button
                      onClick={watchIntroVideo}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 text-lg font-semibold"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Watch Introduction Video
                    </Button>
                    <Button
                      onClick={() => startTour('welcome-intro')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 text-lg font-semibold"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Interactive Tour
                    </Button>
                    <Button
                      onClick={() => setActiveView('faq')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 text-lg font-semibold"
                    >
                      <HelpCircle className="h-5 w-5 mr-2" />
                      View FAQ Guide
                    </Button>
                  </motion.div>

                  {/* Search Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mb-8 max-w-md mx-auto"
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search tour sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 py-3 text-lg border-2 focus:border-blue-500 rounded-lg"
                    />
                  </motion.div>

                  {/* Tour Sections */}
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6">
                      <TabsTrigger value="all" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
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
                        <Settings className="h-4 w-4" />
                        Advanced
                      </TabsTrigger>
                      {(user?.role === 'instructor' || user?.role === 'admin') && (
                        <TabsTrigger value="instructor" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Teaching
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSections.map((section, index) => (
                          <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                                completedSections.includes(section.id) 
                                  ? 'border-green-200 bg-green-50' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => startTour(section.id)}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`p-3 rounded-full bg-gradient-to-r ${getCategoryColor(section.category)}`}>
                                    {section.icon}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {section.isNew && (
                                      <Badge variant="destructive" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                    {completedSections.includes(section.id) && (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {section.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {section.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    {getCategoryIcon(section.category)}
                                    <span className="capitalize">{section.category}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{section.duration}</span>
                                  </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      {section.steps.length} steps
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-blue-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    {['basics', 'learning', 'advanced', 'instructor'].map((category) => (
                      <TabsContent key={category} value={category} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredSections.filter(s => s.category === category).map((section, index) => (
                            <motion.div
                              key={section.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card 
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                                  completedSections.includes(section.id) 
                                    ? 'border-green-200 bg-green-50' 
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => startTour(section.id)}
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-full bg-gradient-to-r ${getCategoryColor(section.category)}`}>
                                      {section.icon}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {section.isNew && (
                                        <Badge variant="destructive" className="text-xs">
                                          New
                                        </Badge>
                                      )}
                                      {completedSections.includes(section.id) && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {section.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-4">
                                    {section.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{section.duration}</span>
                                    </div>
                                    <span>{section.steps.length} steps</span>
                                  </div>
                                  
                                  <Button 
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                    onClick={() => startTour(section.id)}
                                  >
                                    Start Section
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* FAQ View */}
            {activeView === 'faq' && (
              <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl max-w-6xl mx-auto max-h-[90vh] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView('overview')}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Overview
                    </Button>
                    <Badge variant="outline" className="px-3 py-1">
                      Essential Guide
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 overflow-y-auto flex-1">
                  <FAQSection 
                    searchQuery={searchQuery}
                    onStartTour={(tourId) => {
                      startTour(tourId);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tour View */}
            {activeView === 'tour' && currentSection && currentStep && (
              <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl max-w-4xl mx-auto max-h-[90vh] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView('overview')}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Overview
                    </Button>
                    <Badge variant="outline" className="px-3 py-1">
                      {currentSection.category}
                    </Badge>
                  </div>
                  
                  <div className="text-center mt-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentSection.title}
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <span>Step {currentStepIndex + 1} of {currentSection.steps.length}</span>
                      <span>•</span>
                      <span>{currentSection.duration}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 overflow-y-auto flex-1">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <Progress 
                      value={((currentStepIndex + 1) / currentSection.steps.length) * 100} 
                      className="h-3"
                    />
                  </div>

                  {/* Step Content */}
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="text-center mb-8"
                  >
                    <div className={`mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-r ${getCategoryColor(currentSection.category)} flex items-center justify-center text-white shadow-lg`}>
                      {currentSection.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {currentStep.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                      {currentStep.description}
                    </p>

                    {/* Tips */}
                    {currentStep.tips && currentStep.tips.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                          <span className="font-medium text-blue-900">Pro Tips</span>
                        </div>
                        <ul className="text-left space-y-2">
                          {currentStep.tips.map((tip, index) => (
                            <li key={index} className="text-blue-700 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Demo Badge */}
                    {currentStep.demo && (
                      <Badge variant="secondary" className="mb-4">
                        <Camera className="h-3 w-3 mr-1" />
                        Interactive Demo Available
                      </Badge>
                    )}
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {currentSection.steps.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentStepIndex ? 'bg-blue-500' : 
                            index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          animate={{
                            scale: index === currentStepIndex ? 1.2 : 1,
                          }}
                        />
                      ))}
                    </div>

                    {currentStep.action ? (
                      <Button
                        asChild
                        onClick={handleSectionComplete}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2"
                      >
                        <Link href={currentStep.action.href || '#'}>
                          {currentStep.action.label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center gap-2"
                      >
                        {currentStepIndex === currentSection.steps.length - 1 ? (
                          <>
                            Complete Section
                            <Trophy className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video View */}
            {activeView === 'video' && (
              <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView('overview')}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Overview
                    </Button>
                    <CardTitle className="text-xl">Platform Introduction</CardTitle>
                    <div />
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-6">
                    {/* Video placeholder since we don't have an actual video */}
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Welcome to Meeting Matters
                      </h3>
                      <p className="text-gray-600 mb-4">
                        A comprehensive introduction to our learning platform
                      </p>
                      <Button
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        {isVideoPlaying ? 'Pause' : 'Play'} Introduction
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={() => startTour('welcome-intro')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Continue to Interactive Tour
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}