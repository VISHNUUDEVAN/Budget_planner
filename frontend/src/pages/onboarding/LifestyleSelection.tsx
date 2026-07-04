import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import { WizardShell } from '../../components/WizardShell';
import { GlassCard } from '../../components/GlassCard';
import { cn } from '../../utils/cn';
import {
  GraduationCap,
  Home,
  Briefcase,
  User,
  Store,
  Terminal,
  Search,
  Coffee,
} from 'lucide-react';

type LifestyleType =
  | 'student'
  | 'family'
  | 'working_professional'
  | 'bachelor'
  | 'business_owner'
  | 'freelancer'
  | 'job_seeker'
  | 'retired';

interface LifestyleOption {
  value: LifestyleType;
  title: string;
  description: string;
  icon: typeof GraduationCap;
  gradient: string;
}

const OPTIONS: LifestyleOption[] = [
  {
    value: 'student',
    title: 'Student',
    description: 'Focusing on education, pocket money, or small stipends.',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    value: 'family',
    title: 'Family',
    description: 'Managing household expenses, school fees, and family goals.',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    value: 'working_professional',
    title: 'Working Professional',
    description: 'Steady salary, career growth, investment, and tax savings.',
    icon: Briefcase,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    value: 'bachelor',
    title: 'Bachelor',
    description: 'Independent living, lifestyle expenses, rent, and fast savings.',
    icon: User,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    value: 'business_owner',
    title: 'Business Owner',
    description: 'Business cash flows, payroll, high risks, and investments.',
    icon: Store,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    value: 'freelancer',
    title: 'Freelancer',
    description: 'Variable monthly incomes, multiple clients, taxes, and liquidity.',
    icon: Terminal,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    value: 'job_seeker',
    title: 'Job Seeker',
    description: 'Conserving funds, emergency reserves, and interview costs.',
    icon: Search,
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    value: 'retired',
    title: 'Retired',
    description: 'Pension or investment yields, medical plans, capital preservation.',
    icon: Coffee,
    gradient: 'from-yellow-500 to-amber-600',
  },
];

export function LifestyleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LifestyleType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const updatedUser = await profileApi.updateProfile({ lifestyleType: selected });

      // Update user in localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
      }

      // Re-trigger layout navigation
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: 'Personal Details', description: 'Introduce yourself to set up your account' },
    { title: 'Financial Profile', description: 'Input your core income and expenses' },
    { title: 'Lifestyle Type', description: 'Select your life stage classification' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300">
      <GlassCard className="max-w-4xl mx-auto p-8">
        <WizardShell
          steps={steps}
          currentStep={2}
          onSubmit={onSubmit}
          isLoading={isLoading}
          isNextDisabled={!selected}
          nextLabel="Complete Onboarding"
          onPrev={() => navigate('/financial-details')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isChosen = selected === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={cn(
                    'relative flex flex-col items-center text-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300',
                    isChosen
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-500/20 translate-y-[-2px]'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  )}
                >
                  {/* Icon Circle */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr shadow-md mb-4', opt.gradient)}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-heading font-bold text-slate-800 dark:text-white mb-2 text-sm">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal flex-1">
                    {opt.description}
                  </p>

                  {/* Radio marker */}
                  <div
                    className={cn(
                      'absolute top-3 right-3 w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                      isChosen ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    )}
                  >
                    {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </WizardShell>
      </GlassCard>
    </div>
  );
}
export default LifestyleSelection;
