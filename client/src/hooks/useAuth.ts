import { useQuery } from "@tanstack/react-query";
import { type UserProfile } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function useAuth() {
  const { toast } = useToast();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<UserProfile | null>({ on401: "returnNull" }),
    retry: false,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && !isLoading) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      });
    }
  }, [error, isLoading, toast]);

  const login = () => {
    window.location.href = "/api/login";
  };

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };
}