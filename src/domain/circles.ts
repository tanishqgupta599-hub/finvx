
export type SplitType = "equal" | "exact_amount" | "percentage" | "shares";

export interface CircleMember {
  id: string; // FinanceOS ID
  name: string;
  avatar?: string;
  joinedAt: string;
  role: "admin" | "member";
  reminderPreferences: ReminderPreference;
}

export interface ReminderPreference {
  quietHoursStart?: string; // e.g. "22:00"
  quietHoursEnd?: string;   // e.g. "08:00"
  tone: "soft" | "neutral" | "direct";
  mutedCircles: string[]; // Circle IDs
  blockedUsers: string[]; // User IDs
}

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface SharedExpense {
  id: string;
  circleId: string;
  description: string;
  amount: number;
  paidBy: string; // Member ID
  date: string;
  category: string;
  splits: ExpenseSplit[];
  createdAt: string;
  createdBy: string;
}

export interface ExpenseCircle {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  members: CircleMember[];
  currency: string;
  createdAt: string;
  updatedAt: string;
  defaultSplitType: SplitType;
  expenses: SharedExpense[];
}

export interface NetBalance {
  memberId: string;
  balance: number; // Positive = owes money, Negative = is owed money (or vice versa, need to define convention. Let's say Positive = you are owed, Negative = you owe)
}

// Convention:
// If I paid 1000 for 2 people (500 each).
// I paid 1000. My share is 500. I am owed 500.
// Balance = Paid - Share.
// 1000 - 500 = +500 (Owed to me).
// Other person: Paid 0. Share 500.
// 0 - 500 = -500 (Owes).

export interface SettlementSuggestion {
  from: string; // Member ID
  to: string;   // Member ID
  amount: number;
}

export interface Reminder {
  id: string;
  from: string;
  to: string;
  circleId: string;
  amount: number;
  type: "nudge" | "summary" | "settlement";
  status: "sent" | "delivered" | "read" | "paid";
  sentAt: string;
  toneUsed: string;
}

export interface CircleAuditLog {
  id: string;
  circleId: string;
  action: "create_expense" | "update_expense" | "delete_expense" | "send_reminder" | "join_circle" | "leave_circle";
  actorId: string;
  targetId?: string;
  timestamp: string;
  details?: string;
}
