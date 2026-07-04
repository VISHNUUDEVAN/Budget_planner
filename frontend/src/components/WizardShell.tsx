import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../utils/cn';

interface WizardStep {
  title: string;
  description?: string;
}

interface WizardShellProps {
  steps: WizardStep[];
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  onSubmit?: () => void;
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
};

export function WizardShell({
  steps,
  currentStep,
  children,
  onNext,
  onPrev,
  nextLabel = 'Continue',
  prevLabel = 'Back',
  isNextDisabled = false,
  isLoading = false,
  onSubmit,
}: WizardShellProps) {
  const isLast = currentStep === steps.length - 1;
  const [direction, setDirection] = React.useState(1);
  const [prevStep, setPrevStep] = React.useState(currentStep);

  React.useEffect(() => {
    setDirection(currentStep > prevStep ? 1 : -1);
    setPrevStep(currentStep);
  }, [currentStep]);

  const handleNext = () => {
    setDirection(1);
    if (isLast && onSubmit) {
      onSubmit();
    } else if (onNext) {
      onNext();
    } else if (onSubmit) {
      onSubmit();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    onPrev?.();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: idx <= currentStep ? '#4F46E5' : '#e2e8f0',
                    scale: idx === currentStep ? 1.1 : 1,
                  }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    idx <= currentStep ? 'text-white' : 'text-slate-400'
                  )}
                >
                  {idx < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </motion.div>
                <span className={cn('text-sm font-medium hidden sm:block', idx === currentStep ? 'text-primary-600' : 'text-slate-400')}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1">
                  <motion.div
                    className="h-full bg-primary-500 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: idx < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="h-full bg-slate-200 -mt-0.5" style={{ display: idx < currentStep ? 'none' : 'block' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            initial={false}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Step {currentStep + 1} of {steps.length}</p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {steps[currentStep] && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-white">
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].description && (
                <p className="text-slate-500 mt-1">{steps[currentStep].description}</p>
              )}
            </div>
          )}
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            currentStep === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:text-primary-600 hover:bg-primary-50'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {prevLabel}
        </button>

        <button
          onClick={handleNext}
          disabled={isNextDisabled || isLoading}
          className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isLast ? (onSubmit ? 'Submit' : nextLabel) : nextLabel}
              {!isLast && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
