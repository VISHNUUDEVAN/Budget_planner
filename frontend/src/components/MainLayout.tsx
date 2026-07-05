import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  ShieldAlert,
  TrendingUp,
  HeartPulse,
  Bell,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIChatbotWidget } from './AIChatbotWidget';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch unread notifications count
  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.getNotifications(true),
    refetchInterval: 10000, // poll every 10s
    enabled: !!user,
  });

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Vacation Planner', path: '/planner/vacation', icon: Calendar },
    { label: 'Purchase Planner', path: '/planner/purchase', icon: ShoppingBag },
    { label: 'Emergency Fund', path: '/planner/emergency-fund', icon: ShieldAlert },
    { label: 'Savings Analysis', path: '/planner/savings-analysis', icon: TrendingUp },
    { label: 'Financial Health', path: '/health-report', icon: HeartPulse },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: notifData?.unreadCount },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Financial Score', path: '/financial-score', icon: Target },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-500/20">
            SF
          </div>
          <div>
            <h1 className="font-heading font-bold text-slate-800 dark:text-white leading-tight">Smart Finance</h1>
            <p className="text-xs text-slate-400">Decision Assistant</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-semibold text-sm ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${isActive ? 'bg-white text-primary-600' : 'bg-danger-500 text-white animate-pulse'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* User badge */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                {user.fullName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user.fullName}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user.lifestyleType || 'Onboarding'}</p>
              </div>
            </div>
          )}

          {/* Theme & Logout */}
          <div className="flex items-center justify-between gap-2 px-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 font-semibold text-sm transition-colors border border-transparent hover:border-danger-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header - Mobile & Actionbar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold">
              SF
            </div>
            <span className="font-heading font-bold text-slate-800 dark:text-white">Smart Finance</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed inset-x-0 top-[65px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xl z-30 p-4 max-h-[80vh] overflow-y-auto"
            >
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 text-xxs font-bold rounded-full ${isActive ? 'bg-white text-primary-600' : 'bg-danger-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 font-semibold text-sm hover:bg-danger-50 dark:hover:bg-danger-900/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
        <AIChatbotWidget />
      </div>
    </div>
  );
}
