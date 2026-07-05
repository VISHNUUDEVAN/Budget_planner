import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { HeartPulse, CheckCircle2, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FinancialScore() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialHealthScoreDetails'],
    queryFn: dashboardApi.getHealthScore,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64 animate-pulse" />
        <Skeleton variant="rect" className="h-90 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch financial score data. Please try again.
      </div>
    );
  }

  const { totalScore, grade, breakdown, recommendations } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Financial Score Diagnostic
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analyze how your saving, expenses, debt ratios, and asset reserves shape your overall creditworthiness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main circular gauge card */}
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="font-heading font-bold text-slate-800 dark:text-white text-sm self-start">Overall Grade</h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-slate-100 dark:stroke-slate-800 fill-transparent"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-primary-500 fill-transparent transition-all duration-1000"
                strokeWidth="12"
                strokeDasharray="502"
                strokeDashoffset={502 - (502 * totalScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-heading font-black text-slate-800 dark:text-white">
                {totalScore}
              </span>
              <span className="text-xs font-bold text-primary-500 tracking-wider">
                GRADE {grade}
              </span>
            </div>
          </div>

          <div className={cn(
            'px-4 py-1.5 rounded-full text-xs font-bold capitalize',
            totalScore >= 80 ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-950/20' :
            totalScore >= 50 ? 'bg-accent-50 text-accent-600 dark:bg-accent-950/20' :
            'bg-danger-50 text-danger-600 dark:bg-danger-950/20'
          )}>
            {totalScore >= 80 ? 'Excellent Standing' : totalScore >= 50 ? 'Fair Standing' : 'Needs Work'}
          </div>
        </GlassCard>

        {/* Breakdown components */}
        <GlassCard className="p-6 md:col-span-2 space-y-5">
          <h2 className="font-heading font-bold text-slate-800 dark:text-white text-sm">Score Contribution Breakdown</h2>
          
          <div className="space-y-4">
            {Object.values(breakdown).map((comp: any) => (
              <div key={comp.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>{comp.label}</span>
                  <span className="text-slate-800 dark:text-white">{comp.value}%</span>
                </div>
                
                <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      comp.score >= 80 ? 'bg-secondary-500' :
                      comp.score >= 50 ? 'bg-accent-500' :
                      'bg-danger-500'
                    )}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Score: {comp.score}/100</span>
                  <span>Weight: {comp.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Warnings & Suggestions list */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="font-heading font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary-500" />
          <span>Diagnostic Insights & Recommendations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec: string, index: number) => {
            const isNegative = rec.toLowerCase().includes('exceed') || rec.toLowerCase().includes('high') || rec.toLowerCase().includes('debt') || rec.toLowerCase().includes('low');
            return (
              <div key={index} className="flex gap-3 p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                {isNegative ? (
                  <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                )}
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{rec}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
export default FinancialScore;
