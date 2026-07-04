import { PrismaClient, LifestyleType, TransactionType, GoalType, GoalStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 3 user personas...');

  // Clear existing seed data
  await prisma.notification.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.financialProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ─────────────────────────────────────────────
  // Persona 1: Maya — Student
  // ─────────────────────────────────────────────
  const maya = await prisma.user.create({
    data: {
      fullName: 'Maya Sharma',
      email: 'maya.sharma@example.com',
      mobileNumber: '9876543210',
      passwordHash,
      address: '12, Rose Garden Apartments',
      city: 'Bangalore',
      occupation: 'Engineering Student',
      age: 22,
      lifestyleType: LifestyleType.student,
    },
  });

  await prisma.financialProfile.create({
    data: {
      userId: maya.id,
      monthlyIncome: 15000,    // Part-time + stipend
      monthlyExpenses: 9500,
      currentSavings: 28000,
      existingLoansEMI: 2000,  // Education loan EMI
      monthlySavingsGoal: 2000,
    },
  });

  await prisma.loan.create({
    data: {
      userId: maya.id,
      loanName: 'Education Loan',
      principal: 300000,
      emiAmount: 2000,
      remainingTenureMonths: 36,
      interestRate: 8.5,
    },
  });

  const mayaTransactions = [
    { category: 'Food', amount: 3200, type: TransactionType.expense, note: 'Mess + canteen' },
    { category: 'Transport', amount: 800, type: TransactionType.expense, note: 'Bus pass' },
    { category: 'Books & Supplies', amount: 1200, type: TransactionType.expense, note: 'Semester books' },
    { category: 'Entertainment', amount: 600, type: TransactionType.expense, note: 'OTT + outings' },
    { category: 'Utilities', amount: 500, type: TransactionType.expense, note: 'Phone bill' },
    { category: 'Rent', amount: 3200, type: TransactionType.expense, note: 'PG rent' },
    { category: 'Stipend', amount: 10000, type: TransactionType.income, note: 'College stipend' },
    { category: 'Freelance', amount: 5000, type: TransactionType.income, note: 'Web design project' },
    { category: 'Food', amount: 2900, type: TransactionType.expense, note: 'Previous month mess' },
    { category: 'Transport', amount: 750, type: TransactionType.expense, note: 'Metro card' },
  ];

  for (const t of mayaTransactions) {
    await prisma.transaction.create({
      data: {
        userId: maya.id,
        category: t.category,
        amount: t.amount,
        type: t.type,
        note: t.note,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.goal.createMany({
    data: [
      {
        userId: maya.id,
        goalType: GoalType.vacation,
        targetAmount: 15000,
        currentAmount: 4000,
        targetDate: new Date('2026-12-25'),
        status: GoalStatus.active,
        description: 'Goa trip with friends',
      },
      {
        userId: maya.id,
        goalType: GoalType.purchase,
        targetAmount: 60000,
        currentAmount: 18000,
        targetDate: new Date('2026-09-01'),
        status: GoalStatus.active,
        description: 'MacBook for college projects',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: maya.id,
        message: 'Your entertainment spending is 15% above your monthly budget.',
        type: NotificationType.warning,
        read: false,
      },
      {
        userId: maya.id,
        message: 'Health score improved to 62 — great savings discipline this month!',
        type: NotificationType.success,
        read: true,
      },
    ],
  });

  // ─────────────────────────────────────────────
  // Persona 2: Raj — Family
  // ─────────────────────────────────────────────
  const raj = await prisma.user.create({
    data: {
      fullName: 'Rajesh Mehta',
      email: 'rajesh.mehta@example.com',
      mobileNumber: '9812345678',
      passwordHash,
      address: '7, Sunflower Colony, Sector 21',
      city: 'Pune',
      occupation: 'Senior Software Engineer',
      age: 38,
      lifestyleType: LifestyleType.family,
    },
  });

  await prisma.financialProfile.create({
    data: {
      userId: raj.id,
      monthlyIncome: 120000,
      monthlyExpenses: 72000,
      currentSavings: 450000,
      existingLoansEMI: 28000,  // Home loan + car loan
      monthlySavingsGoal: 15000,
    },
  });

  await prisma.loan.createMany({
    data: [
      {
        userId: raj.id,
        loanName: 'Home Loan',
        principal: 4500000,
        emiAmount: 22000,
        remainingTenureMonths: 180,
        interestRate: 8.2,
      },
      {
        userId: raj.id,
        loanName: 'Car Loan',
        principal: 600000,
        emiAmount: 6000,
        remainingTenureMonths: 36,
        interestRate: 9.5,
      },
    ],
  });

  const rajTransactions = [
    { category: 'Grocery', amount: 12000, type: TransactionType.expense, note: 'Monthly groceries' },
    { category: 'Rent', amount: 0, type: TransactionType.expense, note: 'Own house (EMI)' },
    { category: 'School Fees', amount: 8500, type: TransactionType.expense, note: 'Kids school quarterly' },
    { category: 'Electricity', amount: 3200, type: TransactionType.expense, note: 'MSEB bill' },
    { category: 'Water', amount: 400, type: TransactionType.expense, note: 'Water bill' },
    { category: 'Gas', amount: 900, type: TransactionType.expense, note: 'PNG + cylinder' },
    { category: 'Medical', amount: 2800, type: TransactionType.expense, note: 'Family health checkup' },
    { category: 'Entertainment', amount: 4500, type: TransactionType.expense, note: 'OTT + family outing' },
    { category: 'Transport', amount: 3500, type: TransactionType.expense, note: 'Fuel + metro' },
    { category: 'Salary', amount: 120000, type: TransactionType.income, note: 'Monthly salary' },
    { category: 'Grocery', amount: 11500, type: TransactionType.expense, note: 'Previous month' },
    { category: 'Vacation', amount: 35000, type: TransactionType.expense, note: 'Shimla trip' },
    { category: 'Insurance', amount: 5200, type: TransactionType.expense, note: 'Life + health premium' },
  ];

  for (const t of rajTransactions) {
    await prisma.transaction.create({
      data: {
        userId: raj.id,
        category: t.category,
        amount: t.amount,
        type: t.type,
        note: t.note,
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.goal.createMany({
    data: [
      {
        userId: raj.id,
        goalType: GoalType.emergency,
        targetAmount: 360000,
        currentAmount: 450000,
        status: GoalStatus.completed,
        description: '3-month emergency fund',
      },
      {
        userId: raj.id,
        goalType: GoalType.vacation,
        targetAmount: 80000,
        currentAmount: 25000,
        targetDate: new Date('2026-12-20'),
        status: GoalStatus.active,
        description: 'Europe family vacation',
      },
      {
        userId: raj.id,
        goalType: GoalType.purchase,
        targetAmount: 150000,
        currentAmount: 60000,
        targetDate: new Date('2027-01-01'),
        status: GoalStatus.active,
        description: 'New refrigerator + washing machine',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: raj.id,
        message: 'Emergency fund goal completed! You\'ve reached ₹3,60,000. Well done!',
        type: NotificationType.success,
        read: false,
      },
      {
        userId: raj.id,
        message: 'Vacation spending this month exceeded your planned budget by ₹8,000.',
        type: NotificationType.warning,
        read: false,
      },
      {
        userId: raj.id,
        message: 'Financial Health Score: 74/100 — Loan-to-income ratio is within safe limits.',
        type: NotificationType.info,
        read: true,
      },
    ],
  });

  // ─────────────────────────────────────────────
  // Persona 3: Priya — Freelancer
  // ─────────────────────────────────────────────
  const priya = await prisma.user.create({
    data: {
      fullName: 'Priya Nair',
      email: 'priya.nair@example.com',
      mobileNumber: '9745632108',
      passwordHash,
      address: '45, Green Park Lane',
      city: 'Mumbai',
      occupation: 'UX Designer & Consultant',
      age: 31,
      lifestyleType: LifestyleType.freelancer,
    },
  });

  await prisma.financialProfile.create({
    data: {
      userId: priya.id,
      monthlyIncome: 85000,    // Variable — 3-month avg
      monthlyExpenses: 38000,
      currentSavings: 180000,
      existingLoansEMI: 0,
      monthlySavingsGoal: 20000,
    },
  });

  const priyaTransactions = [
    { category: 'Rent', amount: 18000, type: TransactionType.expense, note: 'Mumbai apartment' },
    { category: 'Food', amount: 7500, type: TransactionType.expense, note: 'Dining + groceries' },
    { category: 'Software & Tools', amount: 3200, type: TransactionType.expense, note: 'Figma, Adobe, hosting' },
    { category: 'Transport', amount: 2800, type: TransactionType.expense, note: 'Uber + local' },
    { category: 'Entertainment', amount: 2500, type: TransactionType.expense, note: 'Movies + events' },
    { category: 'Health & Fitness', amount: 2000, type: TransactionType.expense, note: 'Gym membership' },
    { category: 'Freelance Income', amount: 95000, type: TransactionType.income, note: 'E-commerce client project' },
    { category: 'Freelance Income', amount: 40000, type: TransactionType.income, note: 'Mobile app UI project' },
    { category: 'Professional Development', amount: 4000, type: TransactionType.expense, note: 'Online course' },
    { category: 'Tax Provision', amount: 12000, type: TransactionType.expense, note: 'Set aside for advance tax' },
    { category: 'Freelance Income', amount: 30000, type: TransactionType.income, note: 'Branding project' },
    { category: 'Rent', amount: 18000, type: TransactionType.expense, note: 'Previous month rent' },
  ];

  for (const t of priyaTransactions) {
    await prisma.transaction.create({
      data: {
        userId: priya.id,
        category: t.category,
        amount: t.amount,
        type: t.type,
        note: t.note,
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.goal.createMany({
    data: [
      {
        userId: priya.id,
        goalType: GoalType.emergency,
        targetAmount: 255000,
        currentAmount: 180000,
        status: GoalStatus.active,
        description: '3-month emergency fund (3x expenses)',
      },
      {
        userId: priya.id,
        goalType: GoalType.purchase,
        targetAmount: 250000,
        currentAmount: 80000,
        targetDate: new Date('2026-10-01'),
        status: GoalStatus.active,
        description: 'MacBook Pro M3 + Studio Display',
      },
      {
        userId: priya.id,
        goalType: GoalType.vacation,
        targetAmount: 120000,
        currentAmount: 45000,
        targetDate: new Date('2026-12-01'),
        status: GoalStatus.active,
        description: 'Bali solo trip',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: priya.id,
        message: 'Income this month is 30% higher than your 3-month average. Consider topping up your emergency fund.',
        type: NotificationType.info,
        read: false,
      },
      {
        userId: priya.id,
        message: 'Purchase plan for MacBook Pro: Recommended. Your affordability score is 82/100.',
        type: NotificationType.success,
        read: false,
      },
      {
        userId: priya.id,
        message: 'Health Score: 79/100 — Excellent savings ratio. Reduce entertainment spending to push past 80.',
        type: NotificationType.info,
        read: true,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log(`   Maya (student):     ${maya.email}`);
  console.log(`   Raj (family):       ${raj.email}`);
  console.log(`   Priya (freelancer): ${priya.email}`);
  console.log('   Password for all:   Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
