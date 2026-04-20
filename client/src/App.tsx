import { Route, Switch } from "wouter";
import { Suspense, lazy, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Redirect } from "@/components/ui/redirect";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { HelpFloat } from "@/components/help-float";
import PaymentSuccess from "@/pages/PaymentSuccess";

import { OnboardingWalkthrough } from "@/components/onboarding/onboarding-walkthrough";
import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/index"));
const CoursesPage = lazy(() => import("@/pages/courses/index"));
const CourseDetailsPage = lazy(() => import("@/pages/courses/[id]"));
const CartPage = lazy(() => import("@/pages/cart"));
const StudentDashboard = lazy(() => import("@/pages/student-dashboard"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));
const SignupPage = lazy(() => import("@/pages/auth/signup"));
const InstructorLoginPage = lazy(() => import("@/pages/auth/instructor-login"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));

// ... (Rest of your lazy imports remain the same)
const DashboardSettings = lazy(() => import("@/pages/dashboard/settings"));
const InstructorDashboard = lazy(() => import("@/pages/instructor/index"));
const InstructorCourses = lazy(() => import("@/pages/instructor/courses/index"));
const InstructorCourseView = lazy(() => import("@/pages/instructor/courses/[id]/index"));
const InstructorCourseEdit = lazy(() => import("@/pages/instructor/courses/[id]/edit"));
const InstructorStudents = lazy(() => import("@/pages/instructor/students"));
const CourseCreator = lazy(() => import("@/pages/instructor/courses/creator"));
const CourseBuilder = lazy(() => import("@/pages/instructor/courses/builder"));
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminPricing = lazy(() => import("@/pages/admin/pricing"));
const AdminPaymentSettings = lazy(() => import("@/pages/admin/payment-settings"));
const AdminPaymentVerifications = lazy(() => import("@/pages/admin/payment-verifications"));
const AdminRefundManagement = lazy(() => import("@/pages/admin/refund-management"));
const AdminContentLibrary = lazy(() => import("@/pages/admin/content-library"));
const AdminEnrollments = lazy(() => import("@/pages/admin/enrollments"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminCertificates = lazy(() => import("@/pages/admin/certificates"));
const AdminCommunications = lazy(() => import("@/pages/admin/communications"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const TourManagementPage = lazy(() => import("@/pages/admin/tour-management"));
const AddCoursePage = lazy(() => import("@/pages/admin/add-course"));
const AdminCourseView = lazy(() => import("@/pages/admin/courses/[id]/view"));
const AdminModuleContent = lazy(() => import("@/pages/admin/courses/[id]/modules/[moduleId]"));
const AdminCourseEdit = lazy(() => import("@/pages/admin/courses/[id]/edit"));
const AdminBundlesPage = lazy(() => import("@/pages/admin/bundles/index"));
const AdminPromoCodesPage = lazy(() => import("@/pages/admin/promo-codes"));
const AdminCreateUserPage = lazy(() => import("@/pages/admin/users/create"));
const AdminTutorsPage = lazy(() => import("@/pages/admin/tutors"));
const StudentMonitoringPage = lazy(() => import("@/pages/student-monitoring"));
const PaymentSubmissionPage = lazy(() => import("@/pages/payment-submission"));
const CertificatesPage = lazy(() => import("@/pages/certificates"));
const NotebookPage = lazy(() => import("@/pages/notebook"));
const MessagesPage = lazy(() => import("@/pages/messages/index"));
const UserGuidePage = lazy(() => import("@/pages/user-guide"));
const LearnPage = lazy(() => import("@/pages/courses/[courseId]/learn"));
const CourseModuleViewer = lazy(() => import("@/components/course/course-viewer"));
const BundlesPage = lazy(() => import("@/pages/bundles/index"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const CoursePaymentPage = lazy(() => import("@/pages/checkout/course-payment"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));
const AboutPage = lazy(() => import("@/pages/about"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const TermsPage = lazy(() => import("@/pages/terms"));
const ContactPage = lazy(() => import("@/pages/contact"));
const SupportPage = lazy(() => import("@/pages/support"));
const StudentRegistrationPage = lazy(() => import("@/pages/student-registration"));
const RegistrationSuccessPage = lazy(() => import("@/pages/registration-success"));
const CookiesPage = lazy(() => import("@/pages/cookies"));

const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#020617]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
  </div>
);

/**
 * UPDATED VIDEO BACKGROUND COMPONENT
 */
const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Manually trigger play to bypass some browser autoplay restrictions
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Video play interrupted:", err));
    }
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-[#020617]">
      {/* Dark tint overlay - set to 50% for better video visibility */}
      <div className="absolute inset-0 bg-slate-950/50 z-10" />
      
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-60"
      >
        <source src="/assets/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  return <>{children}</>;
};

const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (user?.role !== "instructor" && user?.role !== "admin") return <Redirect to="/dashboard" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (user?.role !== "admin") return <Redirect to="/dashboard" />;
  return <>{children}</>;
};

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* All routes remain the same */}
        <Route path="/auth/forgot-password">{() => (<PublicLayout hideFooter><ForgotPassword /></PublicLayout>)}</Route>
        <Route path="/auth/reset-password">{() => (<PublicLayout hideFooter><ResetPassword /></PublicLayout>)}</Route>
        <Route path="/auth/login">{() => (<PublicLayout hideFooter><LoginPage /></PublicLayout>)}</Route>
        <Route path="/auth/signup">{() => (<PublicLayout hideFooter><SignupPage /></PublicLayout>)}</Route>
        <Route path="/auth/instructor">{() => (<PublicLayout hideFooter><InstructorLoginPage /></PublicLayout>)}</Route>
        <Route path="/auth/admin">{() => (<PublicLayout hideFooter><AdminLoginPage /></PublicLayout>)}</Route>
        <Route path="/login"><Redirect to="/auth/login" /></Route>
        <Route path="/"><HomePage /></Route>
        <Route path="/courses">{() => (<PublicLayout><CoursesPage /></PublicLayout>)}</Route>
        <Route path="/courses/:id">{() => (<PublicLayout><CourseDetailsPage /></PublicLayout>)}</Route>
        <Route path="/courses/:courseId/modules/:moduleId">{() => (<ProtectedRoute><CourseModuleViewer /></ProtectedRoute>)}</Route>
        <Route path="/learn/:courseId/:moduleId">{() => (<ProtectedRoute><CourseModuleViewer /></ProtectedRoute>)}</Route>
        <Route path="/courses/:courseId/learn">{() => (<ProtectedRoute><LearnPage /></ProtectedRoute>)}</Route>
        <Route path="/cart">{() => (<PublicLayout><CartPage /></PublicLayout>)}</Route>
        <Route path="/student-dashboard">{() => (<PublicLayout><StudentDashboard /></PublicLayout>)}</Route>
        <Route path="/bundles">{() => (<PublicLayout><BundlesPage /></PublicLayout>)}</Route>
        <Route path="/checkout">{() => (<PublicLayout hideFooter><CheckoutPage /></PublicLayout>)}</Route>
        <Route path="/checkout/course/:courseId">{(params) => (<PublicLayout hideFooter><CoursePaymentPage /></PublicLayout>)}</Route>
        <Route path="/register/student"><StudentRegistrationPage /></Route>
        <Route path="/registration-success"><RegistrationSuccessPage /></Route>
        <Route path="/payment-success">{() => <PaymentSuccess />}</Route>
        <Route path="/about">{() => (<PublicLayout><AboutPage /></PublicLayout>)}</Route>
        <Route path="/privacy">{() => (<PublicLayout><PrivacyPage /></PublicLayout>)}</Route>
        <Route path="/terms">{() => (<PublicLayout><TermsPage /></PublicLayout>)}</Route>
        <Route path="/contact">{() => (<PublicLayout><ContactPage /></PublicLayout>)}</Route>
        <Route path="/support">{() => (<PublicLayout><SupportPage /></PublicLayout>)}</Route>
        <Route path="/user-guide">{() => (<PublicLayout><UserGuidePage /></PublicLayout>)}</Route>
        <Route path="/cookies">{() => (<PublicLayout><CookiesPage /></PublicLayout>)}</Route>
        <Route path="/payment/submit/:courseId">{() => (<ProtectedRoute><PaymentSubmissionPage /></ProtectedRoute>)}</Route>
        <Route path="/dashboard">{() => (<ProtectedRoute><PublicLayout><StudentDashboard /></PublicLayout></ProtectedRoute>)}</Route>
        <Route path="/dashboard/settings">{() => (<ProtectedRoute><DashboardSettings /></ProtectedRoute>)}</Route>
        <Route path="/certificates">{() => (<ProtectedRoute><CertificatesPage /></ProtectedRoute>)}</Route>
        <Route path="/notebook">{() => (<ProtectedRoute><NotebookPage /></ProtectedRoute>)}</Route>
        <Route path="/messages">{() => (<ProtectedRoute><MessagesPage /></ProtectedRoute>)}</Route>
        <Route path="/instructor">{() => (<InstructorRoute><InstructorDashboard /></InstructorRoute>)}</Route>
        <Route path="/instructor/courses">{() => (<InstructorRoute><InstructorCourses /></InstructorRoute>)}</Route>
        <Route path="/instructor/students">{() => (<InstructorRoute><InstructorStudents /></InstructorRoute>)}</Route>
        <Route path="/instructor/courses/create">{() => (<InstructorRoute><CourseCreator /></InstructorRoute>)}</Route>
        <Route path="/instructor/courses/:id">{(params) => (<InstructorRoute><InstructorCourseView /></InstructorRoute>)}</Route>
        <Route path="/instructor/courses/:id/edit">{(params) => (<InstructorRoute><InstructorCourseEdit /></InstructorRoute>)}</Route>
        <Route path="/instructor/courses/builder/:courseId">{(params) => (<InstructorRoute><CourseBuilder /></InstructorRoute>)}</Route>
        <Route path="/admin">{() => (<AdminRoute><AdminDashboard /></AdminRoute>)}</Route>
        <Route path="/admin/users">{() => (<AdminRoute><AdminUsers /></AdminRoute>)}</Route>
        <Route path="/admin/courses">{() => (<AdminRoute><AdminCourses /></AdminRoute>)}</Route>
        <Route path="/admin/analytics">{() => (<AdminRoute><AdminAnalytics /></AdminRoute>)}</Route>
        <Route path="/admin/coupons">{() => (<AdminRoute><AdminCoupons /></AdminRoute>)}</Route>
        <Route path="/admin/pricing">{() => (<AdminRoute><AdminPricing /></AdminRoute>)}</Route>
        <Route path="/admin/payment-settings">{() => (<AdminRoute><AdminPaymentSettings /></AdminRoute>)}</Route>
        <Route path="/admin/payment-verifications">{() => (<AdminRoute><AdminPaymentVerifications /></AdminRoute>)}</Route>
        <Route path="/admin/refund-management">{() => (<AdminRoute><AdminRefundManagement /></AdminRoute>)}</Route>
        <Route path="/admin/content-library">{() => (<AdminRoute><AdminContentLibrary /></AdminRoute>)}</Route>
        <Route path="/admin/enrollments">{() => (<AdminRoute><AdminEnrollments /></AdminRoute>)}</Route>
        <Route path="/admin/payments">{() => (<AdminRoute><AdminPayments /></AdminRoute>)}</Route>
        <Route path="/admin/certificates">{() => (<AdminRoute><AdminCertificates /></AdminRoute>)}</Route>
        <Route path="/admin/communications">{() => (<AdminRoute><AdminCommunications /></AdminRoute>)}</Route>
        <Route path="/admin/settings">{() => (<AdminRoute><AdminSettings /></AdminRoute>)}</Route>
        <Route path="/admin/tour-management">{() => (<AdminRoute><TourManagementPage /></AdminRoute>)}</Route>
        <Route path="/admin/add-course">{() => (<AdminRoute><AddCoursePage /></AdminRoute>)}</Route>
        <Route path="/admin/courses/:id/view">{() => (<AdminRoute><AdminCourseView /></AdminRoute>)}</Route>
        <Route path="/admin/courses/:id/modules/:moduleId">{() => (<AdminRoute><AdminModuleContent /></AdminRoute>)}</Route>
        <Route path="/admin/courses/:id/edit">{() => (<AdminRoute><AdminCourseEdit /></AdminRoute>)}</Route>
        <Route path="/admin/bundles">{() => (<AdminRoute><AdminBundlesPage /></AdminRoute>)}</Route>
        <Route path="/admin/promo-codes">{() => (<AdminRoute><AdminPromoCodesPage /></AdminRoute>)}</Route>
        <Route path="/admin/users/create">{() => (<AdminRoute><AdminCreateUserPage /></AdminRoute>)}</Route>
        <Route path="/admin/tutors">{() => (<AdminRoute><AdminTutorsPage /></AdminRoute>)}</Route>
        <Route path="/student-monitoring">{() => (<InstructorRoute><StudentMonitoringPage /></InstructorRoute>)}</Route>
        <Route>{() => (<PublicLayout><NotFoundPage /></PublicLayout>)}</Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  const {
    isOnboardingOpen,
    shouldShowTrigger,
    startOnboarding,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding();

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden text-slate-100 relative">
      
      {/* 1. Bottom Layer: The Video (-z-20) */}
      <VideoBackground />
      
      {/* 2. Middle Layer: Lighting Overlay (-z-10) */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* 3. Top Layer: Main Content (relative z-10) */}
      <div className="relative z-10">
        <Router />
        <Toaster />
        <HelpFloat onClick={startOnboarding} />
        <WhatsAppFloat />
        
        <OnboardingWalkthrough
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          onComplete={completeOnboarding}
        />
        
        {shouldShowTrigger && (
          <OnboardingTrigger
            onClick={startOnboarding}
            className="z-40"
          />
        )}
      </div>
    </div>
  );
}

export default App;