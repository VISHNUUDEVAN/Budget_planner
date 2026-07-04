import React from 'react';
import { GlassCard } from '../../components/GlassCard';
import {
  ShoppingCart,
  Home as HomeIcon,
  Zap,
  Droplet,
  Flame,
  GraduationCap,
  HeartPulse,
  Plane,
  ShieldAlert,
  PiggyBank,
} from 'lucide-react';

interface FamilyBudgetCategory {
  name: string;
  spent: number;
  budget: number;
  icon: typeof ShoppingCart;
  color: string;
}

const CATEGORIES: FamilyBudgetCategory[] = [
  { name: 'Grocery', spent: 12000, budget: 15000, icon: ShoppingCart, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
  { name: 'Rent', spent: 22000, budget: 22000, icon: HomeIcon, color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-950/20' },
  { name: 'Electricity', spent: 3200, budget: 4000, icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { name: 'Water', spent: 400, budget: 600, icon: Droplet, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { name: 'Gas', spent: 900, budget: 1200, icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
  { name: 'School Fees', spent: 8500, budget: 10000, icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  { name: 'Medical', spent: 2800, budget: 5000, icon: HeartPulse, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
  { name: 'Vacation', spent: 35000, budget: 50000, icon: Plane, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
  { name: 'Emergency', spent: 0, budget: 15000, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
  { name: 'Savings', spent: 15000, budget: 20000, icon: PiggyBank, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
];

export function FamilyDashboard() {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-heading font-extrabold text-slate-800 dark:text-white">
          Family Budget Tracker
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monthly expenditure caps and spent margins for household categories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const ratio = cat.budget > 0 ? cat.spent / cat.budget : 0;
          const percentage = Math.round(ratio * 100);
          const isOver = cat.spent > cat.budget;

          return (
            <GlassCard key={cat.name} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">{cat.name}</h3>
                  <p className="text-xxs text-slate-400">Monthly Caps</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    ₹{cat.spent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400">
                    / ₹{cat.budget.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-danger-500'
                        : ratio >= 0.85
                        ? 'bg-accent-500'
                        : 'bg-secondary-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <span className={`text-[10px] font-bold ${isOver ? 'text-danger-500' : 'text-slate-400'}`}>
                    {percentage}% spent
                  </span>
                  {isOver && (
                    <span className="text-[10px] bg-danger-50 text-danger-600 dark:bg-danger-950/20 dark:text-danger-400 px-1.5 py-0.5 rounded font-bold">
                      Overspent
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
export default FamilyDashboard;
