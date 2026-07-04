import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

type VerdictType = 'success' | 'danger' | 'warning' | 'info';

interface VerdictCardProps {
  type: VerdictType;
  title: string;
  subtitle?: string;
  score?: number;
  scoreLabel?: string;
  reasons?: string[];
  children?: React.ReactNode;
  className?: string;
}

const config: Record<VerdictType, {
  icon: typeof CheckCircle;
  bg: string;
  border: string;
  iconColor: string;
  titleColor: string;
  scoreColor: string;
}> = {
  success: {
    icon: CheckCircle,
    bg: 'from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    scoreColor: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    icon: XCircle,
    bg: 'from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/20',
    border: 'border-red-200 dark:border-red-700',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800 dark:text-red-300',
    scoreColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/20',
    border: 'border-amber-200 dark:border-amber-700',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800 dark:text-amber-300',
    scoreColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/20',
    border: 'border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-300',
    scoreColor: 'text-blue-600 dark:text-blue-400',
  },
};

export function VerdictCard({ type, title, subtitle, score, scoreLabel, reasons, children, className }: VerdictCardProps) {
  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'bg-gradient-to-br border-2 rounded-2xl p-6',
        cfg.bg, cfg.border, className
      )}
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <Icon className={cn('w-10 h-10 flex-shrink-0', cfg.iconColor)} />
        </motion.div>

        <div className="flex-1">
          <h3 className={cn('text-xl font-bold font-heading', cfg.titleColor)}>{title}</h3>
          {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">{subtitle}</p>}

          {score !== undefined && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className={cn('text-4xl font-black font-heading', cfg.scoreColor)}>{score}</span>
                <span className="text-slate-400 text-lg">/100</span>
              </div>
              {scoreLabel && <p className="text-xs text-slate-500 mt-0.5">{scoreLabel}</p>}

              {/* Score bar */}
              <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', type === 'success' ? 'bg-emerald-500' : type === 'danger' ? 'bg-red-500' : 'bg-amber-500')}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {reasons && reasons.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 space-y-2"
        >
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className={cn('mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2', cfg.iconColor.replace('text-', 'bg-'))} />
              {reason}
            </li>
          ))}
        </motion.ul>
      )}

      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
