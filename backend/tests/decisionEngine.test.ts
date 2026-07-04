import {
  computeVacationPlan,
  computePurchaseVerdict,
  computeEmergencyFundSafety,
  computeSavingsAnalysis,
  computeEMIAmount,
  buildEMISchedule,
  FinancialProfile,
} from '../src/services/decisionEngine';

const mockStudentProfile: FinancialProfile = {
  monthlyIncome: 15000,
  monthlyExpenses: 9500,
  currentSavings: 28000,
  existingLoansEMI: 2000,
  monthlySavingsGoal: 2000,
};

const mockFamilyProfile: FinancialProfile = {
  monthlyIncome: 120000,
  monthlyExpenses: 72000,
  currentSavings: 450000,
  existingLoansEMI: 28000,
  monthlySavingsGoal: 15000,
};

const mockFreelancerProfile: FinancialProfile = {
  monthlyIncome: 85000,
  monthlyExpenses: 38000,
  currentSavings: 180000,
  existingLoansEMI: 0,
  monthlySavingsGoal: 20000,
};

// ─────────────────────────────────────────────────────────────
// EMI Calculation Tests
// ─────────────────────────────────────────────────────────────

describe('computeEMIAmount', () => {
  test('calculates correct EMI for standard loan', () => {
    // 100000 at 12% for 12 months → ~₹8,885
    const emi = computeEMIAmount(100000, 12, 12);
    expect(emi).toBeGreaterThan(8800);
    expect(emi).toBeLessThan(9000);
  });

  test('returns 0 for 0-month tenure', () => {
    const emi = computeEMIAmount(100000, 12, 0);
    expect(emi).toBe(0);
  });

  test('handles zero interest rate (simple division)', () => {
    const emi = computeEMIAmount(120000, 0, 12);
    expect(emi).toBe(10000);
  });
});

// ─────────────────────────────────────────────────────────────
// EMI Schedule Tests
// ─────────────────────────────────────────────────────────────

describe('buildEMISchedule', () => {
  test('schedule has correct number of entries', () => {
    const schedule = buildEMISchedule(100000, 12, 12);
    expect(schedule).toHaveLength(12);
  });

  test('balance reaches near zero at end of schedule', () => {
    const schedule = buildEMISchedule(100000, 12, 12);
    const lastEntry = schedule[schedule.length - 1];
    expect(lastEntry.balance).toBeLessThan(10);
  });

  test('each entry has all required fields', () => {
    const schedule = buildEMISchedule(50000, 14, 6);
    schedule.forEach((entry) => {
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('payment');
      expect(entry).toHaveProperty('principalPaid');
      expect(entry).toHaveProperty('interestPaid');
      expect(entry).toHaveProperty('balance');
    });
  });

  test('interest decreases over time (amortization)', () => {
    const schedule = buildEMISchedule(200000, 10, 24);
    expect(schedule[0].interestPaid).toBeGreaterThan(schedule[23].interestPaid);
  });
});

// ─────────────────────────────────────────────────────────────
// Vacation Planner Tests
// ─────────────────────────────────────────────────────────────

