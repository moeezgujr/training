import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

/**
 * Hook for fetching data needed on the learner dashboard
 */
export function useDashboardData() {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading: isEnrolledLoading } = useQuery({
    queryKey: ["/api/courses/enrolled"],
    enabled: isAuthenticated,
  });
  
  // Fetch in progress courses
  const { data: inProgressCourses = [], isLoading: isInProgressLoading } = useQuery({
    queryKey: ["/api/courses/enrolled", "in_progress"],
    enabled: isAuthenticated,
  });
  
  // Fetch recommended courses
  const { data: recommendedCourses = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ["/api/courses/recommended"],
    enabled: isAuthenticated,
  });
  
  // Fetch recent activity
  const { data: recentActivity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["/api/user/activity"],
    enabled: isAuthenticated,
  });
  
  // Fetch user certificates
  const { data: certificates = [], isLoading: isCertificatesLoading } = useQuery({
    queryKey: ["/api/certificates"],
    enabled: isAuthenticated,
  });
  
  // Format recent activity into courses
  const recentCourses = Array.isArray(recentActivity) 
    ? recentActivity.map((activity: any) => ({
        id: activity.courseId,
        title: activity.title,
        courseName: activity.courseName,
        type: activity.type,
        date: activity.date,
        completed: activity.completed,
        link: activity.link,
      }))
    : [];
  
  // Format upcoming deadlines
  const upcomingDeadlines = Array.isArray(enrolledCourses)
    ? enrolledCourses
        .filter((course: any) => course.status === "in_progress")
        .slice(0, 5)
        .flatMap((course: any) => {
          const assignments = course.modules
            .flatMap((module: any) => module.assignments || [])
            .filter((assignment: any) => !assignment.completed)
            .map((assignment: any) => ({
              title: assignment.title,
              courseName: course.title,
              type: "assignment",
              dueDate: assignment.dueDate,
              link: `/courses/${course.id}/modules/${assignment.moduleId}`,
              daysLeft: Math.ceil(
                (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              ),
            }));
          
          return assignments;
        })
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
    : [];
  
  return {
    enrolledCourses,
    inProgressCourses,
    recentCourses,
    recommendedCourses,
    certificates,
    upcomingDeadlines,
    isLoading: 
      isEnrolledLoading || 
      isInProgressLoading || 
      isRecommendedLoading || 
      isActivityLoading || 
      isCertificatesLoading,
  };
}

/**
 * Hook for fetching data needed on the instructor dashboard
 */
export function useInstructorDashboardData() {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch instructor courses
  const { data: instructorCourses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/instructor/courses"],
    enabled: isAuthenticated && user?.role === "instructor",
  });
  
  // Fetch instructor stats
  const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/instructor/stats"],
    enabled: isAuthenticated && user?.role === "instructor",
  });
  
  // Fetch recent enrollments
  const { data: recentEnrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["/api/instructor/enrollments/recent"],
    enabled: isAuthenticated && user?.role === "instructor",
  });
  
  // Fetch pending assignments
  const { data: pendingAssignments = [], isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ["/api/instructor/assignments/pending"],
    enabled: isAuthenticated && user?.role === "instructor",
  });
  
  return {
    instructorCourses,
    stats,
    recentEnrollments,
    pendingAssignments,
    isLoading: 
      isCoursesLoading || 
      isStatsLoading || 
      isEnrollmentsLoading || 
      isAssignmentsLoading,
  };
}

/**
 * Hook for fetching data needed on the admin dashboard
 */
export function useAdminDashboardData() {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch all users
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  // Fetch admin stats
  const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  // Fetch all courses stats
  const { data: coursesWithStats = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  return {
    users,
    stats,
    coursesWithStats,
    isLoading: isUsersLoading || isStatsLoading || isCoursesLoading,
  };
}