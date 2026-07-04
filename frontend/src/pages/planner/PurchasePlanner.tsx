import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plannerApi } from '../../api/plannerApi';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { VerdictCard } from '../../components/VerdictCard';
import type { PurchaseVerdictResult } from '../../types';

const purchaseSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productCategory: z.enum(['laptop', 'mobile', 'tv', 'appliance', 'vehicle', 'furniture', 'other']),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  emiTenureMonths: z.coerce.number().int().min(0).max(84),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function PurchasePlanner() {
  const [result, setResult] = useState<PurchaseVerdictResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { productName: '', productCategory: 'laptop', price: 1000, emiTenureMonths: 0 },
  });

  const categoryOptions = [
    { value: 'laptop', label: 'Laptop / Computer' },
    { value: 'mobile', label: 'Smartphones & Tablets' },
    { value: 'tv', label: 'Smart TV & Soundbars' },
    { value: 'appliance', label: 'Home Appliances' },
    { value: 'vehicle', label: 'Automotive / Vehicle' },
    { value: 'furniture', label: 'Furniture / Decor' },
    { value: 'other', label: 'Other Items' },
  ];

  const tenureVal = watch('emiTenureMonths');
  const priceVal = watch('price');

  const onSubmit = async (values: PurchaseFormValues) => {
    setIsLoading(true);
    try {
      const response = await plannerApi.planPurchase(values);
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
          Smart Purchase Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analyze EMI-to-income limits and cash-flow impacts prior to buying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <GlassCard className="p-6 h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('productName')}
              id="productName"
              label="Product Name"
              placeholder="e.g. iPhone 15 Pro, Sofa set"
              error={errors.productName?.message}
            />

            <Select
              {...register('productCategory')}
              id="productCategory"
              label="Category"
              options={categoryOptions}
              error={errors.productCategory?.message}
            />

            <Input
              {...register('price')}
              id="price"
              type="number"
              label="Purchase Price (₹)"
              error={errors.price?.message}
            />

            {/* Tenure slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-xs text-slate-700 dark:text-slate-300">
                <span>EMI Tenure Options</span>
                <span className="text-primary-600 font-bold">
                  {tenureVal === 0 ? 'Outright Purchase (No EMI)' : `${tenureVal} Months`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="36"
                step="3"
                {...register('emiTenureMonths')}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xxs text-slate-400">
                <span>0 (Cash)</span>
                <span>12m</span>
                <span>24m</span>
                <span>36m</span>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 mt-2">
              Verify Affordability
            </Button>
          </form>
        </GlassCard>

        {/* Verdict and breakdown Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <GlassCard className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="text-sm font-semibold">Enter your purchase details to verify safety scores.</span>
            </GlassCard>
          ) : (
            <>
              {/* Verdict Card */}
              <VerdictCard
                type={result.recommended ? 'success' : 'danger'}
                title={result.recommended ? 'Purchase Recommended' : 'Not Recommended'}
                subtitle={result.reason}
                score={result.affordabilityScore}
                scoreLabel="Purchase Affordability Score"
              />

              {/* Impact Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-4 space-y-1">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Cushion Impact</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {result.impactSummary.emergencyFundImpact}
                  </p>
                </GlassCard>
                <GlassCard className="p-4 space-y-1">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Cash Flow Impact</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {result.impactSummary.monthlyCashFlowImpact}
                  </p>
                </GlassCard>
                <GlassCard className="p-4 space-y-1">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Payoff Tenure</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {result.impactSummary.payoffPeriod}
                  </p>
                </GlassCard>
              </div>

              {/* EMI Schedule if applicable */}
              {result.purchaseType === 'emi' && result.emiSchedule.length > 0 && (
                <GlassCard className="p-6 space-y-4 max-h-[300px] flex flex-col overflow-hidden">
                  <h3 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">
                    Amortization Schedule (EMI breakdown)
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
                    <div className="grid grid-cols-5 font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span>Month</span>
                      <span>Payment</span>
                      <span>Principal</span>
                      <span>Interest</span>
                      <span className="text-right">Balance</span>
                    </div>
                    {result.emiSchedule.map((entry) => (
                      <div key={entry.month} className="grid grid-cols-5 py-2 border-b border-slate-100/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300">
                        <span>Month {entry.month}</span>
                        <span>₹{entry.payment.toLocaleString('en-IN')}</span>
                        <span>₹{entry.principalPaid.toLocaleString('en-IN')}</span>
                        <span>₹{entry.interestPaid.toLocaleString('en-IN')}</span>
                        <span className="text-right font-semibold">₹{entry.balance.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default PurchasePlanner;
