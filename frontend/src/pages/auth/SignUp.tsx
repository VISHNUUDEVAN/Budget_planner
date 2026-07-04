import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setSubmitError(null);
      await signup({
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password,
      });
      // Redirect to Complete Profile onboarding page
      navigate('/complete-profile');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        'Registration failed. Please check your details and try again.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 relative overflow-hidden transition-colors duration-300">
      {/* Background radial overlays */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary-500/5 blur-3xl -bottom-40 -right-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/15 mb-4">
            SF
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-800 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Join us to start planning and spending smart.
          </p>
        </div>

        <GlassCard className="p-8">
          {submitError && (
            <div className="mb-5 p-4 rounded-xl bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 text-sm font-semibold text-danger-600 dark:text-danger-400">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <UserIcon className="w-5 h-5" />
              </span>
              <Input
                {...register('fullName')}
                id="fullName"
                label="Full Name"
                placeholder="John Doe"
                error={errors.fullName?.message}
                className="pl-12"
              />
            </div>

            {/* Email Address */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email Address"
                placeholder="john.doe@example.com"
                error={errors.email?.message}
                className="pl-12"
              />
            </div>

            {/* Mobile Number */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <Phone className="w-5 h-5" />
              </span>
              <Input
                {...register('mobileNumber')}
                id="mobileNumber"
                type="tel"
                label="Mobile Number"
                placeholder="9876543210"
                error={errors.mobileNumber?.message}
                className="pl-12"
              />
            </div>

            {/* Password */}
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
                helperText="Min. 8 characters with 1 uppercase letter and 1 number"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <span className="absolute left-4 top-[44px] text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                className="pl-12"
              />
            </div>

            <Button type="submit" isLoading={isSubmitting} fullWidth className="py-3.5 mt-4">
              Sign Up
            </Button>
          </form>
        </GlassCard>

        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
export default SignUp;
