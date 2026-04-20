import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  BookOpen, 
  CreditCard, 
  Award, 
  Download, 
  Upload, 
  MessageCircle, 
  Settings, 
  Users, 
  Play,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
  Shield,
  FileText,
  Video,
  Headphones,
  Globe,
  Smartphone
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'enrollment' | 'payment' | 'certificates' | 'technical' | 'progress' | 'communication' | 'account';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  videoDemo?: string;
  relatedLinks?: { label: string; href: string }[];
  estimatedTime?: string;
}

interface FAQSectionProps {
  searchQuery?: string;
  onStartTour?: (tourId: string) => void;
}

const faqData: FAQItem[] = [
  // Course Enrollment FAQs
  {
    id: 'how-to-enroll',
    question: 'How do I enroll in a course?',
    answer: 'To enroll in a course: 1) Browse the course catalog or use search to find your desired course. 2) Click on the course title to view details. 3) Review the course description, prerequisites, and duration. 4) Click the "Enroll Now" button. 5) Complete payment if required, or click "Start Learning" for free courses. You\'ll immediately have access to all available content.',
    category: 'enrollment',
    difficulty: 'beginner',
    tags: ['enrollment', 'courses', 'getting started'],
    videoDemo: '/demos/enrollment.mp4',
    relatedLinks: [
      { label: 'Browse Courses', href: '/courses' },
      { label: 'My Enrolled Courses', href: '/dashboard' }
    ],
    estimatedTime: '2 minutes'
  },
  {
    id: 'course-prerequisites',
    question: 'What if I don\'t meet course prerequisites?',
    answer: 'Prerequisites ensure you have the necessary background knowledge. If you don\'t meet them: 1) Check the "Recommended Preparation" section for suggested foundational courses. 2) Take our skills assessment to identify knowledge gaps. 3) Enroll in prerequisite courses first. 4) Contact the instructor for guidance. Some prerequisites are flexible - the system will warn you but may still allow enrollment.',
    category: 'enrollment',
    difficulty: 'intermediate',
    tags: ['prerequisites', 'preparation', 'requirements'],
    estimatedTime: '5 minutes'
  },
  {
    id: 'waitlist-enrollment',
    question: 'How does the course waitlist work?',
    answer: 'When a course is full, you can join the waitlist: 1) Click "Join Waitlist" on the course page. 2) You\'ll receive email notifications when spots open. 3) You have 24 hours to confirm enrollment when contacted. 4) Waitlist position is shown in your dashboard. 5) You can leave the waitlist anytime. Priority is given to early registrations and returning students.',
    category: 'enrollment',
    difficulty: 'intermediate',
    tags: ['waitlist', 'full courses', 'enrollment priority'],
    estimatedTime: '1 minute'
  },

  // Payment FAQs
  {
    id: 'payment-methods',
    question: 'What payment methods are accepted?',
    answer: 'We accept: Credit/Debit Cards (Visa, MasterCard, American Express), PayPal, Bank transfers (for corporate accounts), and Educational vouchers. All payments are processed securely through Stripe. You can save payment methods for future purchases. Subscriptions auto-renew unless cancelled.',
    category: 'payment',
    difficulty: 'beginner',
    tags: ['payment', 'credit card', 'paypal', 'billing'],
    relatedLinks: [
      { label: 'Billing Settings', href: '/settings/billing' },
      { label: 'Payment History', href: '/settings/payments' }
    ],
    estimatedTime: '3 minutes'
  },
  {
    id: 'refund-policy',
    question: 'What is the refund policy?',
    answer: 'Full refund within 30 days if: You\'ve completed less than 25% of the course content, and no certificates have been issued. Partial refunds (50%) available within 60 days for technical issues. Subscription cancellations stop future billing but don\'t refund current period. Contact support@meetingmatters.com to request refunds with your order number.',
    category: 'payment',
    difficulty: 'intermediate',
    tags: ['refund', 'cancellation', 'money back'],
    estimatedTime: '2 minutes'
  },
  {
    id: 'pricing-discounts',
    question: 'Are there discounts available?',
    answer: 'Yes! Available discounts include: Student discounts (20% with valid .edu email), Corporate packages (volume discounts), Early bird pricing (register early for upcoming courses), Loyalty discounts (for returning students), and Seasonal promotions. Check the "Promotions" page or enter promo codes at checkout. Discounts cannot be combined.',
    category: 'payment',
    difficulty: 'beginner',
    tags: ['discounts', 'student pricing', 'promotions', 'savings'],
    relatedLinks: [
      { label: 'Current Promotions', href: '/promotions' },
      { label: 'Student Verification', href: '/verify-student' }
    ],
    estimatedTime: '2 minutes'
  },

  // Certificate FAQs
  {
    id: 'download-certificates',
    question: 'How do I download my certificates?',
    answer: 'To download certificates: 1) Complete all required course modules and assessments. 2) Go to your Dashboard and click "Certificates" tab. 3) Find your completed course and click "Download Certificate". 4) Choose PDF format for printing or digital sharing. 5) Certificates include verification codes for authenticity. You can re-download certificates anytime from your account.',
    category: 'certificates',
    difficulty: 'beginner',
    tags: ['certificates', 'download', 'completion', 'verification'],
    videoDemo: '/demos/certificate-download.mp4',
    relatedLinks: [
      { label: 'My Certificates', href: '/certificates' },
      { label: 'Verify Certificate', href: '/verify' }
    ],
    estimatedTime: '1 minute'
  },
  {
    id: 'certificate-verification',
    question: 'How can others verify my certificates?',
    answer: 'Certificates include unique verification codes. To verify: 1) Provide the verification code from your certificate. 2) Others can visit our verification page and enter the code. 3) The system confirms: Student name, course title, completion date, and instructor details. 4) Verified certificates show a green checkmark. This prevents certificate fraud and ensures authenticity.',
    category: 'certificates',
    difficulty: 'intermediate',
    tags: ['verification', 'authenticity', 'fraud prevention'],
    estimatedTime: '30 seconds'
  },
  {
    id: 'certificate-requirements',
    question: 'What are the requirements to earn a certificate?',
    answer: 'Certificate requirements: 1) Complete 100% of course modules in order. 2) Pass all quizzes with minimum 80% score. 3) Submit required assignments/projects. 4) Meet attendance requirements for live sessions. 5) Complete final assessment if applicable. Progress is tracked automatically. You\'ll receive notification when eligible for certificate generation.',
    category: 'certificates',
    difficulty: 'intermediate',
    tags: ['requirements', 'completion', 'assessment', 'grades'],
    estimatedTime: '3 minutes'
  },

  // Technical Support FAQs
  {
    id: 'video-playback-issues',
    question: 'Video won\'t play or keeps buffering?',
    answer: 'Troubleshooting video issues: 1) Check internet connection (minimum 5 Mbps recommended). 2) Clear browser cache and cookies. 3) Disable browser extensions temporarily. 4) Try a different browser (Chrome, Firefox, Safari). 5) Lower video quality in player settings. 6) Restart your device. 7) For mobile: ensure app is updated. Contact support if issues persist.',
    category: 'technical',
    difficulty: 'beginner',
    tags: ['video', 'streaming', 'buffering', 'playback'],
    estimatedTime: '5 minutes'
  },
  {
    id: 'mobile-app-features',
    question: 'Can I access courses on my phone?',
    answer: 'Yes! Our mobile app offers: 1) Full course access with offline download capability. 2) Video playback with adjustable quality. 3) Note-taking and bookmarking features. 4) Push notifications for deadlines and updates. 5) Progress synchronization across devices. Download from App Store or Google Play. Login with your existing account credentials.',
    category: 'technical',
    difficulty: 'beginner',
    tags: ['mobile', 'app', 'offline', 'sync'],
    relatedLinks: [
      { label: 'Download iOS App', href: 'https://apps.apple.com/meetingmatters' },
      { label: 'Download Android App', href: 'https://play.google.com/meetingmatters' }
    ],
    estimatedTime: '2 minutes'
  },

  // Progress Tracking FAQs
  {
    id: 'track-progress',
    question: 'How do I track my learning progress?',
    answer: 'Monitor progress through: 1) Dashboard overview showing completion percentages. 2) Individual course progress bars and module status. 3) Time spent learning statistics. 4) Quiz scores and improvement trends. 5) Achievement badges and milestones. 6) Weekly progress reports via email. Set learning goals and receive personalized recommendations based on your progress.',
    category: 'progress',
    difficulty: 'beginner',
    tags: ['progress', 'tracking', 'dashboard', 'statistics'],
    relatedLinks: [
      { label: 'View Dashboard', href: '/dashboard' },
      { label: 'Progress Reports', href: '/progress' }
    ],
    estimatedTime: '2 minutes'
  },
  {
    id: 'resume-course',
    question: 'How do I resume a course where I left off?',
    answer: 'The system automatically saves your progress. To resume: 1) Go to your Dashboard. 2) Find the course under "Continue Learning". 3) Click "Continue" to jump to your last position. 4) Or browse course modules and click on the next incomplete item. Your progress is saved every 30 seconds, including video timestamps, quiz attempts, and reading positions.',
    category: 'progress',
    difficulty: 'beginner',
    tags: ['resume', 'continue', 'bookmarks', 'auto-save'],
    estimatedTime: '1 minute'
  },

  // Communication FAQs
  {
    id: 'contact-instructor',
    question: 'How do I contact my instructor?',
    answer: 'Contact instructors through: 1) Course discussion forums for public questions. 2) Direct messaging for private concerns. 3) Virtual office hours (check instructor schedule). 4) Email for urgent matters (found in course details). 5) Live chat during scheduled sessions. Response times vary by instructor but typically within 24-48 hours for non-urgent questions.',
    category: 'communication',
    difficulty: 'beginner',
    tags: ['instructor', 'contact', 'messaging', 'support'],
    estimatedTime: '2 minutes'
  },
  {
    id: 'discussion-forums',
    question: 'How do discussion forums work?',
    answer: 'Forums facilitate peer learning: 1) Each course has dedicated discussion areas by topic. 2) Post questions, share insights, or start discussions. 3) Upvote helpful responses and mark solutions. 4) Follow threads to get notifications of new replies. 5) Search previous discussions before posting. 6) Respect community guidelines for positive learning environment.',
    category: 'communication',
    difficulty: 'intermediate',
    tags: ['forums', 'discussion', 'community', 'peer learning'],
    estimatedTime: '3 minutes'
  },

  // Account Management FAQs
  {
    id: 'update-profile',
    question: 'How do I update my profile information?',
    answer: 'Update your profile: 1) Click your avatar in the top-right corner. 2) Select "Profile Settings". 3) Edit personal information, contact details, and learning preferences. 4) Upload a profile photo (optional). 5) Set notification preferences. 6) Update password in security settings. 7) Save changes. Profile updates are reflected immediately across the platform.',
    category: 'account',
    difficulty: 'beginner',
    tags: ['profile', 'settings', 'personal info', 'preferences'],
    relatedLinks: [
      { label: 'Profile Settings', href: '/settings/profile' },
      { label: 'Privacy Settings', href: '/settings/privacy' }
    ],
    estimatedTime: '3 minutes'
  },
  {
    id: 'notification-settings',
    question: 'How do I manage email notifications?',
    answer: 'Customize notifications: 1) Go to Settings > Notifications. 2) Choose email frequency (immediate, daily digest, weekly). 3) Select notification types: course updates, deadlines, messages, achievements. 4) Set quiet hours to avoid notifications during specific times. 5) Enable/disable mobile push notifications. 6) Unsubscribe from marketing emails separately in footer links.',
    category: 'account',
    difficulty: 'intermediate',
    tags: ['notifications', 'email', 'preferences', 'settings'],
    estimatedTime: '2 minutes'
  }
];

