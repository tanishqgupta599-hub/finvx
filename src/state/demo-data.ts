import { ActionItem, AutopsyReport, Asset, CreditCard, EmergencyContact, Goal, InsurancePolicy, Loan, NotificationPreferences, ScamCheck, Subscription, Transaction, UserProfile, VaultDocument, CalendarEvent } from "@/domain/models";
import { TaxProfile, TaxLot, TaxActionPlan } from "@/domain/tax";
import { ExpenseCircle } from "@/domain/circles";
import { Friend } from "@/domain/friends";

export function demoProfile(): UserProfile {
  return {
    id: "user_demo",
    name: "Alex Morgan",
    email: "alex@example.com",
    avatarUrl: "/avatar.png",
    mode: "Balanced",
    country: "India",
    currency: "INR",
    ageRange: "25-34",
    employment: "salaried",
  };
}

export function demoAssets(): Asset[] {
  return [
    { id: "a1", name: "Savings Account", type: "cash", value: 125000, institution: "HDFC Bank" },
    { id: "a2", name: "Nifty 50 Index Fund", type: "investment", value: 450000, institution: "Zerodha" },
    { id: "a3", name: "Emergency Fund", type: "cash", value: 300000, institution: "ICICI Bank" },
  ];
}

export function demoLoans(): Loan[] {
  return [
    { id: "l1", name: "Student Loan", principal: 32000, balance: 21500, apr: 4.2, monthlyPayment: 220 },
    { id: "l2", name: "Auto Loan", principal: 18000, balance: 9500, apr: 3.5, monthlyPayment: 310 },
  ];
}

export function demoTransactions(): Transaction[] {
  return [
    { id: "t1", date: new Date().toISOString(), description: "Groceries", amount: -86.4, category: "spending", account: "Checking" },
    { id: "t2", date: new Date().toISOString(), description: "Salary", amount: 4200, category: "income", account: "Checking" },
    { id: "t3", date: new Date().toISOString(), description: "Gym", amount: -29, category: "spending", account: "Credit Card" },
  ];
}

export function demoSubscriptions(): Subscription[] {
  return [
    { id: "s1", name: "Netflix", amount: 15.99, cadence: "monthly", nextChargeDate: new Date().toISOString() },
    { id: "s2", name: "Spotify", amount: 9.99, cadence: "monthly", nextChargeDate: new Date().toISOString() },
  ];
}

export function demoCards(): CreditCard[] {
  return [
    { id: "c1", brand: "visa", last4: "1234", limit: 120000, balance: 18000, apr: 19.99, pointsBalance: 4200, nextBillDate: new Date().toISOString(), rewardProgram: "Everyday Rewards", annualFee: 500 },
    { id: "c2", brand: "amex", last4: "5544", limit: 80000, balance: 2500, apr: 17.5, pointsBalance: 8200, nextBillDate: new Date().toISOString(), rewardProgram: "Platinum Travel", annualFee: 5000 },
  ];
}

export function demoPolicies(): InsurancePolicy[] {
  return [
    { id: "p1", type: "health", provider: "Aetna", premium: 220 },
    { id: "p2", type: "auto", provider: "Geico", premium: 110, coverageAmount: 250000 },
  ];
}

export function demoGoals(): Goal[] {
  return [
    { id: "g1", title: "Emergency Fund", targetAmount: 15000, currentAmount: 6800, priority: "high", type: "emergency" },
    { id: "g2", title: "House Down Payment", targetAmount: 60000, currentAmount: 12500, dueDate: "2028-06-01", priority: "medium", type: "home" },
  ];
}

export function demoScamChecks(): ScamCheck[] {
  return [
    { id: "sc1", title: "Phishing Email", riskLevel: "medium", status: "review", date: new Date().toISOString(), description: "Suspicious email claiming to be from bank" },
    { id: "sc2", title: "Unknown Charge", riskLevel: "low", status: "pending", date: new Date().toISOString(), description: "Small charge on credit card" },
  ];
}

export function demoAutopsyReports(): AutopsyReport[] {
  return [
    { id: "ar1", title: "Holiday Overspend", date: "2025-12-15", summary: "Spending exceeded budget by 18%", findings: ["Subscriptions overlap", "Impulse buys"] },
  ];
}

