import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plannerApi } from '../../api/plannerApi';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { VerdictCard } from '../../components/VerdictCard';
import type { EmergencyFundResult } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const fundSchema = z.object({
  requestedAmount: z.coerce.number().min(1, 'Please enter a valid amount'),
});

type FundFormValues = z.infer<typeof fundSchema>;

export function EmergencyFundPlanner() {
  const [result, setResult] = useState<EmergencyFundResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: { requestedAmount: 0 },
  });

  const onSubmit = async (values: FundFormValues) => {
    setIsLoading(true);
    try {
      const response = await plannerApi.checkEmergencyFund(values);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Emergency Fund Checker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verify safety impact margins before withdrawing liquid cash assets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input panel */}
        <GlassCard className="p-6 h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('requestedAmount')}
              id="requestedAmount"
              type="number"
              label="Withdrawal Amount Request (₹)"
              placeholder="e.g. 25000"
              error={errors.requestedAmount?.message}
            />

            <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 mt-2">
              Assess Safety Margin
            </Button>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="p-12 text-center text-slate-400 flex items-center justify-center min-h-[300px]">
                  <span className="text-sm font-semibold">
                    Submit a withdrawal check to view safety analysis.
                  </span>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Green/Red Verdict Card */}
                <VerdictCard
                  type={result.verdict === 'safe' ? 'success' : 'danger'}
                  title={result.verdict === 'safe' ? 'Withdrawal Safe' : 'Withdrawal Not Recommended'}
                  subtitle={
                    result.verdict === 'safe'
                      ? 'This withdrawal preserves your basic cash reserve buffers.'
                      : 'This transaction would critically compromise your emergency buffers.'
                  }
                  reasons={result.reasons}
                />

                {/* Reserves breakdown metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left stats */}
                  <div className="grid grid-cols-1 gap-4">
                    <GlassCard className="p-5 space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Total Liquid Savings</span>
                      <h4 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                        ₹{result.breakdown.totalSavings.toLocaleString('en-IN')}
                      </h4>
                    </GlassCard>

                    <GlassCard className="p-5 space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Safe Withdrawal Limit</span>
                      <h4 className="text-lg font-heading font-extrabold text-secondary-500">
                        ₹{result.breakdown.availableForWithdrawal.toLocaleString('en-IN')}
                      </h4>
                    </GlassCard>
                  </div>

                  {/* Right stats */}
                  <div className="grid grid-cols-1 gap-4">
                    <GlassCard className="p-5 space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Minimum Emergency Buffer (3m)</span>
                      <h4 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                        ₹{result.breakdown.minimumEmergencyFund.toLocaleString('en-IN')}
                      </h4>
                    </GlassCard>

                    <GlassCard className="p-5 space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Loan EMI Protection Buffer (2m)</span>
                      <h4 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                        ₹{result.breakdown.emiBuffer.toLocaleString('en-IN')}
                      </h4>
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default EmergencyFundPlanner;
