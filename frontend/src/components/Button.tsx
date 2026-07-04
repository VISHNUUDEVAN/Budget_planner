import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    'flex items-center justify-center font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/10',
    secondary: 'bg-white hover:bg-slate-50 text-primary-600 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-primary-400',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-danger-500/10',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-accent-500/10',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        baseStyle,
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-700/30 dark:border-t-primary-500 rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
