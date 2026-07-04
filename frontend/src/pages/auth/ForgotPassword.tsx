import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { Mail, ShieldCheck, KeyRound, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyOTP({ email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary-500/5 blur-3xl -bottom-40 -right-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        {step < 4 && (
          <button
            onClick={() => {
              if (step === 1) navigate('/login');
              else setStep((prev) => (prev - 1) as any);
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 font-semibold text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {step === 1 ? 'Login' : `Step ${step - 1}`}
          </button>
        )}

        <GlassCard className="p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 text-sm font-semibold text-danger-600 dark:text-danger-400 animate-shake">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-white">Forgot Password?</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    Enter your email address and we'll send you an OTP to reset your password.
                  </p>
                </div>

                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-[44px] text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <Input
                      id="forgot-email"
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12"
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 mt-2">
                    Send OTP Verification
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-white">Verify OTP Code</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    We've sent a 6-digit OTP verification code to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>. Check your email (or terminal/console).
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-[44px] text-slate-400">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <Input
                      id="otp-code"
                      label="6-Digit OTP Code"
                      type="text"
                      maxLength={6}
                      pattern="\d{6}"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      className="pl-12 text-center text-lg tracking-[0.4em] font-bold"
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 mt-2">
                    Verify Code
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-white">Reset Password</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    Create a new secure password for your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-[44px] text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </span>
                    <Input
                      id="new-password"
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-12"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-[44px] text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </span>
                    <Input
                      id="confirm-new-password"
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-12"
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 mt-2">
                    Reset & Update Password
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="text-center space-y-6 py-4"
              >
                <div className="flex justify-center text-secondary-500">
                  <CheckCircle2 className="w-16 h-16 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-slate-800 dark:text-white">Success!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
                <Button onClick={() => navigate('/login')} fullWidth className="py-3.5">
                  Proceed to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
export default ForgotPassword;
