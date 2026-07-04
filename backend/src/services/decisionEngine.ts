/**
 * Decision Engine Service
 *
 * All financial calculation logic lives here as pure, testable functions.
 * No database calls, no HTTP — only math + business rules.
 */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  existingLoansEMI: number;
  monthlySavingsGoal: number;
}

// ─────────────────────────────────────────────────────────────
// VACATION PLANNER
// ─────────────────────────────────────────────────────────────

export interface VacationInput {
  destination: string;
  travelDate: string;
  days: number;
  people: number;
  budget: number;
  originCity?: string;
}

export interface TransportOption {
  mode: 'bus' | 'train' | 'flight';
  costPerPerson: number;
  totalCost: number;
  estimatedHours: number;
  comfortLevel: 'budget' | 'standard' | 'premium';
  isBestValue?: boolean;
}

export interface HotelOption {
  tier: 'budget' | 'standard' | 'luxury';
  costPerNight: number;
  totalCost: number;
  amenities: string[];
}

export interface VacationCostCombination {
  transport: TransportOption;
  hotel: HotelOption;
  totalCost: number;
  costPerPerson: number;
  withinBudget: boolean;
  isBestValue?: boolean;
}

export interface VacationPlanResult {
  destination: string;
  days: number;
  people: number;
  userBudget: number;
  availableBudget: number;
  transportOptions: TransportOption[];
  hotelOptions: HotelOption[];
  combinations: VacationCostCombination[];
  recommendation: string;
  budgetFeasible: boolean;
}

// Realistic per-km rate estimates (INR, one-way per person)
const TRANSPORT_RATES = {
  bus: 0.6,     // ₹0.6 per km
  train: 1.2,   // ₹1.2 per km (sleeper class avg)
  flight: 5.5,  // ₹5.5 per km avg including taxes
};

// Rough distance estimates for popular Indian destinations (km from Mumbai)
const CITY_DISTANCES: Record<string, number> = {
  goa: 600, shimla: 1900, manali: 2000, darjeeling: 2300, jaipur: 1150,
  delhi: 1400, agra: 1200, kerala: 1300, bangalore: 980, hyderabad: 710,
  pune: 160, chennai: 1340, kolkata: 2070, ahmedabad: 530, udaipur: 1000,
  mysore: 1000, ooty: 1100, rishikesh: 1650, varanasi: 1500, amritsar: 1900,
};

function getEstimatedDistance(destination: string): number {
  const key = destination.toLowerCase().replace(/\s+/g, '');
  for (const city of Object.keys(CITY_DISTANCES)) {
    if (key.includes(city)) return CITY_DISTANCES[city];
  }
  return 1000; // default fallback
}

const HOTEL_RATES: Record<string, Record<string, number>> = {
  budget: { default: 800 },
  standard: { default: 2500 },
  luxury: { default: 8000 },
};

