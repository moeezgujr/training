import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionText?: string;
  actionOnClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionText,
  actionOnClick,
  className,
  size = "md",
}: EmptyStateProps) {
  // Size classes based on the size prop
  const sizeClasses = {
    sm: {
      wrapper: "py-8",
      icon: "h-10 w-10 mb-3",
      title: "text-lg font-medium",
      description: "text-sm max-w-xs",
    },
    md: {
      wrapper: "py-12",
      icon: "h-12 w-12 mb-4",
      title: "text-xl font-medium",
      description: "text-sm max-w-sm",
    },
    lg: {
      wrapper: "py-16",
      icon: "h-16 w-16 mb-6",
      title: "text-2xl font-semibold",
      description: "text-base max-w-md",
    },
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-dashed px-6",
        sizeClasses[size].wrapper,
        className
      )}
    >
      <div className={cn("text-muted-foreground", sizeClasses[size].icon)}>
        {icon}
      </div>
      <h3 className={cn("text-foreground", sizeClasses[size].title)}>
        {title}
      </h3>
      <p className={cn("mt-2 text-muted-foreground", sizeClasses[size].description)}>
        {description}
      </p>
      {(actionText && actionHref) || actionOnClick ? (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild>
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          ) : (
            <Button onClick={actionOnClick}>{actionText}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}