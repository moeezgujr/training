import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseProgressIndicator } from "@/components/course-progress-indicator";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useAuth } from "@/hooks/useAuth";
import { 
  Clock, 
  Users, 
  CalendarDays, 
  BookOpen,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    instructorName: string;
    instructorId: string;
    duration?: number;
    moduleCount?: number;
    enrolledCount?: number;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    
    // Enrollment properties (if the user is enrolled)
    progress?: number;
    status?: string;
  };
  compact?: boolean;
  aspectRatio?: "video" | "square";
  className?: string;
}

export function CourseCard({ 
  course, 
  compact = false,
  aspectRatio = "video",
  className = ""
}: CourseCardProps) {
  const { isAuthenticated, user } = useAuth();
  const isEnrolled = typeof course.progress !== 'undefined';
  
  // Truncate description for compact view
  const truncateDescription = (text: string, charLimit: number) => {
    if (text.length <= charLimit) return text;
    return text.slice(0, charLimit) + '...';
  };
  
  // Format date to display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get appropriate aspect ratio class
  const getAspectRatioClass = () => {
    return aspectRatio === "video" ? "aspect-video" : "aspect-square";
  };
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Course Image */}
      <div className={`${getAspectRatioClass()} overflow-hidden bg-muted`}>
        <img
          src={course.imageUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80'}
          alt={course.title}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      
      <CardHeader className="p-4 pb-2">
        {/* Title */}
        <Link href={`/courses/${course.id}`} className="group">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
        </Link>
        
        {/* Instructor */}
        <div className="text-sm text-muted-foreground">
          by {course.instructorName}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Description */}
        {!compact && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {truncateDescription(course.description, 120)}
          </p>
        )}
        
        {/* Course Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {course.duration !== undefined && (
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{course.duration} hours</span>
            </div>
          )}
          
          {course.moduleCount !== undefined && (
            <div className="flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              <span>{course.moduleCount} modules</span>
            </div>
          )}
          
          {course.enrolledCount !== undefined && !compact && (
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{course.enrolledCount} students</span>
            </div>
          )}
          
          {course.createdAt && !compact && (
            <div className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(course.createdAt)}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {course.tags && course.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="px-2 py-0 text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="px-1.5 py-0 text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Progress bar for enrolled courses */}
        {isEnrolled && (
          <CourseProgressIndicator 
            progress={course.progress || 0} 
            className="mt-2" 
            size="sm"
            showLabel 
          />
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {isEnrolled ? (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            asChild
          >
            <Link href={`/courses/${course.id}`}>
              {course.progress === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : course.progress && course.progress > 0 ? (
                <>
                  Continue Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Start Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Link>
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link href={`/courses/${course.id}`}>
                View Course
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            {isAuthenticated && user?.role === 'learner' && (
              <AddToCartButton 
                courseId={course.id}
                size="sm"
                variant="default"
                className="flex-1"
              />
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}