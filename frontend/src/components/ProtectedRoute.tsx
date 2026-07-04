import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding, force them to onboarding flow.
  // LifestyleType is the final step. If it's missing, redirect to onboarding steps.
  const isOnboardingPath =
    location.pathname.startsWith('/onboarding') ||
    location.pathname === '/complete-profile' ||
    location.pathname === '/financial-details' ||
    location.pathname === '/lifestyle-selection';

  if (!user.lifestyleType && !isOnboardingPath) {
    // If they have no profile details, go to step 1
    if (!user.mobileNumber || !user.city) {
      return <Navigate to="/complete-profile" replace />;
    }
    // If they have personal but no financial profile, go to step 2
    // Let's assume we can direct them to complete-profile, they will follow the onboarding wizard.
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
