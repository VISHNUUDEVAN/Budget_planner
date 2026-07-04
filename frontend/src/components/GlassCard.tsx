import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, gradient = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, shadow: '0 12px 40px rgba(79, 70, 229, 0.2)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'glass-card',
        gradient && 'bg-gradient-to-br from-white/90 via-white/70 to-primary-50/50',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
