import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Guard
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Splash } from './pages/auth/Splash';
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { CompleteProfile } from './pages/onboarding/CompleteProfile';
import { FinancialDetails } from './pages/onboarding/FinancialDetails';
import { LifestyleSelection } from './pages/onboarding/LifestyleSelection';
import { Home } from './pages/dashboard/Home';
import { VacationPlanner } from './pages/planner/VacationPlanner';
import { PurchasePlanner } from './pages/planner/PurchasePlanner';
import { EmergencyFundPlanner } from './pages/planner/EmergencyFundPlanner';
import { SavingsAnalysis } from './pages/planner/SavingsAnalysis';
import { HealthReport } from './pages/health/HealthReport';
import { NotificationCenter } from './pages/notifications/NotificationCenter';
import { Profile } from './pages/profile/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Unprotected Auth / Splash Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Onboarding Flow Steps */}
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financial-details"
                element={
                  <ProtectedRoute>
                    <FinancialDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lifestyle-selection"
                element={
                  <ProtectedRoute>
                    <LifestyleSelection />
                  </ProtectedRoute>
                }
              />

              {/* Main App Layout Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/vacation"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <VacationPlanner />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/purchase"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PurchasePlanner />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/emergency-fund"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <EmergencyFundPlanner />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner/savings-analysis"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SavingsAnalysis />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health-report"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <HealthReport />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <NotificationCenter />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
