export type ProfileMode = "Growth" | "Balanced" | "Peace" | "Senior";

export type RiskProfile = "conservative" | "balanced" | "aggressive" | "optimizer";
export type IncomeType = "salary" | "business" | "freelance" | "passive" | "other";

export interface IncomeStream {
  id: string;
  name: string;
  type: IncomeType;
  amount: number;
  frequency: "monthly" | "weekly" | "yearly" | "irregular";
  predictability: number; // 0-100
}

export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";

export type EmploymentType = "student" | "salaried" | "self-employed" | "business" | "unemployed" | "retired";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  mode: ProfileMode;
  riskProfile?: RiskProfile;
  financialArchetype?: string;
  profession?: string;
  incomeStreams?: IncomeStream[];
  ageRange?: AgeRange;
  country?: string;
  countryCode?: 'US' | 'CA' | 'IN' | 'AE';
  currency?: string;
  hasDependents?: boolean;
  employment?: EmploymentType;
  monthlyIncomeRange?: string;
  monthlyFixedCostRange?: string;
  insuranceHealth?: boolean;
  insuranceTerm?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  onboardingCompleted?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: "cash" | "investment" | "property" | "other";
  value: number;
  institution?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: "loan" | "mortgage" | "credit" | "other";
  balance: number;
  apr?: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  balance: number;
  apr: number;
  monthlyPayment: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: "income" | "spending" | "transfer" | "grocery" | "entertainment" | "utilities" | "shopping" | "travel" | "health" | "dining" | "other";
  account?: string;
}

export const EXPENSE_CATEGORIES: { value: Transaction["category"]; label: string }[] = [
  { value: "grocery", label: "Grocery" },
  { value: "dining", label: "Dining & Food" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Bills & Utilities" },
  { value: "shopping", label: "Shopping" },
  { value: "travel", label: "Travel" },
  { value: "health", label: "Health & Wellness" },
  { value: "transfer", label: "Transfer" },
  { value: "spending", label: "General Spending" },
  { value: "other", label: "Other" },
];

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cadence: "monthly" | "yearly" | "weekly";
  nextChargeDate: string;
}

export interface CreditCard {
  id: string;
  name?: string;
  brand: "visa" | "mastercard" | "amex" | "discover" | "other";
  last4: string;
  limit: number;
  balance: number;
  billAmount?: number;
  billDueDate?: string;
  apr?: number;
  pointsBalance?: number;
  nextBillDate?: string;
  rewardProgram?: string;
  annualFee?: number;
}

export interface InsurancePolicy {
  id: string;
  type: "health" | "life" | "home" | "auto" | "other";
  provider: string;
  premium: number;
  coverageAmount?: number;
  renewalDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  type: "retirement" | "emergency" | "family" | "travel" | "education" | "home" | "other";
  targetAmount: number;
  currentAmount: number;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: "bill" | "income" | "other";
  isRecurring?: boolean;
}

export const GOAL_TYPES: { value: Goal["type"]; label: string; suggestion: string }[] = [
  { value: "retirement", label: "Retirement", suggestion: "Aim for 20-25x annual expenses. Consider equity mutual funds." },
  { value: "emergency", label: "Emergency Fund", suggestion: "Keep 3-6 months of expenses in liquid funds or FD." },
  { value: "family", label: "Family Planning", suggestion: "Short term? Use debt funds. Long term? Mix equity and debt." },
  { value: "education", label: "Education", suggestion: "Factor in inflation (10%). Start SIPs early." },
  { value: "home", label: "Home Purchase", suggestion: "Save for 20% down payment + registration costs." },
  { value: "travel", label: "Travel", suggestion: "Short term goal. Use Recurring Deposits or Liquid Funds." },
  { value: "other", label: "Other", suggestion: "Define your timeline to choose the right instrument." },
];

export interface ScamCheck {
  id: string;
  title: string;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "safe" | "review";
  notes?: string;
  date?: string;
  description?: string;
}

export interface AutopsyReport {
  id: string;
  title: string;
  date: string;
  summary: string;
  findings: string[];
}

export interface ActionStep {
  id: string;
  label: string;
  done: boolean;
}

export interface ActionItem {
  id: string;
  title: string;
  reason: string;
  impactLabel: string;
  safe: boolean;
  status: "new" | "in_progress" | "done";
  steps: ActionStep[];
  whyThis: string;
  consequence: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  category: string;
  tags: string[];
  dateAdded?: string;
  url?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  productUpdates: boolean;
  reminders: boolean;
}

export interface Feedback {
  id: string;
  message: string;
  createdAt: string;
  path?: string;
}

