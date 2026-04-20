import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CourseProgressIndicatorProps {
  progress: number;  // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CourseProgressIndicator({ 
  progress, 
  size = "md", 
  showLabel = false,
  className,
}: CourseProgressIndicatorProps) {
  // Ensure progress is within bounds
  const boundedProgress = Math.min(100, Math.max(0, progress));
  
  // Size classes
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };
  
  // Color based on progress
  const getProgressColor = () => {
    if (boundedProgress < 25) return "bg-red-500";
    if (boundedProgress < 50) return "bg-orange-500";
    if (boundedProgress < 75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="font-medium">Progress</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Your progress through this course</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-medium">{Math.round(boundedProgress)}%</span>
        </div>
      )}
      
      <Progress 
        value={boundedProgress} 
        className={cn(sizeClasses[size])}
        indicatorClassName={getProgressColor()}
      />
    </div>
  );
}