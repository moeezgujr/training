import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_STORAGE_KEY = 'meetingMatters_onboarding_completed';

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    setHasCompletedOnboarding(completed === 'true');

    // Auto-show onboarding for new authenticated users who haven't completed it
    if (isAuthenticated && user && completed !== 'true') {
      // Delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const startOnboarding = () => {
    console.log('startOnboarding called, current state:', isOnboardingOpen);
    setIsOnboardingOpen(true);
    console.log('setIsOnboardingOpen(true) called, new state should be true');
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setHasCompletedOnboarding(false);
  };

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    startOnboarding,
    closeOnboarding,
    completeOnboarding,
    resetOnboarding,
    shouldShowTrigger: isAuthenticated && hasCompletedOnboarding
  };
}