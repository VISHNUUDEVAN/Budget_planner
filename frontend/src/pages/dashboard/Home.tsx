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

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
            Hello, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
            Lifestyle profile: {user?.lifestyleType || 'Not set'}
          </p>
        </div>

        {/* Quick actions links */}
        <div className="flex flex-wrap gap-2">
          <Link to="/planner/vacation" className="px-4 py-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-100/50 transition-colors">
            Trip Planner
          </Link>
          <Link to="/planner/purchase" className="px-4 py-2 bg-secondary-50 dark:bg-secondary-950/20 text-secondary-600 dark:text-secondary-400 text-xs font-bold rounded-xl hover:bg-secondary-100/50 transition-colors">
            Purchase Verdict
          </Link>
          <Link to="/planner/emergency-fund" className="px-4 py-2 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 text-xs font-bold rounded-xl hover:bg-accent-100/50 transition-colors">
            Emergency Fund Check
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-secondary-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">Monthly Income</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
              ₹{summary.monthlyIncome.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 bg-secondary-50 dark:bg-secondary-950/20 text-secondary-500 rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Expenses Card */}
        <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-danger-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">Monthly Expenses</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
              ₹{summary.monthlyExpenses.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 bg-danger-50 dark:bg-danger-950/20 text-danger-500 rounded-2xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Savings Card */}
        <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-primary-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">Total Savings</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
              ₹{summary.currentSavings.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-2xl">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Loans Card */}
        <GlassCard className="p-5 flex items-center justify-between border-l-4 border-l-accent-500">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">Outstanding Loans</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
              ₹{summary.totalLoanAmount.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-500 rounded-2xl">
            <Wallet2 className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Circular Gauge */}
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md self-start">
            Financial Health Score
          </h2>
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-slate-100 dark:stroke-slate-800 fill-transparent"
                strokeWidth="12"
              />
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-primary-500 fill-transparent transition-all duration-1000"
                strokeWidth="12"
                strokeDasharray="465"
                strokeDashoffset={465 - (465 * summary.healthScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-heading font-black text-slate-800 dark:text-white">
                {summary.healthScore}
              </span>
              <span className="text-xs font-bold text-primary-500 tracking-wider">
                GRADE {summary.healthGrade}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your score depends on savings ratios, loan exposure, and cash cushions.
          </p>
          <Link to="/health-report" className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold flex items-center gap-1">
            <span>View Full Diagnostic</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </GlassCard>

        {/* Budget summary progress bars */}
        <GlassCard className="p-6 md:col-span-2 space-y-5">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Monthly Budget Summary
          </h2>

          <div className="space-y-4">
            {/* Expenses margin */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Expenses Limit Ratio</span>
                <span className="text-slate-800 dark:text-white">
                  ₹{budgetSummary.expenses.toLocaleString('en-IN')} / ₹{budgetSummary.income.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-danger-500 rounded-full"
                  style={{ width: `${Math.min(100, (budgetSummary.expenses / budgetSummary.income) * 100)}%` }}
                />
              </div>
            </div>

            {/* Savings goals progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Monthly Savings Target Goal</span>
                <span className="text-slate-800 dark:text-white">
                  ₹{budgetSummary.savingsGoal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-500 rounded-full"
                  style={{ width: `${Math.min(100, summary.savingsProgress)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Target: {summary.savingsProgress}% reached</span>
                <span>Surplus Remaining: ₹{budgetSummary.surplus.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total EMI ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Outstanding Debts (EMI Exposure)</span>
                <span className="text-slate-800 dark:text-white">
                  ₹{budgetSummary.emi.toLocaleString('en-IN')} / month
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 rounded-full"
                  style={{ width: `${Math.min(100, (budgetSummary.emi / budgetSummary.income) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Breakdowns & Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Breakdown (Pie chart) */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md mb-2">
            Expense Breakdown
          </h2>
          {expenseBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-8">
              <CircleDollarSign className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
              <span>No expense transactions logged.</span>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
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

              {/* Legends */}
              <div className="grid grid-cols-2 gap-2 text-xxs font-semibold mt-4">
                {expenseBreakdown.map((item, idx) => (
                  <div key={item.category} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{item.category}</span>
                    <span className="text-slate-400 font-bold ml-auto">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        {/* Recent Transactions List */}
        <GlassCard className="p-6 md:col-span-2 space-y-4 max-h-[360px] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
              Recent Transactions
            </h2>
            <span className="text-xxs text-slate-400 uppercase font-bold">Latest 10 logs</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {recentTransactions.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-12">No transactions recorded.</div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-xs font-bold ${tx.type === 'income' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-950/20' : 'bg-danger-50 text-danger-600 dark:bg-danger-950/20'}`}>
                      {tx.category[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{tx.category}</p>
                      <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.type === 'income' ? 'text-secondary-500' : 'text-danger-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    {tx.note && <p className="text-[9px] text-slate-400 italic max-w-[120px] truncate">{tx.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Payments & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Payments */}
        <GlassCard className="p-6 space-y-4 max-h-[300px] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-500" />
            <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
              Upcoming Payments
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {upcomingPayments.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-8">No upcoming payments or EMIs.</div>
            ) : (
              upcomingPayments.map((pmt) => (
                <div key={pmt.id} className="flex justify-between items-center p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{pmt.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Due: {new Date(pmt.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    ₹{pmt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Dynamic Financial Tip */}
        <GlassCard className="p-6 md:col-span-2 flex flex-col justify-between space-y-4">
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

          <div className="p-4 bg-primary-50/50 dark:bg-primary-950/10 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Need cash for an emergency? Assess limits safely:
            </span>
            <Link to="/planner/emergency-fund" className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
              Check Reserve
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Conditional Family Dashboard Render */}
      {user?.lifestyleType === 'family' && <FamilyDashboard />}
    </div>
  );
}
export default Home;