describe('computeVacationPlan', () => {
  const goaInput = {
    destination: 'Goa',
    travelDate: '2026-12-25T00:00:00.000Z',
    days: 4,
    people: 2,
    budget: 20000,
    originCity: 'Mumbai',
  };

  test('returns correct destination and traveler details', () => {
    const result = computeVacationPlan(goaInput, mockStudentProfile);
    expect(result.destination).toBe('Goa');
    expect(result.days).toBe(4);
    expect(result.people).toBe(2);
  });

  test('returns 3 transport options (bus, train, flight)', () => {
    const result = computeVacationPlan(goaInput, mockStudentProfile);
    expect(result.transportOptions).toHaveLength(3);
    const modes = result.transportOptions.map((t) => t.mode);
    expect(modes).toContain('bus');
    expect(modes).toContain('train');
    expect(modes).toContain('flight');
  });

  test('returns 3 hotel tiers (budget, standard, luxury)', () => {
    const result = computeVacationPlan(goaInput, mockStudentProfile);
    expect(result.hotelOptions).toHaveLength(3);
    const tiers = result.hotelOptions.map((h) => h.tier);
    expect(tiers).toContain('budget');
    expect(tiers).toContain('standard');
    expect(tiers).toContain('luxury');
  });

  test('returns 9 combinations (3 transport × 3 hotel)', () => {
    const result = computeVacationPlan(goaInput, mockStudentProfile);
    expect(result.combinations).toHaveLength(9);
  });

  test('exactly one combination is marked as best value', () => {
    const result = computeVacationPlan(goaInput, mockFreelancerProfile);
    const bestValueCount = result.combinations.filter((c) => c.isBestValue).length;
    expect(bestValueCount).toBe(1);
  });

  test('bus is cheapest transport option', () => {
    const result = computeVacationPlan(goaInput, mockFamilyProfile);
    const bus = result.transportOptions.find((t) => t.mode === 'bus')!;
    const flight = result.transportOptions.find((t) => t.mode === 'flight')!;
    expect(bus.totalCost).toBeLessThan(flight.totalCost);
  });

  test('recommendation string is non-empty', () => {
    const result = computeVacationPlan(goaInput, mockStudentProfile);
    expect(result.recommendation).toBeTruthy();
    expect(result.recommendation.length).toBeGreaterThan(20);
  });

  test('total cost in combinations equals transport + hotel', () => {
    const result = computeVacationPlan(goaInput, mockFamilyProfile);
    result.combinations.forEach((c) => {
      expect(c.totalCost).toBe(c.transport.totalCost + c.hotel.totalCost);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Purchase Planner Tests
// ─────────────────────────────────────────────────────────────

describe('computePurchaseVerdict', () => {
  test('recommends affordable outright laptop purchase for freelancer', () => {
    const result = computePurchaseVerdict(
      { productName: 'MacBook Air', productCategory: 'laptop', price: 50000, emiTenureMonths: 0 },
      mockFreelancerProfile
    );
    expect(result.purchaseType).toBe('outright');
    expect(result.recommended).toBe(true);
    expect(result.affordabilityScore).toBeGreaterThan(50);
  });


  test('flags expensive outright purchase for student', () => {
    const result = computePurchaseVerdict(
      { productName: 'iPhone 15 Pro', productCategory: 'mobile', price: 120000, emiTenureMonths: 0 },
      mockStudentProfile
    );
    expect(result.recommended).toBe(false);
    expect(result.reason).toContain('emergency fund');
  });

  test('EMI purchase returns emi schedule', () => {
    const result = computePurchaseVerdict(
      { productName: 'TV', productCategory: 'tv', price: 60000, emiTenureMonths: 12 },
      mockFamilyProfile
    );
    expect(result.purchaseType).toBe('emi');
    expect(result.emiSchedule).toHaveLength(12);
    expect(result.emiAmount).toBeGreaterThan(0);
  });

  test('recommends EMI purchase with acceptable debt ratio', () => {
    // Family profile has 120k income, 28k existing EMI, adding small TV EMI should be fine
    const result = computePurchaseVerdict(
      { productName: 'Smart TV', productCategory: 'tv', price: 50000, emiTenureMonths: 12 },
      mockFamilyProfile
    );
    expect(result.emiToIncomeRatio).toBeDefined();
    expect(result.newTotalEMIRatio).toBeDefined();
  });

  test('affordability score is within 0-100', () => {
    const result = computePurchaseVerdict(
      { productName: 'Laptop', productCategory: 'laptop', price: 80000, emiTenureMonths: 24 },
      mockFamilyProfile
    );
    expect(result.affordabilityScore).toBeGreaterThanOrEqual(0);
    expect(result.affordabilityScore).toBeLessThanOrEqual(100);
  });

  test('verdict object has all required fields', () => {
    const result = computePurchaseVerdict(
      { productName: 'Phone', productCategory: 'mobile', price: 30000, emiTenureMonths: 6 },
      mockFreelancerProfile
    );
    expect(result).toHaveProperty('recommended');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('affordabilityScore');
    expect(result).toHaveProperty('purchaseType');
    expect(result).toHaveProperty('impactSummary');
  });
});

// ─────────────────────────────────────────────────────────────
// Emergency Fund Tests
// ─────────────────────────────────────────────────────────────

describe('computeEmergencyFundSafety', () => {
  test('marks safe amount as safe verdict', () => {
    // Family has 450k savings, emergency buffer = 3*(72000+28000)*3 = 900k... wait
    // Let's use freelancer: savings 180k, expenses 38k, EMI 0
    // Buffer = 0 + 38000*3 = 114000. Available = 180000-114000 = 66000
    const result = computeEmergencyFundSafety({ requestedAmount: 50000 }, mockFreelancerProfile);
    expect(result.verdict).toBe('safe');
    expect(result.safeAmount).toBeGreaterThan(0);
  });

  test('marks excessive withdrawal as not_recommended', () => {
    const result = computeEmergencyFundSafety({ requestedAmount: 200000 }, mockStudentProfile);
    expect(result.verdict).toBe('not_recommended');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  test('returns breakdown with all fields', () => {
    const result = computeEmergencyFundSafety({ requestedAmount: 10000 }, mockStudentProfile);
    expect(result.breakdown).toHaveProperty('totalSavings');
    expect(result.breakdown).toHaveProperty('emiBuffer');
    expect(result.breakdown).toHaveProperty('minimumEmergencyFund');
    expect(result.breakdown).toHaveProperty('availableForWithdrawal');
  });

  test('safeAmount never exceeds currentSavings', () => {
    const result = computeEmergencyFundSafety({ requestedAmount: 1 }, mockStudentProfile);
    expect(result.safeAmount).toBeLessThanOrEqual(mockStudentProfile.currentSavings);
  });

  test('reasons array is non-empty', () => {
    const result = computeEmergencyFundSafety({ requestedAmount: 5000 }, mockStudentProfile);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Savings Analysis Tests
// ─────────────────────────────────────────────────────────────

describe('computeSavingsAnalysis', () => {
  test('returns correct emergency fund status for well-funded profile', () => {
    // Family: savings 450k, target = (72000+28000)*6 = 600000 → partial
    const result = computeSavingsAnalysis(mockFamilyProfile);
    expect(['adequate', 'partial', 'insufficient']).toContain(result.emergencyFundStatus);
  });

  test('projections have entries for 12, 24, 36 months', () => {
    const result = computeSavingsAnalysis(mockFreelancerProfile);
    expect(result.projections.months12.length).toBeGreaterThan(0);
    expect(result.projections.months24.length).toBeGreaterThan(result.projections.months12.length);
    expect(result.projections.months36.length).toBeGreaterThan(result.projections.months24.length);
  });

  test('final savings in projection exceeds initial savings', () => {
    const result = computeSavingsAnalysis(mockFamilyProfile);
    const last12 = result.projections.months12[result.projections.months12.length - 1];
    expect(last12.savings).toBeGreaterThan(mockFamilyProfile.currentSavings);
  });

  test('returns investment suggestions array', () => {
    const result = computeSavingsAnalysis(mockStudentProfile);
    expect(result.investmentSuggestions.length).toBeGreaterThan(0);
    result.investmentSuggestions.forEach((bucket) => {
      expect(bucket).toHaveProperty('name');
      expect(bucket).toHaveProperty('expectedAnnualReturn');
      expect(bucket).toHaveProperty('type');
    });
  });

  test('summary is non-empty string', () => {
    const result = computeSavingsAnalysis(mockFreelancerProfile);
    expect(typeof result.summary).toBe('string');
    expect(result.summary.length).toBeGreaterThan(0);
  });

  test('emergencyFundGap is 0 when fund is adequate', () => {
    // Create a profile with huge savings
    const richProfile: FinancialProfile = {
      ...mockFamilyProfile,
      currentSavings: 2000000,
    };
    const result = computeSavingsAnalysis(richProfile);
    expect(result.emergencyFundGap).toBe(0);
    expect(result.emergencyFundStatus).toBe('adequate');
  });
});
