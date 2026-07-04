import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setSubmitError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        'Failed to log in. Please check your credentials and try again.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Background radial overlays */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl -top-40 -right-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary-500/5 blur-3xl -bottom-40 -left-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md"
      >
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/15 mb-4">
            SF
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Log in to manage your budgets and financial decisions.
          </p>
        </div>

        <GlassCard className="p-8">
          {submitError && (
            <div className="mb-5 p-4 rounded-xl bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 text-sm font-semibold text-danger-600 dark:text-danger-400">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email input */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                error={errors.email?.message}
                className="pl-12"
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[44px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="pl-12 pr-12"
              />
            </div>

            {/* Helper links */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button type="submit" isLoading={isSubmitting} fullWidth className="py-3.5 mt-2">
              Sign In
            </Button>
          </form>
        </GlassCard>

        {/* Footer links */}
        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
export default Login;
