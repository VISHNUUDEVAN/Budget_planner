import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileApi } from '../../api/profileApi';
import { Input } from '../../components/Input';
import { WizardShell } from '../../components/WizardShell';
import { GlassCard } from '../../components/GlassCard';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const financialSchema = z.object({
  monthlyIncome: z.coerce.number().min(0, 'Income must be non-negative'),
  monthlyExpenses: z.coerce.number().min(0, 'Expenses must be non-negative'),
  currentSavings: z.coerce.number().min(0, 'Savings must be non-negative'),
  existingLoansEMI: z.coerce.number().min(0, 'EMI must be non-negative'),
  monthlySavingsGoal: z.coerce.number().min(0, 'Goal must be non-negative'),
});

type FinancialFormValues = z.infer<typeof financialSchema>;

export function FinancialDetails() {
  const navigate = useNavigate();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['onboardingFinancialDetails'],
    queryFn: profileApi.getFinancialDetails,
    retry: false, // Don't block onboarding if it hasn't been created yet
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinancialFormValues>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      currentSavings: 0,
      existingLoansEMI: 0,
      monthlySavingsGoal: 0,
    },
  });

  useEffect(() => {
    if (financialData) {
      reset({
        monthlyIncome: financialData.monthlyIncome || 0,
        monthlyExpenses: financialData.monthlyExpenses || 0,
        currentSavings: financialData.currentSavings || 0,
        existingLoansEMI: financialData.existingLoansEMI || 0,
        monthlySavingsGoal: financialData.monthlySavingsGoal || 0,
      });
    }
  }, [financialData, reset]);

  const onSubmit = async (values: FinancialFormValues) => {
    try {
      await profileApi.updateFinancialDetails(values);
      navigate('/lifestyle-selection');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { title: 'Personal Details', description: 'Introduce yourself to set up your account' },
    { title: 'Financial Profile', description: 'Input your core income and expenses' },
    { title: 'Lifestyle Type', description: 'Select your life stage classification' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300">
      <GlassCard className="max-w-2xl mx-auto p-8">
        <WizardShell
          steps={steps}
          currentStep={1}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          nextLabel="Save & Continue"
          onPrev={() => navigate('/complete-profile')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...register('monthlyIncome')}
                id="monthlyIncome"
                type="number"
                label="Monthly Income (₹)"
                placeholder="e.g. 50000"
                error={errors.monthlyIncome?.message}
              />
              <Input
                {...register('monthlyExpenses')}
                id="monthlyExpenses"
                type="number"
                label="Monthly Expenses (₹)"
                placeholder="e.g. 20000"
                error={errors.monthlyExpenses?.message}
              />
              <Input
                {...register('currentSavings')}
                id="currentSavings"
                type="number"
                label="Current Total Savings (₹)"
                placeholder="e.g. 100000"
                error={errors.currentSavings?.message}
              />
              <Input
                {...register('existingLoansEMI')}
                id="existingLoansEMI"
                type="number"
                label="Total Monthly EMIs (₹)"
                placeholder="e.g. 5000"
                error={errors.existingLoansEMI?.message}
              />
              <div className="sm:col-span-2">
                <Input
                  {...register('monthlySavingsGoal')}
                  id="monthlySavingsGoal"
                  type="number"
                  label="Target Monthly Savings Goal (₹)"
                  placeholder="e.g. 10000"
                  error={errors.monthlySavingsGoal?.message}
                />
              </div>
            </div>
          </div>
        </WizardShell>
      </GlassCard>
    </div>
  );
}
export default FinancialDetails;
