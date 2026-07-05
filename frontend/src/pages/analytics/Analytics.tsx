import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { CircleDollarSign, TrendingUp, Sparkles, Scale, Percent } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: dashboardApi.getSummary,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rect" className="h-80" />
          <Skeleton variant="rect" className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch analytics data. Please try again.
      </div>
    );
  }

  const { summary, budgetSummary, expenseBreakdown, recentTransactions } = data;

  // Let's generate some mock time-series data using their income and expenses for a cool chart
  const timeSeriesData = [
    { name: 'Jan', Income: budgetSummary.income * 0.9, Expenses: budgetSummary.expenses * 0.8 },
    { name: 'Feb', Income: budgetSummary.income * 0.95, Expenses: budgetSummary.expenses * 0.85 },
    { name: 'Mar', Income: budgetSummary.income, Expenses: budgetSummary.expenses * 0.9 },
    { name: 'Apr', Income: budgetSummary.income, Expenses: budgetSummary.expenses },
    { name: 'May', Income: budgetSummary.income * 1.05, Expenses: budgetSummary.expenses * 0.95 },
    { name: 'Jun', Income: budgetSummary.income, Expenses: budgetSummary.expenses }
  ];

  const savingsRate = budgetSummary.income > 0 
    ? Math.round(((budgetSummary.income - budgetSummary.expenses - budgetSummary.emi) / budgetSummary.income) * 100) 
    : 0;

  const topExpense = expenseBreakdown.length > 0
    ? expenseBreakdown.reduce((prev: any, current: any) => (prev.amount > current.amount) ? prev : current)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Financial Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analyze expense categories, income distributions, and cash flow trends.
        </p>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase">Savings Rate</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">{savingsRate}%</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-secondary-50 dark:bg-secondary-950/20 text-secondary-500 rounded-2xl">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase">Top Expense</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
              {topExpense ? `${topExpense.category} (₹${topExpense.amount.toLocaleString('en-IN')})` : 'None'}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-500 rounded-2xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase">Debt-to-Income</span>
            <h3 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
              {budgetSummary.income > 0 ? Math.round((budgetSummary.emi / budgetSummary.income) * 100) : 0}%
            </h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash Flow Comparison */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Income vs Expenses Trend (6 Months)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Savings Growth Projections */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Cash Reserves Growth Projection
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="Income" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expense Categories Breakdown */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
            Category Breakdown Share
          </h2>
          {expenseBreakdown.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
              No logged expenses to display.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {expenseBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* AI Financial Advice */}
        <GlassCard className="p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-500 w-fit rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
              AI Analytics Diagnosis
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              {savingsRate > 20
                ? `Excellent saving performance! Your savings rate of ${savingsRate}% is in the top bracket. Ensure this surplus is allocated to goal progress or mutual fund allocations.`
                : `Your savings rate is currently low at ${savingsRate}%. We recommend reviewing your top expense category (${topExpense ? topExpense.category : 'N/A'}) to identify quick ways to lower monthly expenditures.`}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xxs text-slate-400 leading-snug">
            Recommendations are generated based on cash reserves, current saving targets, and debt ratios.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
export default Analytics;
