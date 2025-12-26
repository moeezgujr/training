import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Redirect } from "@/components/ui/redirect";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { HelpFloat } from "@/components/help-float";

import { OnboardingWalkthrough } from "@/components/onboarding/onboarding-walkthrough";
import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/index"));
const CoursesPage = lazy(() => import("@/pages/courses/index"));
const CourseDetailsPage = lazy(() => import("@/pages/courses/[id]"));
const CartPage = lazy(() => import("@/pages/cart"));
const StudentDashboard = lazy(() => import("@/pages/student-dashboard"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const SignupPage = lazy(() => import("@/pages/auth/signup"));
const InstructorLoginPage = lazy(() => import("@/pages/auth/instructor-login"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));
const Dashboard = lazy(() => import("@/pages/dashboard/index"));
const DashboardSettings = lazy(() => import("@/pages/dashboard/settings"));

// Instructor pages
const InstructorDashboard = lazy(() => import("@/pages/instructor/index"));
const InstructorCourses = lazy(() => import("@/pages/instructor/courses/index"));
const InstructorStudents = lazy(() => import("@/pages/instructor/students"));
const InstructorAnalytics = lazy(() => import("@/pages/instructor/analytics"));
const InstructorAssignments = lazy(() => import("@/pages/instructor/courses/assignments"));
const InstructorCourseCreate = lazy(() => import("@/pages/instructor/courses/create"));
const InstructorCourseView = lazy(() => import("@/pages/instructor/courses/[id]/index"));
const InstructorCourseEdit = lazy(() => import("@/pages/instructor/courses/[id]/edit"));
const CourseBuilder = lazy(() => import("@/pages/instructor/courses/builder"));
const CourseCreator = lazy(() => import("@/pages/instructor/courses/creator"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminPricing = lazy(() => import("@/pages/admin/pricing"));
const AdminContentLibrary = lazy(() => import("@/pages/admin/content-library"));
const AdminEnrollments = lazy(() => import("@/pages/admin/enrollments"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminCertificates = lazy(() => import("@/pages/admin/certificates"));
const AdminCommunications = lazy(() => import("@/pages/admin/communications"));
const AdminPaymentSettings = lazy(() => import("@/pages/admin/payment-settings"));
const AdminPaymentVerifications = lazy(() => import("@/pages/admin/payment-verifications"));
const AdminRefundManagement = lazy(() => import("@/pages/admin/refund-management"));
const AdminCourseEdit = lazy(() => import("@/pages/admin/courses/[id]/edit"));
const AdminCourseView = lazy(() => import("@/pages/admin/courses/[id]/view"));
const AdminModuleContent = lazy(() => import("@/pages/admin/courses/[id]/modules/[moduleId]"));
const PaymentSubmissionPage = lazy(() => import("@/pages/payment-submission"));
const StudentPaymentHistory = lazy(() => import("@/pages/student/payment-history"));
const AddCoursePage = lazy(() => import("@/pages/admin/add-course"));
const TourManagementPage = lazy(() => import("@/pages/admin/tour-management"));
const CoursePaymentPage = lazy(() => import("@/pages/checkout/course-payment"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

// Student pages
const CertificatesPage = lazy(() => import("@/pages/certificates"));
const NotebookPage = lazy(() => import("@/pages/notebook"));
const MessagesPage = lazy(() => import("@/pages/messages/index"));
const StudentMonitoringPage = lazy(() => import("@/pages/student-monitoring"));
const UserGuidePage = lazy(() => import("@/pages/user-guide"));
const LearnPage = lazy(() => import("@/pages/courses/[courseId]/learn"));
const CourseModuleViewer = lazy(() => import("@/components/course/course-viewer"));

// Bundle and payment pages
const BundlesPage = lazy(() => import("@/pages/bundles/index"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));

// Admin bundle and promo management
const AdminBundlesPage = lazy(() => import("@/pages/admin/bundles/index"));
const AdminPromoCodesPage = lazy(() => import("@/pages/admin/promo-codes"));
const AdminCreateUserPage = lazy(() => import("@/pages/admin/users/create"));
const AdminTutorsPage = lazy(() => import("@/pages/admin/tutors"));

// Footer pages
const AboutPage = lazy(() => import("@/pages/about"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const TermsPage = lazy(() => import("@/pages/terms"));
const ContactPage = lazy(() => import("@/pages/contact"));
const SupportPage = lazy(() => import("@/pages/support"));

// Registration pages
const StudentRegistrationPage = lazy(() => import("@/pages/student-registration"));
const RegistrationSuccessPage = lazy(() => import("@/pages/registration-success"));

// Demo pages
const CookiesPage = lazy(() => import("@/pages/cookies"));

// Fallback loader for lazy-loaded components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
);

// Protected route component - redirect to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  return <>{children}</>;
};

// Routes that require instructor role
const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (user?.role !== "instructor" && user?.role !== "admin") return <Redirect to="/dashboard" />;
  return <>{children}</>;
};

// Routes that require admin role
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (user?.role !== "admin") return <Redirect to="/dashboard" />;
  return <>{children}</>;
};

// The Router component handles all the routes in the application
function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Routes */}
        <Route path="/">
          <HomePage />
        </Route>
        
        <Route path="/courses">
          {() => (
            <PublicLayout>
              <CoursesPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/courses/:id">
          {() => (
            <PublicLayout>
              <CourseDetailsPage />
            </PublicLayout>
          )}
        </Route>

        {/* FIXED: Both routes for Course Module Viewer */}
        {/* For Browse Courses → Start Learning */}
        <Route path="/courses/:courseId/modules/:moduleId">
          {() => (
            <ProtectedRoute>
              <CourseModuleViewer />
            </ProtectedRoute>
          )}
        </Route>

        {/* For My Courses → Continue */}
        <Route path="/learn/:courseId/:moduleId">
          {() => (
            <ProtectedRoute>
              <CourseModuleViewer />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/courses/:courseId/learn">
          {() => (
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/cart">
          {() => (
            <PublicLayout>
              <CartPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/student-dashboard">
          {() => (
            <PublicLayout>
              <StudentDashboard />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/bundles">
          {() => (
            <PublicLayout>
              <BundlesPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/checkout">
          {() => (
            <PublicLayout hideFooter>
              <CheckoutPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/checkout/course/:courseId">
          {(params) => (
            <PublicLayout hideFooter>
              <CoursePaymentPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/auth/login">
          {() => (
            <PublicLayout hideFooter>
              <LoginPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/auth/signup">
          {() => (
            <PublicLayout hideFooter>
              <SignupPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/auth/instructor">
          {() => (
            <PublicLayout hideFooter>
              <InstructorLoginPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/auth/admin">
          {() => (
            <PublicLayout hideFooter>
              <AdminLoginPage />
            </PublicLayout>
          )}
        </Route>
        
        {/* Registration Pages */}
        <Route path="/register/student">
          <StudentRegistrationPage />
        </Route>
        
        <Route path="/registration-success">
          <RegistrationSuccessPage />
        </Route>
        
        {/* Footer Pages */}
        <Route path="/about">
          {() => (
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/privacy">
          {() => (
            <PublicLayout>
              <PrivacyPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/terms">
          {() => (
            <PublicLayout>
              <TermsPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/contact">
          {() => (
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/support">
          {() => (
            <PublicLayout>
              <SupportPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/user-guide">
          {() => (
            <PublicLayout>
              <UserGuidePage />
            </PublicLayout>
          )}
        </Route>
        
        
        <Route path="/cookies">
          {() => (
            <PublicLayout>
              <CookiesPage />
            </PublicLayout>
          )}
        </Route>
        
        <Route path="/payment/submit/:courseId">
          {() => (
            <ProtectedRoute>
              <PaymentSubmissionPage />
            </ProtectedRoute>
          )}
        </Route>
        
        {/* Protected Routes */}
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <PublicLayout>
                <StudentDashboard />
              </PublicLayout>
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/dashboard/settings">
          {() => (
            <ProtectedRoute>
              <DashboardSettings />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/certificates">
          {() => (
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/notebook">
          {() => (
            <ProtectedRoute>
              <NotebookPage />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/messages">
          {() => (
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          )}
        </Route>
        
        {/* Instructor Routes */}
        <Route path="/instructor">
          {() => (
            <InstructorRoute>
              <InstructorDashboard />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/courses">
          {() => (
            <InstructorRoute>
              <InstructorCourses />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/students">
          {() => (
            <InstructorRoute>
              <InstructorStudents />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/analytics">
          {() => (
            <InstructorRoute>
              <InstructorAnalytics />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/assignments">
          {() => (
            <InstructorRoute>
              <InstructorAssignments />
            </InstructorRoute>
          )}
        </Route>

        <Route path="/instructor/courses/create">
          {() => (
            <InstructorRoute>
              <CourseCreator />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/courses/:id">
          {(params) => (
            <InstructorRoute>
              <InstructorCourseView />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/courses/:id/edit">
          {(params) => (
            <InstructorRoute>
              <InstructorCourseEdit />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/courses/builder/:courseId">
          {(params) => (
            <InstructorRoute>
              <CourseBuilder />
            </InstructorRoute>
          )}
        </Route>
        
        <Route path="/instructor/courses/creator">
          {(params) => (
            <InstructorRoute>
              <CourseCreator />
            </InstructorRoute>
          )}
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin">
          {() => (
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/users">
          {() => (
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/courses">
          {() => (
            <AdminRoute>
              <AdminCourses />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/analytics">
          {() => (
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/coupons">
          {() => (
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          )}
        </Route>

        <Route path="/admin/pricing">
          {() => (
            <AdminRoute>
              <AdminPricing />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/payment-settings">
          {() => (
            <AdminRoute>
              <AdminPaymentSettings />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/payment-verifications">
          {() => (
            <AdminRoute>
              <AdminPaymentVerifications />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/refund-management">
          {() => (
            <AdminRoute>
              <AdminRefundManagement />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/content-library">
          {() => (
            <AdminRoute>
              <AdminContentLibrary />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/enrollments">
          {() => (
            <AdminRoute>
              <AdminEnrollments />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/payments">
          {() => (
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/certificates">
          {() => (
            <AdminRoute>
              <AdminCertificates />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/communications">
          {() => (
            <AdminRoute>
              <AdminCommunications />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/settings">
          {() => (
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/tour-management">
          {() => (
            <AdminRoute>
              <TourManagementPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/add-course">
          {() => (
            <AdminRoute>
              <AddCoursePage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/courses/create">
          {() => (
            <AdminRoute>
              <AddCoursePage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/courses/:id/view">
          {() => (
            <AdminRoute>
              <AdminCourseView />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/courses/:id/modules/:moduleId">
          {() => (
            <AdminRoute>
              <AdminModuleContent />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/courses/:id/edit">
          {() => (
            <AdminRoute>
              <AdminCourseEdit />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/bundles">
          {() => (
            <AdminRoute>
              <AdminBundlesPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/promo-codes">
          {() => (
            <AdminRoute>
              <AdminPromoCodesPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/users/create">
          {() => (
            <AdminRoute>
              <AdminCreateUserPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/tutors">
          {() => (
            <AdminRoute>
              <AdminTutorsPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/admin/tour-management">
          {() => (
            <AdminRoute>
              <TourManagementPage />
            </AdminRoute>
          )}
        </Route>
        
        <Route path="/student-monitoring">
          {() => (
            <InstructorRoute>
              <StudentMonitoringPage />
            </InstructorRoute>
          )}
        </Route>
        
        {/* 404 Route - must be last */}
        <Route>
          {() => (
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          )}
        </Route>
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
    <div className="min-h-screen bg-background">
      <Router />
      <Toaster />
      <HelpFloat onClick={startOnboarding} />
      <WhatsAppFloat />
      
      {/* Onboarding System */}
      <OnboardingWalkthrough
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
      
      {/* Floating Onboarding Trigger */}
      {shouldShowTrigger && (
        <OnboardingTrigger
          onClick={startOnboarding}
          className="z-40"
        />
      )}
    </div>
  );
}

export default App;