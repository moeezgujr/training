import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock, CheckCircle } from "lucide-react";

interface AccessStatusIndicatorProps {
  type: 'course' | 'lesson';
  itemId: string;
  showText?: boolean;
  className?: string;
}

interface AccessCheckResult {
  hasAccess: boolean;
  missingPrerequisites: Array<{
    id: string;
    title: string;
  }>;
}

export function AccessStatusIndicator({ 
  type, 
  itemId, 
  showText = false, 
  className = "" 
}: AccessStatusIndicatorProps) {
  const { data: accessCheck, isLoading } = useQuery<AccessCheckResult>({
    queryKey: [`/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/access`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/access`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        {showText && <span className="text-sm text-muted-foreground">Checking access...</span>}
      </div>
    );
  }

  if (!accessCheck) {
    return null;
  }

  const { hasAccess, missingPrerequisites } = accessCheck;

  if (hasAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 ${className}`}>
              <Unlock className="w-4 h-4 text-green-500" />
              {showText && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Accessible
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This {type} is accessible - no prerequisites required</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            <Lock className="w-4 h-4 text-orange-500" />
            {showText && (
              <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                Locked ({missingPrerequisites.length} required)
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div>
            <p className="font-medium mb-2">
              Complete these prerequisites to unlock this {type}:
            </p>
            <ul className="space-y-1">
              {missingPrerequisites.map((prereq) => (
                <li key={prereq.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-orange-500" />
                  {prereq.title}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Higher-order component to wrap items with access checks
interface WithAccessControlProps {
  type: 'course' | 'lesson';
  itemId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function WithAccessControl({ 
  type, 
  itemId, 
  children, 
  fallback,
  className = ""
}: WithAccessControlProps) {
  const { data: accessCheck, isLoading } = useQuery<AccessCheckResult>({
    queryKey: [`/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/access`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/${type === 'course' ? 'courses' : 'lessons'}/${itemId}/access`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className={`opacity-50 ${className}`}>
        {children}
      </div>
    );
  }

  if (!accessCheck?.hasAccess) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded">
          {fallback || (
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <Lock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-medium text-sm">This {type} is locked</p>
                <p className="text-xs text-muted-foreground">
                  Complete {accessCheck?.missingPrerequisites.length || 0} prerequisite{(accessCheck?.missingPrerequisites.length || 0) !== 1 ? 's' : ''} to access
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}