export function computeVacationPlan(
  input: VacationInput,
  profile: FinancialProfile
): VacationPlanResult {
  const { destination, days, people, budget } = input;

  // Available budget = income - fixed expenses - committed savings
  const availableBudget =
    profile.monthlyIncome - profile.monthlyExpenses - profile.existingLoansEMI - profile.monthlySavingsGoal;
  const effectiveBudget = budget > 0 ? Math.min(budget, availableBudget * 2) : availableBudget * 2;

  const distanceKm = getEstimatedDistance(destination);

  // Build transport options (round trip × people)
  const transportOptions: TransportOption[] = [
    {
      mode: 'bus',
      costPerPerson: Math.round(TRANSPORT_RATES.bus * distanceKm * 2),
      totalCost: Math.round(TRANSPORT_RATES.bus * distanceKm * 2 * people),
      estimatedHours: Math.round(distanceKm / 50),
      comfortLevel: 'budget',
    },
    {
      mode: 'train',
      costPerPerson: Math.round(TRANSPORT_RATES.train * distanceKm * 2),
      totalCost: Math.round(TRANSPORT_RATES.train * distanceKm * 2 * people),
      estimatedHours: Math.round(distanceKm / 80),
      comfortLevel: 'standard',
    },
    {
      mode: 'flight',
      costPerPerson: Math.round(TRANSPORT_RATES.flight * distanceKm * 2),
      totalCost: Math.round(TRANSPORT_RATES.flight * distanceKm * 2 * people),
      estimatedHours: Math.round(distanceKm / 600) + 2,
      comfortLevel: 'premium',
    },
  ];

  // Hotel options (per night × days)
  const hotelOptions: HotelOption[] = [
    {
      tier: 'budget',
      costPerNight: HOTEL_RATES.budget.default,
      totalCost: HOTEL_RATES.budget.default * days * Math.ceil(people / 2),
      amenities: ['WiFi', 'Basic AC', 'Breakfast optional'],
    },
    {
      tier: 'standard',
      costPerNight: HOTEL_RATES.standard.default,
      totalCost: HOTEL_RATES.standard.default * days * Math.ceil(people / 2),
      amenities: ['WiFi', 'AC', 'Breakfast included', 'Pool'],
    },
    {
      tier: 'luxury',
      costPerNight: HOTEL_RATES.luxury.default,
      totalCost: HOTEL_RATES.luxury.default * days * Math.ceil(people / 2),
      amenities: ['WiFi', 'AC', 'All meals', 'Pool', 'Spa', 'Concierge'],
    },
  ];

  // Build all combinations
  const combinations: VacationCostCombination[] = [];
  for (const t of transportOptions) {
    for (const h of hotelOptions) {
      const totalCost = t.totalCost + h.totalCost;
      combinations.push({
        transport: t,
        hotel: h,
        totalCost,
        costPerPerson: Math.round(totalCost / people),
        withinBudget: totalCost <= effectiveBudget,
        isBestValue: false,
      });
    }
  }

  // Best value = highest comfort within budget, then cheapest overall
  const withinBudget = combinations.filter((c) => c.withinBudget);
  const bestValueCombo =
    withinBudget.length > 0
      ? withinBudget.reduce((best, cur) => (cur.totalCost > best.totalCost ? cur : best))
      : combinations.reduce((best, cur) => (cur.totalCost < best.totalCost ? cur : best));

  bestValueCombo.isBestValue = true;

  // Mark best-value transport option
  const bestTransport = transportOptions.find((t) => t.mode === bestValueCombo.transport.mode);
  if (bestTransport) bestTransport.isBestValue = true;

  const budgetFeasible = withinBudget.length > 0;

  const recommendation = budgetFeasible
    ? `Best value option: ${bestValueCombo.transport.mode} + ${bestValueCombo.hotel.tier} hotel for ₹${bestValueCombo.totalCost.toLocaleString('en-IN')} total (₹${bestValueCombo.costPerPerson.toLocaleString('en-IN')} per person). This fits comfortably within your budget of ₹${effectiveBudget.toLocaleString('en-IN')}.`
    : `Your budget of ₹${effectiveBudget.toLocaleString('en-IN')} may be tight for this trip. The lowest cost option is ₹${combinations[0].totalCost.toLocaleString('en-IN')}. Consider reducing days or travelling off-season.`;

  return {
    destination,
    days,
    people,
    userBudget: budget,
    availableBudget,
    transportOptions,
    hotelOptions,
    combinations,
    recommendation,
    budgetFeasible,
  };
}

// ─────────────────────────────────────────────────────────────
// PURCHASE PLANNER
// ─────────────────────────────────────────────────────────────

export interface PurchaseInput {
  productName: string;
  productCategory: string;
  price: number;
  emiTenureMonths: number; // 0 = outright purchase
}

