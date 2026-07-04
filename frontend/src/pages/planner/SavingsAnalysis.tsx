import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { plannerApi } from '../../api/plannerApi';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, Award, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SavingsAnalysis() {
  const [timeframe, setTimeframe] = useState<'12' | '24' | '36'>('12');

  const { data, isLoading, error } = useQuery({
    queryKey: ['savingsAnalysis'],
    queryFn: plannerApi.getSavingsAnalysis,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="rect" count={3} className="h-28" />
        </div>
        <Skeleton variant="rect" className="h-80" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch savings analysis data. Please try again.
      </div>
    );
  }

  const {
    currentSavings,
    monthlySavingsCapacity,
    emergencyFundStatus,
    emergencyFundTarget,
    emergencyFundGap,
    projections,
    investmentSuggestions,
    summary,
  } = data;

  const currentProjectionData =
    timeframe === '12'
      ? projections.months12
      : timeframe === '24'
      ? projections.months24
      : projections.months36;

  const getStatusIcon = () => {
    if (emergencyFundStatus === 'adequate') {
      return <ShieldCheck className="w-8 h-8 text-secondary-500" />;
    }
    return <ShieldAlert className="w-8 h-8 text-accent-500" />;
  };

  const getStatusColor = () => {
    if (emergencyFundStatus === 'adequate') return 'text-secondary-500';
    if (emergencyFundStatus === 'partial') return 'text-accent-500';
    return 'text-danger-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Savings & Investment Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compound projections over time alongside risk-adjusted asset baskets.
        </p>
      </div>

      {/* Summary highlight */}
      <GlassCard className="p-5 flex items-start gap-4 border-l-4 border-l-primary-500 bg-primary-50/20">
        <Award className="w-8 h-8 text-primary-500 flex-shrink-0" />
        <div>
          <h3 className="font-heading font-extrabold text-slate-800 dark:text-white text-sm">
            Analysis Overview
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{summary}</p>
        </div>
      </GlassCard>

      {/* Status metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adequacy check */}
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {getStatusIcon()}
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Reserve Status</span>
            <h4 className={cn('text-sm font-extrabold capitalize mt-0.5', getStatusColor())}>
              {emergencyFundStatus} Reserves
            </h4>
          </div>
        </GlassCard>

        {/* Target reserve */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">6-Month Buffer Target</span>
          <h4 className="text-md font-heading font-extrabold text-slate-800 dark:text-white mt-1">
            ₹{emergencyFundTarget.toLocaleString('en-IN')}
          </h4>
        </GlassCard>

        {/* GAP amount */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Reserve Deficit Gap</span>
          <h4 className="text-md font-heading font-extrabold text-slate-800 dark:text-white mt-1">
            {emergencyFundGap > 0 ? `₹${emergencyFundGap.toLocaleString('en-IN')}` : 'Reserve Completed'}
          </h4>
        </GlassCard>
      </div>

      {/* Projection Line Chart */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
              Compound Growth Projections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assumes systematic SIP at ₹{monthlySavingsCapacity.toLocaleString('en-IN')}/month on 8% conservative return.
            </p>
          </div>

          {/* Timeframe switch tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
            {(['12', '24', '36'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                  timeframe === t
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                )}
              >
                {t} Months
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-72 w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
              />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Suggested asset buckets */}
      <div className="space-y-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Investment suggestion buckets
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recommended financial buckets according to risk profile and liquidity needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investmentSuggestions.map((bucket) => (
            <GlassCard key={bucket.name} className="p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{bucket.name}</h4>
                  <p className="text-xxs text-slate-400 mt-0.5">{bucket.description}</p>
                </div>
                <span className="text-xs bg-secondary-50 text-secondary-600 dark:bg-secondary-950/20 dark:text-secondary-400 px-2.5 py-1 rounded-lg font-black">
                  +{bucket.expectedAnnualReturn}% est
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {bucket.suitableFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850/80 text-xxs font-semibold">
                <span className="text-slate-400">
                  Risk Level:{' '}
                  <span className={cn('capitalize font-bold', bucket.type === 'low_risk' ? 'text-secondary-500' : bucket.type === 'medium_risk' ? 'text-accent-500' : 'text-danger-500')}>
                    {bucket.type.replace('_', ' ')}
                  </span>
                </span>
                <span className="text-slate-400">
                  Min. Deposit: <span className="text-slate-700 dark:text-slate-300 font-bold">₹{bucket.minimumAmount}</span>
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
export default SavingsAnalysis;
