import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import { Input } from '../../components/Input';
import { WizardShell } from '../../components/WizardShell';
import { GlassCard } from '../../components/GlassCard';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is too short'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number'),
  address: z.string().min(5, 'Please enter a complete address'),
  city: z.string().min(2, 'Please enter a valid city name'),
  occupation: z.string().min(2, 'Please enter your occupation'),
  age: z.coerce.number().int().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['onboardingUserProfile'],
    queryFn: profileApi.getProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      mobileNumber: user?.mobileNumber || '',
      address: '',
      city: '',
      occupation: '',
      age: 25,
    },
  });

  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.fullName || '',
        mobileNumber: profileData.mobileNumber || '',
        address: profileData.address || '',
        city: profileData.city || '',
        occupation: profileData.occupation || '',
        age: profileData.age || 25,
      });
    }
  }, [profileData, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const updatedUser = await profileApi.updateProfile(values);
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
      }
      navigate('/financial-details');
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
          currentStep={0}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          nextLabel="Save & Continue"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('fullName')}
              id="fullName"
              label="Full Name"
              error={errors.fullName?.message}
            />
            <Input
              {...register('mobileNumber')}
              id="mobileNumber"
              label="Mobile Number"
              error={errors.mobileNumber?.message}
            />
            <Input
              {...register('age')}
              id="age"
              type="number"
              label="Age"
              error={errors.age?.message}
            />
            <Input
              {...register('occupation')}
              id="occupation"
              label="Occupation"
              error={errors.occupation?.message}
            />
            <div className="sm:col-span-2">
              <Input
                {...register('address')}
                id="address"
                label="Street Address"
                error={errors.address?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                {...register('city')}
                id="city"
                label="City / Region"
                error={errors.city?.message}
              />
            </div>
          </div>
        </WizardShell>
      </GlassCard>
    </div>
  );
}
export default CompleteProfile;
