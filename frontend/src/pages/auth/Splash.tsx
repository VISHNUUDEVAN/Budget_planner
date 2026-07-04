import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function Splash() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (!user.lifestyleType) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Decorative gradient glowing circles */}
      <div className="absolute w-96 h-96 rounded-full bg-primary-600/10 blur-3xl -top-20 -left-20 animate-pulse-slow" />
      <div className="absolute w-96 h-96 rounded-full bg-secondary-500/10 blur-3xl -bottom-20 -right-20 animate-pulse-slow" />

      <div className="z-10 flex flex-col items-center gap-6 text-center px-4">
        {/* Animated App Icon Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 1 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center shadow-2xl shadow-primary-500/30"
        >
          <span className="text-white font-heading font-black text-4xl select-none">SF</span>
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300"
          >
            Smart Financial
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-sm font-semibold tracking-widest text-primary-300 uppercase"
          >
            Decision Assistant
          </motion.p>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-1.5 text-slate-300 font-semibold text-lg max-w-sm"
        >
          <span>Plan Smart.</span>
          <span className="text-secondary-400">Spend Smart.</span>
          <span className="text-accent-400">Save Smart.</span>
        </motion.div>

        {/* Smooth Loader bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-8">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="relative h-full w-1/2 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
export default Splash;
