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
    
    // Enrollment properties
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
    <Card className={`group overflow-hidden border-white/10 bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 ${className}`}>
      
      {/* Course Image Section */}
      <div className={`${getAspectRatioClass()} overflow-hidden bg-muted relative`}>
        <img
          src={course.imageUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1471&q=80'}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
      </div>
      
      {/* ALIGNMENT FIX: 
          - Increased horizontal padding to px-10 (40px) to move text significantly away from the left edge.
          - Added items-start and max-w-prose to ensure text feels balanced.
      */}
      <CardHeader className="px-10 pt-8 pb-3 space-y-3">
        {/* Tags Row */}
        {course.tags && course.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-2 mb-1">
            {course.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 text-[9px] uppercase tracking-widest font-bold px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Link href={`/courses/${course.id}`} className="group/link">
          <h3 className="font-bold text-xl leading-tight text-white group-hover/link:text-cyan-400 transition-colors line-clamp-2">
            {course.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <div className="h-1 w-1 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)]" />
          <span>by <span className="text-slate-200">{course.instructorName}</span></span>
        </div>
      </CardHeader>
      
      <CardContent className="px-10 py-4 space-y-6">
        {/* Description */}
        {!compact && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 max-w-[95%]">
            {truncateDescription(course.description, 120)}
          </p>
        )}
        
        {/* Course Meta Grid - Balanced 2-column layout */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          {course.duration !== undefined && (
            <div className="flex items-center gap-2.5 hover:text-slate-300 transition-colors">
              <Clock className="h-4 w-4 text-cyan-500/60" />
              <span>{course.duration} hours</span>
            </div>
          )}
          
          {course.moduleCount !== undefined && (
            <div className="flex items-center gap-2.5 hover:text-slate-300 transition-colors">
              <BookOpen className="h-4 w-4 text-cyan-500/60" />
              <span>{course.moduleCount} modules</span>
            </div>
          )}
          
          {course.enrolledCount !== undefined && !compact && (
            <div className="flex items-center gap-2.5 hover:text-slate-300 transition-colors">
              <Users className="h-4 w-4 text-cyan-500/60" />
              <span>{course.enrolledCount} students</span>
            </div>
          )}
          
          {course.createdAt && !compact && (
            <div className="flex items-center gap-2.5 hover:text-slate-300 transition-colors">
              <CalendarDays className="h-4 w-4 text-cyan-500/60" />
              <span>{formatDate(course.createdAt)}</span>
            </div>
          )}
        </div>
        
        {/* Progress bar for enrolled courses */}
        {isEnrolled && (
          <div className="pt-2">
            <CourseProgressIndicator 
              progress={course.progress || 0} 
              className="mt-2" 
              size="sm"
              showLabel 
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-10 pb-10 pt-4 flex flex-col gap-3">
        {isEnrolled ? (
          <Button 
            variant="default" 
            size="lg" 
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-12 shadow-[0_0_20px_rgba(8,145,178,0.2)]"
            asChild
          >
            <Link href={`/courses/${course.id}`}>
              {course.progress === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  Resume Training
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Link>
          </Button>
        ) : (
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
              asChild
            >
              <Link href={`/courses/${course.id}`}>
                Explore
              </Link>
            </Button>
            
            {isAuthenticated && user?.role === 'learner' && (
              <AddToCartButton 
                courseId={course.id}
                size="lg"
                variant="default"
                className="flex-1 bg-white text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl transition-all"
              />
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}