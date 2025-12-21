import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Button, 
  buttonVariants 
} from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Zap, 
  Award, 
  Clock,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Brain,
  Star,
  Play,
  Shield,
  Globe,
  Sparkles
} from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { PublicLayout } from "@/components/layouts/public-layout";

export function PublicHomePage() {
  const [featuredTab, setFeaturedTab] = useState("popular");

  // Fetch featured courses - limited to 6 for display purposes
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  }) as { data: any[] };

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get instructors from the users data
  const instructors = (users as any[]).filter((user: any) => user.role === 'instructor');

  // Hero section with modern gradient and animations
  const HeroSection = () => (
    <section className="relative overflow-hidden min-h-screen">
      {/* Educational/Learning themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>

      {/* Learning-themed SVG illustration background */}
      <div className="absolute inset-0 opacity-15">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {/* Study group silhouettes */}
          <g fill="white">
            {/* Person with laptop */}
            <circle cx="200" cy="300" r="25"/>
            <rect x="190" y="325" width="20" height="40" rx="10"/>
            <rect x="175" y="370" width="50" height="30" rx="5"/>

            {/* Person reading */}
            <circle cx="400" cy="280" r="25"/>
            <rect x="390" y="305" width="20" height="40" rx="10"/>
            <rect x="385" y="350" width="30" height="20" rx="3"/>

            {/* Person presenting */}
            <circle cx="800" cy="250" r="25"/>
            <rect x="790" y="275" width="20" height="40" rx="10"/>
            <rect x="750" y="200" width="100" height="60" rx="10" fillOpacity="0.3"/>

            {/* Group discussion */}
            <circle cx="950" cy="400" r="20"/>
            <circle cx="1000" cy="420" r="20"/>
            <circle cx="1050" cy="400" r="20"/>
            <rect x="940" y="420" width="15" height="30" rx="7"/>
            <rect x="990" y="440" width="15" height="30" rx="7"/>
            <rect x="1040" y="420" width="15" height="30" rx="7"/>

            {/* Books and learning materials scattered */}
            <rect x="150" y="500" width="25" height="35" rx="3"/>
            <rect x="180" y="495" width="25" height="35" rx="3"/>
            <rect x="350" y="520" width="30" height="40" rx="3"/>
            <rect x="600" y="480" width="35" height="45" rx="3"/>
            <rect x="850" y="550" width="28" height="38" rx="3"/>

            {/* Digital devices */}
            <rect x="500" y="350" width="60" height="40" rx="8" fillOpacity="0.4"/>
            <rect x="700" y="450" width="50" height="35" rx="6" fillOpacity="0.4"/>

            {/* Learning icons */}
            <circle cx="300" cy="150" r="15" fillOpacity="0.3"/>
            <circle cx="600" cy="180" r="18" fillOpacity="0.3"/>
            <circle cx="900" cy="120" r="12" fillOpacity="0.3"/>

            {/* Study notes/papers */}
            <rect x="250" y="450" width="40" height="30" rx="3" fillOpacity="0.3"/>
            <rect x="450" y="480" width="35" height="25" rx="3" fillOpacity="0.3"/>
            <rect x="750" y="380" width="45" height="32" rx="3" fillOpacity="0.3"/>
          </g>
        </svg>
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>

      {/* Floating educational elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <Brain className="w-4 h-4" />
              Advanced Psychology Education
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Meeting Matters
                </span>
                <br />
                <span className="text-white">
                  Learning Platform
                </span>
              </h1>

              <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
                Master evidence-based therapeutic approaches with our comprehensive psychology courses. Specializing in anxiety, depression, and cognitive behavioral therapy for mental health professionals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/auth/signup">
                  <Users className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/auth/login">
                  <Play className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800" asChild>
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Courses
                </Link>
              </Button>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Interactive Learning</h3>
                      <p className="text-sm text-gray-300">Expert-led video courses</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-200">Course Progress</span>
                      <span className="text-sm text-cyan-400">78%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-200">12 Modules Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-gray-200">Certificate Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20 -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl opacity-20 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );

  // Features section with enhanced design
  const FeaturesSection = () => {
    const features = [
      {
        icon: <BookOpen className="h-8 w-8" />,
        title: "Interactive Learning",
        description: "Immersive video lessons, quizzes, and hands-on activities designed by industry experts to maximize knowledge retention.",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
      },
      {
        icon: <Brain className="h-8 w-8" />,
        title: "Expert Instructors",
        description: "Learn from certified professionals and leading researchers in behavioral sciences and mental health with decades of experience.",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20"
      },
      {
        icon: <Award className="h-8 w-8" />,
        title: "Professional Certificates",
        description: "Earn industry-recognized certificates that boost your credentials and advance your career in mental health and behavioral sciences.",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20"
      },
      {
        icon: <BarChart3 className="h-8 w-8" />,
        title: "Progress Analytics",
        description: "Track your learning journey with detailed insights, personalized recommendations, and comprehensive progress reports.",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      },
      {
        icon: <Users className="h-8 w-8" />,
        title: "Community Learning",
        description: "Connect with fellow professionals, participate in discussions, and learn collaboratively in our supportive community.",
        color: "from-indigo-500 to-purple-500",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
      },
      {
        icon: <Shield className="h-8 w-8" />,
        title: "Secure & Private",
        description: "Your learning data is protected with enterprise-grade security and privacy measures ensuring complete confidentiality.",
        color: "from-red-500 to-pink-500",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      }
    ];

    return (
      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powerful Learning Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Excel</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools and resources you need to advance your career in behavioral sciences and mental health.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Learning Journey
          </h1>
          <p className="text-xl mb-8">
            Welcome to{" "}
            <span className="text-yellow-400 font-semibold">
              Meeting Matters
            </span>
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            Your comprehensive Learning Management System designed to unlock potential, 
            foster growth, and create meaningful educational experiences.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600">
              Start Learning
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-900">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed for modern learning
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Interactive Learning
              </h3>
              <p className="text-gray-600">
                Immersive video lessons, quizzes, and hands-on activities designed by industry experts to maximize knowledge retention.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics, completion rates, and personalized insights to optimize your growth.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Certifications
              </h3>
              <p className="text-gray-600">
                Earn industry-recognized certificates upon completion to showcase your skills and advance your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Expert Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Completion Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Methods Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How We Help You Learn Better
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines proven educational methods with cutting-edge technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-yellow-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Learning</h3>
              <p className="text-gray-600 text-sm">
                High-quality video content with interactive elements and note-taking capabilities
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Quizzes</h3>
              <p className="text-gray-600 text-sm">
                Adaptive assessments that adjust to your learning pace and style
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                Connect with fellow learners, ask questions, and share knowledge
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
              <p className="text-gray-600 text-sm">
                Structured learning paths that ensure you master fundamentals first
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your learning journey with our most engaging courses
            </p>
          </div>
          
          {(courses as any[]).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(courses as any[]).slice(0, 6).map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Exciting Courses Coming Soon!</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our expert instructors are crafting amazing learning experiences. Be the first to know when new courses launch.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Join the Waitlist
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Learners Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied learners who've transformed their careers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The structured learning path and interactive quizzes made complex topics easy to understand. I landed my dream job within 3 months!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    S
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Software Developer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The audio learning feature is perfect for my commute. I've completed 5 courses while traveling to work!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Marcus Johnson</div>
                    <div className="text-sm text-gray-500">Marketing Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="pt-0">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The certificates I earned here helped me get promoted. The quality of content is exceptional!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    A
                  </div>
                  <div>
                    <div className="font-semibold">Aisha Patel</div>
                    <div className="text-sm text-gray-500">Project Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Help & User Guide Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Need Help Getting Started?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our comprehensive user guide with step-by-step tutorials for every feature
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Complete User Guide</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our detailed user guide covers everything you need to know about using the Meeting Matters LMS. 
                  From basic navigation to advanced features like course creation, quiz management, and certificate generation.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">For Students</h4>
                    <p className="text-sm text-gray-600">Learn to navigate courses, track progress, and earn certificates</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">For Instructors</h4>
                    <p className="text-sm text-gray-600">Master course creation, content management, and student engagement</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">For Admins</h4>
                    <p className="text-sm text-gray-600">Manage users, courses, and system-wide settings</p>
                  </div>
                </div>
                
                <Link href="/user-guide">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Access Complete User Guide
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our learning platform
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How do prerequisites work?</h3>
                  <p className="text-gray-600">
                    Our prerequisite system ensures you build knowledge step-by-step. You must complete required lessons before accessing advanced content, creating a structured learning path.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Can I learn at my own pace?</h3>
                  <p className="text-gray-600">
                    Absolutely! All courses are self-paced. Access your content 24/7 and learn whenever it fits your schedule. Progress is automatically saved.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">What types of content do you offer?</h3>
                  <p className="text-gray-600">
                    We provide video lessons, audio content, interactive quizzes, text materials, and hands-on assignments to accommodate different learning styles.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">How do certificates work?</h3>
                  <p className="text-gray-600">
                    Earn certificates for individual sessions or complete course bundles. All certificates are digitally signed, verifiable, and automatically emailed to you upon completion.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Is there a mobile app?</h3>
                  <p className="text-gray-600">
                    Our platform is fully responsive and works seamlessly on all devices. Access your courses from your phone, tablet, or computer.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Can I take notes during lessons?</h3>
                  <p className="text-gray-600">
                    Yes! Our integrated note-taking system lets you capture important points during lessons. Your notes are automatically saved and searchable.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">What payment options are available?</h3>
                  <p className="text-gray-600">
                    We accept all major credit cards and offer secure payment processing. Purchase individual courses or bundles with instant access.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600">
                    We offer a 30-day money-back guarantee on all courses. If you're not satisfied, contact our support team for a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering Learners Worldwide
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Meeting Matters was founded with a simple mission: make high-quality education accessible to everyone, everywhere. Our platform combines cutting-edge technology with proven educational methods.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trusted Platform</h3>
                    <p className="text-gray-600">Secure, reliable infrastructure protecting your learning journey and personal data.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Global Community</h3>
                    <p className="text-gray-600">Connect with learners from around the world and expand your network.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Innovation First</h3>
                    <p className="text-gray-600">Continuously improving with new features and learning technologies.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                    <div className="text-sm text-gray-600">Expert Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
                    <div className="text-sm text-gray-600">Countries Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                    <div className="text-sm text-gray-600">Student Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">15K+</div>
                    <div className="text-sm text-gray-600">Certificates Issued</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Recognition */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Trusted by Industry Leaders</h3>
            <p className="text-gray-300">Our courses are recognized and endorsed by top companies worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
            <div className="text-2xl font-bold">TechCorp</div>
            <div className="text-2xl font-bold">InnovateLab</div>
            <div className="text-2xl font-bold">FutureWorks</div>
            <div className="text-2xl font-bold">DigitalEdge</div>
            <div className="text-2xl font-bold">SkillForge</div>
            <div className="text-2xl font-bold">LearnTech</div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join Meeting Matters today and unlock your potential with our comprehensive learning platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}