import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type UserProfile } from '@/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authError, setAuthError] = useState<string | null>(null);

  const { 
    data: user, 
    isLoading, 
    error,
    refetch: refetchUser 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('Unauthorized')
      )) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        setAuthError('Connection error. Please check your internet connection.');
      } else {
        setAuthError(null);
      }
    }
  }, [error]);

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    refetchUser: () => refetchUser(),
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">
            {authError}
          </p>
          <button
            onClick={() => {
              setAuthError(null);
              refetchUser();
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}