export function demoActions(): ActionItem[] {
  return [
    {
      id: "act-review-subscriptions",
      title: "Trim subscriptions",
      reason: "Two streaming plans overlap each month",
      impactLabel: "saves ₹800/mo",
      safe: true,
      status: "new",
      steps: [
        { id: "s1", label: "List all recurring charges", done: false },
        { id: "s2", label: "Cancel at least one low-value subscription", done: false },
        { id: "s3", label: "Set monthly reminder to review subscriptions", done: false },
      ],
      whyThis: "Small recurring leaks compound quickly. Clearing one or two frees mental and cash flow space.",
      consequence: "If you ignore this, overlapping subscriptions quietly erode 5–10% of your monthly surplus.",
    },
    {
      id: "act-boost-emergency-fund",
      title: "Boost emergency fund",
      reason: "Emergency reserves are below 3 months of expenses",
      impactLabel: "reduces risk",
      safe: false,
      status: "new",
      steps: [
        { id: "s1", label: "Confirm fixed monthly costs", done: false },
        { id: "s2", label: "Schedule an automatic monthly top-up", done: false },
        { id: "s3", label: "Bookmark emergency fund goal in Finvx", done: false },
      ],
      whyThis: "An emergency fund keeps bad surprises from turning into debt spirals.",
      consequence: "Without reserves, even small shocks may push you toward high-interest borrowing.",
    },
    {
      id: "act-align-card-usage",
      title: "Align card for daily spend",
      reason: "You are not using the card with the best rewards for everyday purchases",
      impactLabel: "earns extra points",
      safe: true,
      status: "new",
      steps: [
        { id: "s1", label: "Select one primary card for groceries and fuel", done: false },
        { id: "s2", label: "Update autopay to avoid interest", done: false },
      ],
      whyThis: "Routing routine spend through the right card improves rewards without extra complexity.",
      consequence: "If ignored, you leave quiet value on the table with no added safety.",
    },
  ];
}

export function demoEmergencyContacts(): EmergencyContact[] {
  return [
    { id: "ec1", name: "Riya Sharma", phone: "+91 98765 00001", relationship: "Spouse" },
  ];
}

export function demoVaultDocuments(): VaultDocument[] {
  return [
    { id: "vd1", name: "Health Insurance Policy.pdf", category: "Insurance", tags: ["health", "policy"], dateAdded: new Date().toISOString(), url: "#" },
    { id: "vd2", name: "Term Plan Summary.png", category: "Life", tags: ["term", "summary"], dateAdded: new Date().toISOString(), url: "#" },
  ];
}

export function demoNotificationPreferences(): NotificationPreferences {
  return {
    email: true,
    push: false,
    productUpdates: true,
    reminders: true,
  };
}

export function demoTaxProfile(): TaxProfile {
  return {
    id: "tp_demo_1",
    jurisdiction: "IN",
    regime: "new",
    fiscalYearStart: "2024-04-01",
    filingStatus: "individual",
    pan: "ABCDE1234F"
  };
}

export function demoTaxLots(): TaxLot[] {
  return [
    { 
      id: "tl1", 
      assetId: "rel_ind",
      assetName: "Reliance Industries", 
      quantity: 100, 
      purchasePrice: 2200, 
      purchaseDate: "2024-01-15", 
      currentPrice: 2450, 
      type: "equity",
      isLongTerm: false
    },
  ];
}

export function demoTaxActionPlan(): TaxActionPlan {
  return {
    id: "tap_demo_1",
    generatedAt: new Date().toISOString(),
    totalPotentialSavings: 23600,
    steps: [
      {
        id: "step1",
        title: "Max out Section 80C",
        description: "Invest ₹50,000 more in ELSS or PPF to reach the ₹1.5L limit.",
        deadline: "2025-03-31",
        potentialSaving: 15600,
        type: "investment",
        isCompleted: false,
        status: "pending",
        impactLevel: "high",
        actionUrl: "/invest"
      },
      {
        id: "step2",
        title: "Harvest LTCG Losses",
        description: "Sell underperforming stocks to offset gains.",
        deadline: "2025-03-25",
        potentialSaving: 8000,
        type: "harvesting",
        isCompleted: false,
        status: "pending",
        impactLevel: "medium",
        actionUrl: "/portfolio"
      }
    ]
  };
}

export function demoCircles(): ExpenseCircle[] {
  return [];
}

export function demoFriends(): Friend[] {
  return [
    { 
      id: "f1", 
      name: "Riya", 
      email: "riya@example.com", 
      avatar: "/avatars/riya.jpg", 
      status: "active",
      joinedAt: new Date().toISOString(),
      associatedCircleIds: []
    },
    { 
      id: "f2", 
      name: "Arjun", 
      email: "arjun@example.com", 
      avatar: "/avatars/arjun.jpg", 
      status: "invited",
      joinedAt: new Date().toISOString(),
      associatedCircleIds: []
    },
  ];
}

export function demoCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return [
    { id: "ev1", date: today.toISOString(), title: "Freelance Project", amount: 15000, type: "income", isRecurring: false },
    { id: "ev2", date: nextWeek.toISOString(), title: "Car Service", amount: 8000, type: "bill", isRecurring: false },
  ];
}


