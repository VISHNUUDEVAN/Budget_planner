import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plannerApi } from '../../api/plannerApi';
import { Input } from '../../components/Input';
import { WizardShell } from '../../components/WizardShell';
import { GlassCard } from '../../components/GlassCard';
import { VerdictCard } from '../../components/VerdictCard';
import type { VacationPlanResult } from '../../types';
import { Plane, Train, Bus, ShieldAlert, BadgeInfo } from 'lucide-react';

const vacationSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  travelDate: z.string().min(1, 'Travel date is required'),
  days: z.coerce.number().int().min(1, 'Must be at least 1 day'),
  people: z.coerce.number().int().min(1, 'Must be at least 1 person'),
  budget: z.coerce.number().min(0, 'Budget must be non-negative'),
});

type VacationFormValues = z.infer<typeof vacationSchema>;

export function VacationPlanner() {
  const [result, setResult] = useState<VacationPlanResult | null>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VacationFormValues>({
    resolver: zodResolver(vacationSchema),
    defaultValues: { destination: '', travelDate: '', days: 3, people: 1, budget: 10000 },
  });

  const onSubmit = async (values: VacationFormValues) => {
    setIsLoading(true);
    try {
      // API expects date as ISO 8601 string
      const payload = {
        ...values,
        travelDate: new Date(values.travelDate).toISOString(),
      };
      const response = await plannerApi.planVacation(payload);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: 'Destination', description: 'Where do you plan to travel?' },
    { title: 'Travel Date', description: 'Select your scheduled departure date' },
    { title: 'Duration', description: 'How many days will you stay?' },
    { title: 'Travelers', description: 'How many people are going?' },
    { title: 'Budget slider', description: 'Enter your maximum planned travel budget limit (₹)' },
  ];

  const travelDateVal = watch('travelDate');
  const destinationVal = watch('destination');
  const daysVal = watch('days');
  const peopleVal = watch('people');
  const budgetVal = watch('budget');

  // Define steps validation guards
  const isStepDisabled = () => {
    if (step === 0 && (!destinationVal || destinationVal.trim().length < 2)) return true;
    if (step === 1 && !travelDateVal) return true;
    if (step === 2 && (!daysVal || daysVal < 1)) return true;
    if (step === 3 && (!peopleVal || peopleVal < 1)) return true;
    if (step === 4 && budgetVal === undefined) return true;
    return false;
  };

  const getTransportIcon = (mode: string) => {
    if (mode === 'flight') return <Plane className="w-5 h-5 text-primary-500" />;
    if (mode === 'train') return <Train className="w-5 h-5 text-secondary-500" />;
    return <Bus className="w-5 h-5 text-accent-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Vacation Budget Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Estimate travel transport and lodging caps aligned against savings limits.
        </p>
      </div>

      {!result ? (
        <GlassCard className="max-w-2xl mx-auto p-8">
          <WizardShell
            steps={steps}
            currentStep={step}
            onNext={() => setStep((s) => s + 1)}
            onPrev={() => setStep((s) => s - 1)}
            onSubmit={handleSubmit(onSubmit)}
            isNextDisabled={isStepDisabled()}
            isLoading={isLoading}
          >
            {step === 0 && (
              <Input
                {...register('destination')}
                id="destination"
                label="Destination City"
                placeholder="e.g. Goa, Shimla, Manali"
                error={errors.destination?.message}
                autoFocus
              />
            )}

            {step === 1 && (
              <Input
                {...register('travelDate')}
                id="travelDate"
                type="date"
                label="Date of Departure"
                error={errors.travelDate?.message}
              />
            )}

            {step === 2 && (
              <Input
                {...register('days')}
                id="days"
                type="number"
                label="Number of Days"
                placeholder="e.g. 5"
                error={errors.days?.message}
              />
            )}

            {step === 3 && (
              <Input
                {...register('people')}
                id="people"
                type="number"
                label="Total Travelers"
                placeholder="e.g. 2"
                error={errors.people?.message}
              />
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-sm text-slate-600 dark:text-slate-400">
                  <span>Planned Budget</span>
                  <span className="text-primary-600">₹{Number(budgetVal || 0).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  {...register('budget')}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>₹1,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>
            )}
          </WizardShell>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {/* Final highlighted recommendation */}
          <VerdictCard
            type={result.budgetFeasible ? 'success' : 'danger'}
            title={result.budgetFeasible ? 'Plan Feasible' : 'Budget Exceeded'}
            subtitle={`Destination: ${result.destination} • Days: ${result.days} • People: ${result.people}`}
            reasons={[
              result.recommendation,
              `Available surplus budget: ₹${result.availableBudget.toLocaleString('en-IN')}`,
              `User set budget limit: ₹${result.userBudget.toLocaleString('en-IN')}`,
            ]}
          />

          {/* Transport comparison cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
              Estimated Transport Alternatives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.transportOptions.map((opt) => (
                <GlassCard
                  key={opt.mode}
                  className={`p-5 flex flex-col justify-between space-y-4 relative ${
                    opt.isBestValue ? 'border-2 border-secondary-500' : ''
                  }`}
                >
                  {opt.isBestValue && (
                    <span className="absolute -top-3 right-4 bg-secondary-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                      Best Value
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Mode</span>
                      <h3 className="font-heading font-bold text-slate-800 dark:text-white capitalize flex items-center gap-1.5">
                        {getTransportIcon(opt.mode)}
                        <span>{opt.mode}</span>
                      </h3>
                    </div>
                    <span className="text-xs font-black text-primary-500">
                      ₹{opt.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xxs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div>
                      <p className="text-[10px] text-slate-400">Per Person</p>
                      <p className="text-slate-800 dark:text-white font-bold">₹{opt.costPerPerson.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Duration</p>
                      <p className="text-slate-800 dark:text-white font-bold">{opt.estimatedHours} hrs</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Hotel Tiers */}
          <div className="space-y-3">
            <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
              Estimated Lodging Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.hotelOptions.map((opt) => (
                <GlassCard key={opt.tier} className="p-5 flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Tier</span>
                      <h3 className="font-heading font-bold text-slate-800 dark:text-white capitalize">
                        {opt.tier} Hotel
                      </h3>
                    </div>
                    <span className="text-xs font-black text-primary-500">
                      ₹{opt.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amenities Included</p>
                    <ul className="text-xxs font-semibold text-slate-500 dark:text-slate-400 space-y-1">
                      {opt.amenities.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary-500 rounded-full" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[9px] text-slate-400 italic">
                    Rate: ₹{opt.costPerNight.toLocaleString('en-IN')} / night (estimated rooms: {Math.ceil(result.people / 2)})
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setResult(null);
                setStep(0);
              }}
              className="btn-secondary"
            >
              Configure New Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default VacationPlanner;