export interface EMIScheduleEntry {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface PurchaseVerdictResult {
  recommended: boolean;
  reason: string;
  affordabilityScore: number; // 0-100
  purchaseType: 'outright' | 'emi';
  emiAmount: number | null;
  emiToIncomeRatio: number | null;
  newTotalEMIRatio: number | null;
  emiSchedule: EMIScheduleEntry[];
  impactSummary: {
    emergencyFundImpact: string;
    monthlyCashFlowImpact: string;
    payoffPeriod: string;
  };
}

// Interest rate assumptions by category
const CATEGORY_INTEREST_RATES: Record<string, number> = {
  laptop: 14,
  mobile: 16,
  tv: 14,
  appliance: 13,
  vehicle: 10,
  furniture: 15,
  other: 15,
};

export function computeEMIAmount(principal: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths === 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / tenureMonths;
  return Math.round((principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
}

export function buildEMISchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMIScheduleEntry[] {
  const emi = computeEMIAmount(principal, annualRate, tenureMonths);
  const r = annualRate / 100 / 12;
  const schedule: EMIScheduleEntry[] = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = Math.round(balance * r * 100) / 100;
    const principalPaid = Math.round((emi - interestPaid) * 100) / 100;
    balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);
    schedule.push({ month, payment: emi, principalPaid, interestPaid, balance });
  }

  return schedule;
}

export function computePurchaseVerdict(
  input: PurchaseInput,
  profile: FinancialProfile
): PurchaseVerdictResult {
  const { price, emiTenureMonths, productCategory } = input;
  const isEMI = emiTenureMonths > 0;

  const interestRate = CATEGORY_INTEREST_RATES[productCategory] ?? 15;
  const emiAmount = isEMI ? computeEMIAmount(price, interestRate, emiTenureMonths) : 0;
  const emiSchedule = isEMI ? buildEMISchedule(price, interestRate, emiTenureMonths) : [];

  const availableMonthly =
    profile.monthlyIncome - profile.monthlyExpenses - profile.existingLoansEMI - profile.monthlySavingsGoal;

  // For outright purchase: check if savings can cover it while maintaining emergency buffer
  const emergencyBuffer = profile.monthlyExpenses * 3;
  const safeSpendFromSavings = Math.max(0, profile.currentSavings - emergencyBuffer);

  let recommended = false;
  let reason = '';
  let affordabilityScore = 0;

  if (isEMI) {
    const newTotalEMI = profile.existingLoansEMI + emiAmount;
    const newEMIRatio = newTotalEMI / profile.monthlyIncome;
    const emiToIncomeRatio = emiAmount / profile.monthlyIncome;

    // Score based on how much of available monthly cash flow the new EMI consumes
    affordabilityScore = Math.max(0, Math.round(100 - (emiToIncomeRatio / 0.5) * 100));

    if (newEMIRatio <= 0.35 && availableMonthly >= emiAmount * 1.2) {
      recommended = true;
      reason = `The EMI of ₹${emiAmount.toLocaleString('en-IN')}/month keeps your total debt-to-income ratio at ${Math.round(newEMIRatio * 100)}%, within the safe 35% threshold.`;
    } else if (newEMIRatio <= 0.5) {
      recommended = false;
      reason = `The EMI would push your total debt-to-income ratio to ${Math.round(newEMIRatio * 100)}%. This is manageable but leaves little cushion for unexpected expenses.`;
    } else {
      recommended = false;
      reason = `The EMI would push your total debt-to-income ratio to ${Math.round(newEMIRatio * 100)}%, above the 50% danger threshold. This purchase is not recommended at this time.`;
    }

    const newTotalEMIRatio = Math.round(newEMIRatio * 100);

    return {
      recommended,
      reason,
      affordabilityScore,
      purchaseType: 'emi',
      emiAmount,
      emiToIncomeRatio: Math.round(emiToIncomeRatio * 100),
      newTotalEMIRatio,
      emiSchedule,
      impactSummary: {
        emergencyFundImpact: 'No direct impact (EMI-based purchase)',
        monthlyCashFlowImpact: `Monthly cash flow reduces by ₹${emiAmount.toLocaleString('en-IN')}`,
        payoffPeriod: `${emiTenureMonths} months`,
      },
    };
  } else {
    // Outright purchase
    const canAfford = safeSpendFromSavings >= price;
    affordabilityScore = Math.max(0, Math.min(100, Math.round((safeSpendFromSavings / price) * 100)));

    if (canAfford) {
      recommended = true;
      reason = `You can comfortably afford this purchase from savings. After buying, you'll still have ₹${(profile.currentSavings - price).toLocaleString('en-IN')} in savings, maintaining your emergency fund.`;
    } else {
      recommended = false;
      reason = `This purchase would deplete your emergency fund buffer. Safe spending from savings is ₹${safeSpendFromSavings.toLocaleString('en-IN')}. Consider spreading the cost via EMI.`;
    }

    return {
      recommended,
      reason,
      affordabilityScore,
      purchaseType: 'outright',
      emiAmount: null,
      emiToIncomeRatio: null,
      newTotalEMIRatio: null,
      emiSchedule: [],
      impactSummary: {
        emergencyFundImpact: canAfford
          ? `Savings reduce to ₹${(profile.currentSavings - price).toLocaleString('en-IN')}`
          : 'Would breach emergency fund minimum',
        monthlyCashFlowImpact: 'No recurring monthly impact',
        payoffPeriod: 'Immediate (outright purchase)',
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────
// EMERGENCY FUND PLANNER
// ─────────────────────────────────────────────────────────────

export interface EmergencyFundInput {
  requestedAmount: number;
}

export interface EmergencyFundResult {
  requestedAmount: number;
  safeAmount: number;
  currentSavings: number;
  verdict: 'safe' | 'not_recommended';
  reasons: string[];
  breakdown: {
    totalSavings: number;
    emiBuffer: number;
    minimumEmergencyFund: number;
    availableForWithdrawal: number;
  };
}

export function computeEmergencyFundSafety(
  input: EmergencyFundInput,
  profile: FinancialProfile
): EmergencyFundResult {
  const { requestedAmount } = input;
  const { currentSavings, existingLoansEMI, monthlyExpenses } = profile;

  // Buffers to maintain
  const emiBuffer = existingLoansEMI * 2;           // 2 months of EMIs
  const minimumEmergencyFund = monthlyExpenses * 3;  // 3-month emergency fund

  const totalReserved = emiBuffer + minimumEmergencyFund;
  const availableForWithdrawal = Math.max(0, currentSavings - totalReserved);
  const safeAmount = availableForWithdrawal;

  const reasons: string[] = [];
  let verdict: 'safe' | 'not_recommended';

  if (requestedAmount <= availableForWithdrawal) {
    verdict = 'safe';
    reasons.push(`₹${requestedAmount.toLocaleString('en-IN')} is within your safe withdrawal limit of ₹${availableForWithdrawal.toLocaleString('en-IN')}.`);
    if (availableForWithdrawal - requestedAmount < minimumEmergencyFund * 0.5) {
      reasons.push('Note: After this withdrawal, your financial cushion will be significantly reduced. Rebuild savings soon.');
    }
  } else {
    verdict = 'not_recommended';
    if (requestedAmount > currentSavings) {
      reasons.push('Requested amount exceeds your total current savings.');
    }
    if (currentSavings - requestedAmount < minimumEmergencyFund) {
      reasons.push(`Withdrawing ₹${requestedAmount.toLocaleString('en-IN')} would reduce your emergency fund below the 3-month minimum of ₹${minimumEmergencyFund.toLocaleString('en-IN')}.`);
    }
    if (emiBuffer > 0 && currentSavings - requestedAmount < emiBuffer) {
      reasons.push(`You need a 2-month EMI buffer of ₹${emiBuffer.toLocaleString('en-IN')} to cover loan payments during emergencies.`);
    }
    reasons.push(`Safe withdrawal amount: ₹${safeAmount.toLocaleString('en-IN')}.`);
  }

  return {
    requestedAmount,
    safeAmount,
    currentSavings,
    verdict,
    reasons,
    breakdown: {
      totalSavings: currentSavings,
      emiBuffer,
      minimumEmergencyFund,
      availableForWithdrawal,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// SAVINGS ANALYSIS
// ─────────────────────────────────────────────────────────────

export interface GrowthProjection {
  month: number;
  savings: number;
  label: string;
}

export interface InvestmentBucket {
  name: string;
  type: 'low_risk' | 'medium_risk' | 'high_risk';
  expectedAnnualReturn: number;
  description: string;
  suitableFor: string[];
  minimumAmount: number;
}

export interface SavingsAnalysisResult {
  currentSavings: number;
  monthlySavingsCapacity: number;
  emergencyFundStatus: 'adequate' | 'partial' | 'insufficient';
  emergencyFundTarget: number;
  emergencyFundGap: number;
  projections: {
    months12: GrowthProjection[];
    months24: GrowthProjection[];
    months36: GrowthProjection[];
  };
  investmentSuggestions: InvestmentBucket[];
  summary: string;
}

const INVESTMENT_BUCKETS: InvestmentBucket[] = [
  {
    name: 'Liquid Fund',
    type: 'low_risk',
    expectedAnnualReturn: 5.5,
    description: 'Bank FD, Liquid mutual funds — highly accessible, low return',
    suitableFor: ['emergency fund', 'short-term goals'],
    minimumAmount: 500,
  },
  {
    name: 'Fixed Deposit',
    type: 'low_risk',
    expectedAnnualReturn: 7.0,
    description: 'Bank FD/RD — guaranteed returns, lock-in period',
    suitableFor: ['1-3 year goals', 'capital preservation'],
    minimumAmount: 1000,
  },
  {
    name: 'Debt Mutual Fund',
    type: 'medium_risk',
    expectedAnnualReturn: 8.5,
    description: 'Corporate bonds, government securities — moderate, tax-efficient',
    suitableFor: ['3-5 year goals', 'regular income'],
    minimumAmount: 500,
  },
  {
    name: 'Index Fund (Nifty 50)',
    type: 'medium_risk',
    expectedAnnualReturn: 12.0,
    description: 'Nifty/Sensex index funds — diversified equity, low cost',
    suitableFor: ['5+ year goals', 'wealth building'],
    minimumAmount: 500,
  },
  {
    name: 'Large Cap Equity Fund',
    type: 'high_risk',
    expectedAnnualReturn: 14.0,
    description: 'Actively managed large cap funds — higher returns, higher volatility',
    suitableFor: ['7+ year goals', 'aggressive growth'],
    minimumAmount: 1000,
  },
];

function buildProjection(
  initialSavings: number,
  monthlySIP: number,
  annualReturnRate: number,
  totalMonths: number
): GrowthProjection[] {
  const monthlyRate = annualReturnRate / 100 / 12;
  const projections: GrowthProjection[] = [];
  let balance = initialSavings;

  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate) + monthlySIP;
    if (month % 3 === 0 || month === totalMonths) {
      projections.push({
        month,
        savings: Math.round(balance),
        label: month <= 12 ? `Month ${month}` : `Month ${month}`,
      });
    }
  }
  return projections;
}

export function computeSavingsAnalysis(profile: FinancialProfile): SavingsAnalysisResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    existingLoansEMI,
    monthlySavingsGoal,
  } = profile;

  const monthlySavingsCapacity = Math.max(
    0,
    monthlyIncome - monthlyExpenses - existingLoansEMI - monthlySavingsGoal
  );
  const effectiveMonthlySavings = monthlySavingsGoal > 0 ? monthlySavingsGoal : monthlySavingsCapacity;

  const emergencyFundTarget = (monthlyExpenses + existingLoansEMI) * 6;
  const emergencyFundGap = Math.max(0, emergencyFundTarget - currentSavings);
  const emergencyFundStatus: 'adequate' | 'partial' | 'insufficient' =
    currentSavings >= emergencyFundTarget
      ? 'adequate'
      : currentSavings >= emergencyFundTarget * 0.5
      ? 'partial'
      : 'insufficient';

  // Growth projections using a conservative 8% annual return (debt fund benchmark)
  const baseRate = 8.0;

  return {
    currentSavings,
    monthlySavingsCapacity,
    emergencyFundStatus,
    emergencyFundTarget,
    emergencyFundGap,
    projections: {
      months12: buildProjection(currentSavings, effectiveMonthlySavings, baseRate, 12),
      months24: buildProjection(currentSavings, effectiveMonthlySavings, baseRate, 24),
      months36: buildProjection(currentSavings, effectiveMonthlySavings, baseRate, 36),
    },
    investmentSuggestions: INVESTMENT_BUCKETS,
    summary:
      emergencyFundStatus === 'adequate'
        ? `Your emergency fund is healthy. Consider investing ₹${effectiveMonthlySavings.toLocaleString('en-IN')}/month in index funds for long-term wealth building.`
        : `Priority: Build your emergency fund. You need ₹${emergencyFundGap.toLocaleString('en-IN')} more to reach a 6-month safety net. Direct savings to a liquid fund first.`,
  };
}
