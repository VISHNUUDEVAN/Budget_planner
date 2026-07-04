import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { ShieldCheck, Target, Wallet2, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HealthReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialHealthScore'],
    queryFn: dashboardApi.getHealthScore,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-64" />
          <Skeleton variant="rect" count={2} className="h-44 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch health score data. Please try again.
      </div>
    );
  }

  const { totalScore, grade, breakdown, recommendations } = data;

  const getScoreColor = () => {
    if (totalScore >= 80) return 'text-secondary-500';
    if (totalScore >= 50) return 'text-accent-500';
    return 'text-danger-500';
  };

  const getScoreBg = () => {
    if (totalScore >= 80) return 'bg-secondary-50 dark:bg-secondary-950/20';
    if (totalScore >= 50) return 'bg-accent-50 dark:bg-accent-950/20';
    return 'bg-danger-50 dark:bg-danger-950/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Financial Health Report
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Comprehensive review of savings, outstanding liability limits, and cash flow adequacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score gauge Card */}
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md self-start">
            Diagnostic Grade
          </h2>

          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="82"
                className="stroke-slate-100 dark:stroke-slate-800 fill-transparent"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="82"
                className={cn('stroke-primary-500 fill-transparent transition-all duration-1000')}
                strokeWidth="12"
                strokeDasharray="515"
                strokeDashoffset={515 - (515 * totalScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-heading font-black text-slate-800 dark:text-white">
                {totalScore}
              </span>
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                GRADE {grade}
              </span>
            </div>
          </div>

          <div className={cn('px-4 py-1.5 rounded-full text-xs font-bold capitalize', getScoreBg(), getScoreColor())}>
            {totalScore >= 80 ? 'Excellent Standing' : totalScore >= 50 ? 'Manageable Standing' : 'Critical Standing'}
          </div>
        </GlassCard>

        {/* Breakdown bars */}
        <GlassCard className="p-6 md:col-span-2 space-y-5">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Component Analysis
          </h2>

          <div className="space-y-4">
            {Object.values(breakdown).map((component) => (
              <div key={component.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{component.label}</span>
                  <span className="text-slate-800 dark:text-white">
                    {component.label.includes('Adequacy')
                      ? `${component.value} Months Expenses`
                      : `${component.value}%`}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      component.score >= 80
                        ? 'bg-secondary-500'
                        : component.score >= 50
                        ? 'bg-accent-500'
                        : 'bg-danger-500'
                    )}
                    style={{ width: `${component.score}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Weighted score contribution: {component.score}/100</span>
                  <span>Weight: {component.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recommendations List */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-500" />
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Actionable Advice & Recommendations
          </h2>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-3 p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/20">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
export default HealthReport;
