import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/profileApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { User, Wallet, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

type ProfileTab = 'personal' | 'financial' | 'settings';

export function Profile() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: profileApi.getProfile,
  });

  const { data: financialProfile, isLoading: isFinancialLoading } = useQuery({
    queryKey: ['financialProfileDetails'],
    queryFn: profileApi.getFinancialDetails,
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      const stored = localStorage.getItem('user');
      if (stored) {
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...data }));
      }
      setSaveSuccess('Personal details updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    },
  });

  const updateFinancialMutation = useMutation({
    mutationFn: profileApi.updateFinancialDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(['financialProfileDetails'], data);
      setSaveSuccess('Financial details updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    },
  });

  // Forms setup
  const personalForm = useForm({
    values: {
      fullName: userProfile?.fullName || '',
      mobileNumber: userProfile?.mobileNumber || '',
      address: userProfile?.address || '',
      city: userProfile?.city || '',
      occupation: userProfile?.occupation || '',
      age: userProfile?.age || 25,
      lifestyleType: userProfile?.lifestyleType || 'working_professional',
    },
  });

  const financialForm = useForm({
    values: {
      monthlyIncome: financialProfile?.monthlyIncome || 0,
      monthlyExpenses: financialProfile?.monthlyExpenses || 0,
      currentSavings: financialProfile?.currentSavings || 0,
      existingLoansEMI: financialProfile?.existingLoansEMI || 0,
      monthlySavingsGoal: financialProfile?.monthlySavingsGoal || 0,
    },
  });

  const onSavePersonal = (values: any) => {
    updateProfileMutation.mutate(values);
  };

  const onSaveFinancial = (values: any) => {
    updateFinancialMutation.mutate(values);
  };

  const lifestyleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'family', label: 'Family' },
    { value: 'working_professional', label: 'Working Professional' },
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'job_seeker', label: 'Job Seeker' },
    { value: 'retired', label: 'Retired' },
  ];

  if (isProfileLoading || isFinancialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64" />
        <Skeleton variant="rect" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, financial profile constants, and application theme configurations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-950/20 border border-secondary-200 dark:border-secondary-800 text-sm font-semibold text-secondary-600 dark:text-secondary-400 animate-slideDown">
          {saveSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs Panel */}
        <GlassCard className="p-4 h-fit space-y-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all',
              activeTab === 'personal'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            )}
          >
            <User className="w-5 h-5" />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all',
              activeTab === 'financial'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            )}
          >
            <Wallet className="w-5 h-5" />
            <span>Financial details</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all',
              activeTab === 'settings'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/10 font-bold text-sm transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </GlassCard>

        {/* Tab content area */}
        <div className="lg:col-span-3">
          {activeTab === 'personal' && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white mb-4">
                Personal details
              </h2>
              <form onSubmit={personalForm.handleSubmit(onSavePersonal)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    {...personalForm.register('fullName', { required: 'Name is required' })}
                    id="fullName"
                    label="Full Name"
                    error={personalForm.formState.errors.fullName?.message}
                  />
                  <Input
                    {...personalForm.register('mobileNumber')}
                    id="mobileNumber"
                    label="Mobile Number"
                  />
                  <Input
                    {...personalForm.register('age', { valueAsNumber: true })}
                    id="age"
                    type="number"
                    label="Age"
                  />
                  <Input
                    {...personalForm.register('occupation')}
                    id="occupation"
                    label="Occupation"
                  />
                  <div className="sm:col-span-2">
                    <Select
                      {...personalForm.register('lifestyleType')}
                      id="lifestyleType"
                      label="Lifestyle Stage Profile"
                      options={lifestyleOptions}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      {...personalForm.register('address')}
                      id="address"
                      label="Street Address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      {...personalForm.register('city')}
                      id="city"
                      label="City / Region"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Button type="submit" isLoading={updateProfileMutation.isPending}>
                    Save Personal Changes
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {activeTab === 'financial' && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white mb-4">
                Financial Details
              </h2>
              <form onSubmit={financialForm.handleSubmit(onSaveFinancial)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    {...financialForm.register('monthlyIncome', { valueAsNumber: true })}
                    id="monthlyIncome"
                    type="number"
                    label="Monthly Income (₹)"
                  />
                  <Input
                    {...financialForm.register('monthlyExpenses', { valueAsNumber: true })}
                    id="monthlyExpenses"
                    type="number"
                    label="Monthly Expenses (₹)"
                  />
                  <Input
                    {...financialForm.register('currentSavings', { valueAsNumber: true })}
                    id="currentSavings"
                    type="number"
                    label="Current Total Savings (₹)"
                  />
                  <Input
                    {...financialForm.register('existingLoansEMI', { valueAsNumber: true })}
                    id="existingLoansEMI"
                    type="number"
                    label="Total Outstanding EMI obligations (₹)"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      {...financialForm.register('monthlySavingsGoal', { valueAsNumber: true })}
                      id="monthlySavingsGoal"
                      type="number"
                      label="Monthly Savings target goal (₹)"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Button type="submit" isLoading={updateFinancialMutation.isPending}>
                    Save Financial Changes
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {activeTab === 'settings' && (
            <GlassCard className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                  Application Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure display options and dashboard metrics styling.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-accent-500" />}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">App Dark Theme</h4>
                    <p className="text-xxs text-slate-400">Reduce glare in dark environments</p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className={cn(
                    'w-12 h-6.5 rounded-full p-1 transition-all duration-300 relative',
                    isDark ? 'bg-primary-600' : 'bg-slate-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-4.5 h-4.5 rounded-full bg-white transition-all duration-300 shadow-md',
                      isDark ? 'translate-x-5.5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
export default Profile;
