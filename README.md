http://localhost:5173/dashboard
# Smart Finance 🚀
### Modern Personal Expense Tracker & Lifestyle Decision Planner

Smart Finance is a premium, glassmorphic web application built with **React** and **Express** designed to help users track cash flows, organize budgets based on their lifestyle profiles, evaluate purchase options, and receive real-time financial health diagnostic ratings.

---

## 🌟 Key Features

1. **Lifestyle Onboarding AI Chatbot**
   - Automatically guides new users through a tailored budget collection checklist based on their persona (e.g., *Student, Family, Working Professional, Freelancer*).
   - Allows users to list, add, and delete expense items interactively through natural language.

2. **Refined Dashboard & Right Sidebar**
   - Clean, three-card KPI header: **Monthly Income**, **Total Savings**, and **Outstanding Loans** (Monthly Expense card removed for design decluttering).
   - Right-side visual widgets: **Today's Spending**, **Budget Progress**, **Savings Progress**, **Upcoming Bills**, **Recent Transactions**, and a **Quick Summary matrix**.

3. **Analytics Dashboard**
   - Displays 6-month comparisons of income vs. expense flows.
   - Includes circular share percentage breakdowns by category and cash reserve projections.

4. **Financial Score Diagnostic**
   - Shows a circular health grade gauge ($A$ through $F$) indicating current credit standing, safety buffers, and liability exposure with custom feedback tips.

5. **Appearance Settings**
   - Custom display theme selectors supporting **Light Mode**, **Dark Mode**, and **System Sync** themes.

6. **Profile Customization**
   - Supports uploading custom **Profile Photos** (automatic base64 image parsing), editing personal details (Name, Email, Lifestyle Stage), and changing account passwords.

7. **OTP Password Recovery**
   - Robust 6-digit OTP verification flow with console-logging fallback options to ensure smooth local development setup.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS, TypeScript, TanStack React Query, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma (ORM), SQLite, Nodemailer (SMTP/OTP delivery), Bcrypt.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/)

### Running the Application

1. **Backend Server Setup**:
   ```bash
   cd backend
   npm install
   # Push database schema and generate Prisma client:
   npx prisma db push
   npx prisma generate
   # Run development server:
   npm run dev
   ```
   *The backend server will run on: `http://localhost:3001`*

2. **Frontend UI Setup**:
   ```bash
   cd ../frontend
   npm install
   # Run development server:
   npm run dev
   ```
   *The frontend dashboard will run on: `http://localhost:5173`*

---

## 🔑 Test Credentials

To start testing immediately with seed data, you can log in with any of the following accounts:

| User | Registered Email | Password | Lifestyle Profile |
| :--- | :--- | :--- | :--- |
| **Maya** | `maya.sharma@example.com` | `Password123!` | Family |
| **Raj** | `rajesh.mehta@example.com` | `Password123!` | Working Professional |
| **Priya** | `priya.nair@example.com` | `Password123!` | Student |