const categoryIcons = {
  enrollment: <BookOpen className="h-5 w-5" />,
  payment: <CreditCard className="h-5 w-5" />,
  certificates: <Award className="h-5 w-5" />,
  technical: <Settings className="h-5 w-5" />,
  progress: <CheckCircle className="h-5 w-5" />,
  communication: <MessageCircle className="h-5 w-5" />,
  account: <Users className="h-5 w-5" />
};

const categoryColors = {
  enrollment: 'from-blue-500 to-indigo-500',
  payment: 'from-green-500 to-emerald-500',
  certificates: 'from-yellow-500 to-orange-500',
  technical: 'from-purple-500 to-violet-500',
  progress: 'from-teal-500 to-cyan-500',
  communication: 'from-pink-500 to-rose-500',
  account: 'from-gray-500 to-slate-500'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export function FAQSection({ searchQuery = '', onStartTour }: FAQSectionProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const activeSearchQuery = searchQuery || localSearchQuery;

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = activeSearchQuery === '' || 
      faq.question.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(activeSearchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || faq.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = Object.keys(categoryIcons) as (keyof typeof categoryIcons)[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find quick answers to common questions about using our learning platform effectively.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg border-2 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 flex items-center gap-1"
                  onClick={() => setSelectedCategory(category)}
                >
                  {categoryIcons[category]}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Badge 
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer px-3 py-1"
                onClick={() => setSelectedDifficulty('all')}
              >
                All Levels
              </Badge>
              {(['beginner', 'intermediate', 'advanced'] as const).map(difficulty => (
                <Badge 
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No FAQs Found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${categoryColors[faq.category]}`}>
                          {categoryIcons[faq.category]}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={difficultyColors[faq.difficulty]}>
                            {faq.difficulty}
                          </Badge>
                          {faq.estimatedTime && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {faq.estimatedTime}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedItems.includes(faq.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                          
                          {faq.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {(faq.videoDemo || faq.relatedLinks) && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                              {faq.videoDemo && (
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Watch Demo
                                </Button>
                              )}
                              {faq.relatedLinks?.map(link => (
                                <Button 
                                  key={link.href}
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center gap-2"
                                  asChild
                                >
                                  <a href={link.href}>
                                    <ArrowRight className="h-4 w-4" />
                                    {link.label}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need More Help?
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {onStartTour && (
              <Button 
                onClick={() => onStartTour('welcome-intro')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Take Interactive Tour
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              User Manual
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}