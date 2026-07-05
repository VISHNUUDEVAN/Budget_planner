import React from 'react';
import { GlassCard } from './GlassCard';
import { Sparkles } from 'lucide-react';

interface AIRecommendationProps {
  savings: number;
}

export function AIRecommendationWidget({ savings }: AIRecommendationProps) {
  let recommendation = '';
  
  if (savings <= 10000) {
    recommendation = `You currently have ₹${savings.toLocaleString('en-IN')} saved. Focus entirely on building a basic emergency reserve first. Avoid any non-essential purchases or high-risk investments.`;
  } else if (savings <= 50000) {
    const investable = Math.round(savings * 0.4);
    const reserve = savings - investable;
    recommendation = `You currently have ₹${savings.toLocaleString('en-IN')} saved. You can consider investing ₹${investable.toLocaleString('en-IN')} in a Mutual Fund or Fixed Deposit while keeping ₹${reserve.toLocaleString('en-IN')} as a cash emergency reserve.`;
  } else {
    const reserve = 45000;
    const investable = Math.max(10000, savings - reserve);
    const mfAmt = Math.round(investable * 0.6);
    const fdAmt = investable - mfAmt;
    recommendation = `You currently have ₹${savings.toLocaleString('en-IN')} saved. We suggest maintaining ₹${reserve.toLocaleString('en-IN')} as an emergency reserve and investing the surplus ₹${investable.toLocaleString('en-IN')} (e.g., ₹${mfAmt.toLocaleString('en-IN')} in Mutual Funds and ₹${fdAmt.toLocaleString('en-IN')} in Fixed Deposits).`;
  }

  return (
    <GlassCard className="p-5 space-y-3 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-primary-500/20">
      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
        <Sparkles className="w-4 h-4 text-accent-500 animate-pulse" />
        <span className="text-xxs font-bold uppercase tracking-wider">AI Recommendation</span>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
        "{recommendation}"
      </p>
    </GlassCard>
  );
}
