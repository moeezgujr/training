import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  BookOpen,
  Play,
  Volume2,
  FileText,
  Award,
  CheckCircle,
  Search,
  User,
  Settings,
  HelpCircle,
  ArrowRight,
  Star,
  Clock,
  Target,
  Headphones,
  Download,
  Share,
  MessageSquare,
  BarChart3,
  GraduationCap,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";

export default function UserGuide() {
  const { startOnboarding } = useOnboarding();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const guideCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using the LMS",
      icon: GraduationCap,
      color: "bg-blue-500"
    },
    {
      id: "courses",
      title: "Taking Courses",
      description: "How to enroll, study, and complete courses",
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      id: "features",
      title: "Platform Features",
      description: "Make the most of all available tools",
      icon: Star,
      color: "bg-purple-500"
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Solutions to common issues",
      icon: HelpCircle,
      color: "bg-orange-500"
    }
  ];

  const gettingStartedGuides = [
    {
      title: "Creating Your Account",
      description: "Step-by-step account setup process",
      steps: [
        "Click 'Student Registration' on the homepage",
        "Fill in your personal information (name, email, phone)",
        "Select your education level and field of study",
        "Choose your interests and learning goals",
        "Complete the registration process",
        "Check your email for confirmation (if required)",
        "Log in with your credentials"
      ],
      tips: [
        "Use a valid email address you check regularly",
        "Choose a strong password with letters, numbers, and symbols",
        "Keep your login credentials secure"
      ]
    },
    {
      title: "Navigating the Dashboard",
      description: "Understanding your learning dashboard",
      steps: [
        "View your enrolled courses in the main area",
        "Check your progress with the progress bars",
        "Access quick stats in the sidebar",
        "Review recent activity and achievements",
        "Use the navigation menu to explore different sections"
      ],
      tips: [
        "The dashboard updates in real-time as you make progress",
        "Bookmark important pages for quick access",
        "Check notifications regularly for updates"
      ]
    },
    {
      title: "Profile Setup",
      description: "Personalizing your learning profile",
      steps: [
        "Click on your profile picture in the top right",
        "Select 'Profile' from the dropdown menu",
        "Upload a profile picture",
        "Update your personal information",
        "Set your learning preferences",
        "Configure notification settings",
        "Save your changes"
      ],
      tips: [
        "A complete profile helps instructors provide better support",
        "Set notification preferences to match your schedule",
        "Regular profile updates improve your learning experience"
      ]
    }
  ];

  const courseGuides = [
    {
      title: "Finding and Enrolling in Courses",
      description: "How to discover and join courses",
      steps: [
        "Click 'Browse Courses' in the navigation menu",
        "Use filters to find courses by topic, level, or duration",
        "Click on a course card to view details",
        "Review the course description, modules, and requirements",
        "Check prerequisites if any are listed",
        "Click 'Enroll Now' to join the course",
        "Complete payment if it's a paid course",
        "Access your enrolled course from the dashboard"
      ],
      tips: [
        "Read course descriptions carefully before enrolling",
        "Check if you meet any prerequisites",
        "Look for free courses to get started",
        "Consider your available time when choosing courses"
      ]
    },
    {
      title: "Studying Course Content",
      description: "Making the most of your learning materials",
      steps: [
        "Open your enrolled course from the dashboard",
        "Start with the first module in sequence",
        "Click on lessons to access different content types:",
        "• Audio lessons: Use the enhanced audio player with speed controls",
        "• Video content: Watch at your preferred speed",
        "• PDF materials: Read and download for offline access",
        "• Quizzes: Test your knowledge and get instant feedback",
        "Take notes using the built-in note-taking feature",
        "Mark lessons as complete when finished",
        "Track your overall progress in the course"
      ],
      tips: [
        "Follow the recommended sequence for best results",
        "Take breaks between lessons to absorb information",
        "Use the note-taking feature to capture key points",
        "Replay audio/video content as needed",
        "Don't skip quizzes - they reinforce learning"
      ]
    },
    {
      title: "Audio Learning Features",
      description: "Maximizing your audio learning experience",
      steps: [
        "Click on any audio lesson to open the enhanced player",
        "Use playback speed controls (0.5x to 2x) to match your preference",
        "Enable/disable auto-advance to next lesson",
        "Use the seek bar to jump to specific timestamps",
        "Add timestamped notes while listening",
        "Use keyboard shortcuts for quick control:",
        "• Spacebar: Play/Pause",
        "• Left/Right arrows: Skip 10 seconds",
        "• Up/Down arrows: Volume control",
        "Download audio for offline listening (if available)"
      ],
      tips: [
        "Start with normal speed and adjust as comfortable",
        "Use headphones for better audio quality",
        "Take notes at key points for better retention",
        "Listen in a quiet environment for focus",
        "Review difficult sections multiple times"
      ]
    },
    {
      title: "Taking Quizzes and Assessments",
      description: "How to complete quizzes effectively",
      steps: [
        "Navigate to a quiz lesson in your course",
        "Read all instructions carefully before starting",
        "Answer questions one by one:",
        "• Multiple choice: Select the best answer",
        "• True/False: Choose the correct option",
        "• Fill-in-the-blank: Type your answer",
        "Review your answers before submitting",
        "Click 'Submit Quiz' when ready",
        "Review your results and feedback",
        "Note explanations for incorrect answers",
        "Retake if allowed and needed"
      ],
      tips: [
        "Read questions carefully and completely",
        "Don't rush - take your time to think",
        "Use the process of elimination for multiple choice",
        "Review course materials if you're unsure",
        "Learn from feedback on incorrect answers"
      ]
    }
  ];

  const featureGuides = [
    {
      title: "Note-Taking System",
      description: "Using the integrated note-taking features",
      steps: [
        "During any lesson, click the 'Notes' icon",
        "Add timestamped notes for audio/video content",
        "Create general notes for text-based lessons",
        "Organize notes by course and module",
        "Search through your notes using keywords",
        "Export notes for offline study",
        "Share notes with study groups (if enabled)"
      ],
      tips: [
        "Take notes in your own words for better understanding",
        "Use timestamps to mark important moments",
        "Regular note review improves retention",
        "Organize notes by topics or themes"
      ]
    },
    {
      title: "Progress Tracking",
      description: "Monitoring your learning progress",
      steps: [
        "View course progress on your dashboard",
        "Check individual lesson completion status",
        "Monitor quiz scores and overall performance",
        "Track time spent on each course",
        "Review learning streaks and achievements",
        "Set personal learning goals",
        "Export progress reports"
      ],
      tips: [
        "Set realistic daily/weekly learning goals",
        "Celebrate small achievements to stay motivated",
        "Use progress data to identify areas for improvement",
        "Regular progress reviews help maintain momentum"
      ]
    },
    {
      title: "Certificates and Achievements",
      description: "Earning and managing your certificates",
      steps: [
        "Complete all required course modules",
        "Pass all quizzes with minimum required scores",
        "Meet any attendance or participation requirements",
        "Certificate will be automatically generated upon completion",
        "Download your certificate from the 'Certificates' section",
        "Share certificates on social media or LinkedIn",
        "Print certificates for physical portfolios"
      ],
      tips: [
        "Certificates are permanent records of your achievement",
        "Include certificates in job applications and resumes",
        "Some certificates may require final assessments",
        "Keep digital copies safely stored"
      ]
    },
    {
      title: "Mobile Learning",
      description: "Learning on your smartphone or tablet",
      steps: [
        "Open your web browser on mobile device",
        "Navigate to the LMS website",
        "Log in with your credentials",
        "The interface automatically adapts to your screen size",
        "Download offline content when on WiFi",
        "Use mobile-optimized audio player",
        "Sync progress across all devices"
      ],
      tips: [
        "Download content on WiFi to save mobile data",
        "Use headphones for better mobile audio experience",
        "Mobile learning is perfect for commuting",
        "Progress syncs automatically across devices"
      ]
    }
  ];

  const troubleshootingGuides = [
    {
      title: "Login Issues",
      solutions: [
        "Forgot password? Use the 'Reset Password' link",
        "Check if Caps Lock is on",
        "Clear browser cache and cookies",
        "Try using a different browser",
        "Disable browser extensions temporarily",
        "Contact support if issues persist"
      ]
    },
    {
      title: "Audio/Video Problems",
      solutions: [
        "Check your internet connection speed",
        "Update your browser to the latest version",
        "Enable autoplay in browser settings",
        "Clear browser cache",
        "Try using headphones",
        "Restart your browser",
        "Check device volume settings"
      ]
    },
    {
      title: "Course Access Issues",
      solutions: [
        "Verify your enrollment status",
        "Check if payment was processed (for paid courses)",
        "Ensure you meet course prerequisites",
        "Clear browser cache and refresh",
        "Contact instructor or support",
        "Check your email for course updates"
      ]
    },
    {
      title: "Progress Not Saving",
      solutions: [
        "Ensure stable internet connection",
        "Don't close browser immediately after completing lessons",
        "Disable aggressive ad blockers",
        "Allow cookies from the LMS domain",
        "Complete lessons fully before moving to next",
        "Contact support if problem continues"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete LMS User Guide
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Everything you need to know to succeed in your learning journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={startOnboarding} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Take Interactive Tour
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download PDF Guide
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {guideCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Main Guide Content */}
        <Tabs defaultValue="getting-started" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="courses">Taking Courses</TabsTrigger>
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <p className="text-lg text-gray-600">
                Welcome to your learning platform! Follow these guides to get started quickly.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {gettingStartedGuides.map((guide, index) => (
                <AccordionItem key={index} value={`getting-started-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-50">
                        {index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{guide.title}</h3>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Step-by-Step Instructions
                        </h4>
                        <ol className="space-y-2">
                          {guide.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {stepIndex + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {guide.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Taking Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Taking Courses</h2>
              <p className="text-lg text-gray-600">
                Master the art of learning with our comprehensive course guides.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {courseGuides.map((guide, index) => (
                <AccordionItem key={index} value={`courses-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-50">
                        {index + 1}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{guide.title}</h3>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Step-by-Step Instructions
                        </h4>
                        <ol className="space-y-2">
                          {guide.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {stepIndex + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {guide.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Platform Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
              <p className="text-lg text-gray-600">
                Discover all the powerful features available to enhance your learning experience.
              </p>
            </div>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Certificate System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Automatic Certificate Generation</h3>
                    <p className="text-gray-600 mb-3">
                      Earn certificates automatically upon completing courses or individual sessions.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Session Completion Certificates for individual lessons</li>
                      <li>Course Completion Certificates for full course bundles</li>
                      <li>PDF generation with unique verification codes</li>
                      <li>Automatic email delivery to your registered address</li>
                      <li>Access to all certificates from your dashboard</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-blue-500" />
                    Enhanced Audio Player
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Professional Audio Features</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Variable playback speed (0.5x to 2x)</li>
                      <li>Automatic progress tracking and resume</li>
                      <li>Keyboard shortcuts for quick control</li>
                      <li>Volume control and mute options</li>
                      <li>Seek functionality with progress bar</li>
                      <li>Auto-advance to next lesson (optional)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Comprehensive Analytics</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Course completion percentages</li>
                      <li>Time spent on each lesson</li>
                      <li>Quiz scores and performance metrics</li>
                      <li>Learning streaks and consistency tracking</li>
                      <li>Visual progress indicators</li>
                      <li>Achievement milestones</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-purple-500" />
                    Prerequisite System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Structured Learning Path</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Sequential lesson progression</li>
                      <li>Locked content until prerequisites are met</li>
                      <li>Clear visibility of requirements</li>
                      <li>Optimized learning sequences</li>
                      <li>Progress dependencies visualization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Troubleshooting & Support</h2>
              <p className="text-lg text-gray-600">
                Common issues and solutions to help you resolve technical problems quickly.
              </p>
            </div>

            <div className="grid gap-6">
              {troubleshootingGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Try these solutions:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {guide.solutions.map((solution, sIndex) => (
                          <li key={sIndex}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Browser Compatibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Browser Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Recommended Browsers</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-2">Desktop:</p>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>Chrome 90+ (Recommended)</li>
                            <li>Firefox 88+</li>
                            <li>Safari 14+</li>
                            <li>Edge 90+</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Mobile:</p>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>Chrome Mobile 90+</li>
                            <li>Safari Mobile 14+</li>
                            <li>Samsung Internet 13+</li>
                            <li>Firefox Mobile 88+</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> For optimal performance, keep your browser updated to the latest version. 
                        Some features may not work properly in outdated browsers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Getting Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Getting Additional Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-gray-600 text-sm">
                              Contact our support team for detailed assistance with technical issues.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h3 className="font-semibold">Response Time</h3>
                            <p className="text-gray-600 text-sm">
                              Support inquiries are typically answered within 24 hours.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <h3 className="font-semibold">Documentation</h3>
                            <p className="text-gray-600 text-sm">
                              This guide is updated regularly with new features and solutions.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <h3 className="font-semibold">Community</h3>
                            <p className="text-gray-600 text-sm">
                              Connect with other learners for peer support and tips.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-600" />
                        Before Contacting Support
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">Please try these steps first:</p>
                        <ul className="list-decimal list-inside ml-4 space-y-1">
                          <li>Review this user guide for relevant information</li>
                          <li>Check your internet connection and browser settings</li>
                          <li>Try logging out and logging back in</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Test with a different device or browser</li>
                        </ul>
                        <p className="mt-3 text-sm">
                          <strong>When contacting support:</strong> Include your browser type/version, 
                          the specific page or feature causing issues, and any error messages.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
              <p className="text-lg text-gray-600">
                Quick solutions to common issues you might encounter.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {troubleshootingGuides.map((guide, index) => (
                <AccordionItem key={index} value={`troubleshooting-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-orange-50">
                        <HelpCircle className="h-3 w-3" />
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{guide.title}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Solutions to Try
                      </h4>
                      <ul className="space-y-2">
                        {guide.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {solutionIndex + 1}
                            </span>
                            <span className="text-gray-700">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Device Compatibility */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Compatibility
            </CardTitle>
            <CardDescription>
              Learn on any device with our responsive platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Monitor className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Desktop & Laptop</h3>
                <p className="text-sm text-gray-600">
                  Full features available on Chrome, Firefox, Safari, and Edge
                </p>
              </div>
              <div className="text-center">
                <Tablet className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Tablet</h3>
                <p className="text-sm text-gray-600">
                  Optimized interface for iPad and Android tablets
                </p>
              </div>
              <div className="text-center">
                <Smartphone className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Mobile</h3>
                <p className="text-sm text-gray-600">
                  Learn on-the-go with mobile-optimized experience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Need Additional Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to help you succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you can't find the answer you're looking for, don't hesitate to reach out.
                </p>
                <Link href="/support">
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interactive Tour</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take a guided tour of the platform to see features in action.
                </p>
                <Button onClick={startOnboarding} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Tour
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}