import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { FamilyDashboard } from './FamilyDashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
  Wallet2,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export function Home() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 15000, // Refetch every 15s to keep dashboard live
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton variant="rect" count={4} className="h-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-80 md:col-span-2" />
          <Skeleton variant="rect" className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch dashboard data. Please try again.
      </div>
    );
  }

  const { summary, budgetSummary, expenseBreakdown, recentTransactions, upcomingPayments } = data;

  // Calculate Today's Spending
  const todayStr = new Date().toDateString();
  const todaySpending = recentTransactions
    .filter((tx: any) => tx.type === 'expense' && new Date(tx.date).toDateString() === todayStr)
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome header (Left) */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              Lifestyle: {user?.lifestyleType?.replace('_', ' ') || 'Not set'}
            </p>
          </div>

          {/* KPI Cards (3 Cards now: Income, Savings, Loans) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Income Card */}
            <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-secondary-500">
              <div className="space-y-1">
                <span className="text-xxs font-bold text-slate-400 uppercase">Monthly Income</span>
                <h3 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                  ₹{summary.monthlyIncome.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-2.5 bg-secondary-50 dark:bg-secondary-950/20 text-secondary-500 rounded-xl">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </GlassCard>

            {/* Savings Card */}
            <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-primary-500">
              <div className="space-y-1">
                <span className="text-xxs font-bold text-slate-400 uppercase">Total Savings</span>
                <h3 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                  ₹{summary.currentSavings.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-xl">
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </GlassCard>

            {/* Loans Card */}
            <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-accent-500">
              <div className="space-y-1">
                <span className="text-xxs font-bold text-slate-400 uppercase">Outstanding Loans</span>
                <h3 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                  ₹{summary.totalLoanAmount.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-2.5 bg-accent-50 dark:bg-accent-950/20 text-accent-500 rounded-xl">
                <Wallet2 className="w-5 h-5" />
              </div>
            </GlassCard>
          </div>

          {/* Expense Breakdown (Pie chart) */}
          <GlassCard className="p-6">
            <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md mb-4">
              Expense Breakdown
            </h2>
            {expenseBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 text-sm py-12">
                <CircleDollarSign className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
                <span>No expense transactions logged.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {expenseBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {expenseBreakdown.map((item, idx) => (
                    <div key={item.category} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{item.category}</span>
                      </div>
                      <span className="text-slate-800 dark:text-white font-bold ml-4">
                        ₹{item.amount.toLocaleString('en-IN')} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Dynamic Financial Advice Tip of the Day */}
          <GlassCard className="p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-500 rounded-2xl">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
                  Financial Tip of the Day
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                  {summary.healthScore < 50
                    ? 'Your current score suggests high liability or high expenses. Focus on liquidating short-term high interest loans first before considering discretionary spending planner tools.'
                    : 'Your finance levels are robust! Keep saving at this rate and utilize our "Purchase Verdict" module to evaluate high price consumer goods before locking in liquidity.'}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Conditional Family Dashboard Render */}
          {user?.lifestyleType === 'family' && <FamilyDashboard />}
        </div>

        {/* Right Side: Right Side Dashboard Widgets (1 Column) */}
        <div className="space-y-6">
          {/* User profile Welcome & Greeting */}
          <GlassCard className="p-5 flex items-center justify-between bg-gradient-to-r from-primary-600/10 to-secondary-500/10">
            <div>
              <h2 className="text-lg font-heading font-black text-slate-800 dark:text-white">
                Hello, {user?.fullName}!
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Welcome back</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
              {user?.fullName[0].toUpperCase()}
            </div>
          </GlassCard>

          {/* Today's Spending Widget */}
          <GlassCard className="p-5 space-y-2">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Today's Spending</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
                ₹{todaySpending.toLocaleString('en-IN')}
              </h3>
              <span className="text-xxs font-bold text-slate-400">Total logged today</span>
            </div>
          </GlassCard>

          {/* Budget Progress Widget */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Budget Progress</h3>
            <div className="space-y-3">
              {/* Expenses Ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xxs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Expenses Limit Ratio</span>
                  <span className="text-slate-800 dark:text-white">
                    ₹{budgetSummary.expenses.toLocaleString('en-IN')} / ₹{budgetSummary.income.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger-500 rounded-full"
                    style={{ width: `${Math.min(100, (budgetSummary.expenses / budgetSummary.income) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Savings Progress Widget */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Savings Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xxs font-semibold text-slate-600 dark:text-slate-400">
                <span>Monthly target goal</span>
                <span className="text-slate-800 dark:text-white">
                  ₹{budgetSummary.savingsGoal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-500 rounded-full"
                  style={{ width: `${Math.min(100, summary.savingsProgress)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Target: {summary.savingsProgress}% reached</span>
              </div>
            </div>
          </GlassCard>

          {/* Upcoming Bills Widget */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Bills</h3>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {upcomingPayments.length === 0 ? (
                <p className="text-[10px] text-slate-400">No upcoming bills.</p>
              ) : (
                upcomingPayments.slice(0, 3).map((pmt: any) => (
                  <div key={pmt.id} className="flex justify-between items-center text-xs p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{pmt.name}</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹{pmt.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Recent Transactions Widget */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Logs</h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {recentTransactions.length === 0 ? (
                <p className="text-[10px] text-slate-400">No transactions recorded.</p>
              ) : (
                recentTransactions.slice(0, 4).map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center text-xxs p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
                    <div className="truncate max-w-[130px]">
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{tx.category}</p>
                      <p className="text-[8px] text-slate-400">{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={`font-bold ${tx.type === 'income' ? 'text-secondary-500' : 'text-danger-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Quick Summary Widget */}
          <GlassCard className="p-5 space-y-3 bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Quick Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-xxs font-semibold">
              <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Monthly Income</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">₹{budgetSummary.income.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Monthly Expenses</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">₹{budgetSummary.expenses.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Savings Target</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">₹{budgetSummary.savingsGoal.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Monthly EMI</span>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">₹{budgetSummary.emi.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
export default Home;
