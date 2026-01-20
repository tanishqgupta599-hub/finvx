import { create } from "zustand";
import { ActionItem, AutopsyReport, Asset, CreditCard, EmergencyContact, Feedback, Goal, InsurancePolicy, Liability, NotificationPreferences, Loan, ProfileMode, Subscription, Transaction, UserProfile, VaultDocument, CalendarEvent } from "@/domain/models";
import { TaxProfile, TaxLot, TaxEstimateSnapshot, TaxActionPlan } from "@/domain/tax";
import { ExpenseCircle, SharedExpense } from "@/domain/circles";
import { Friend } from "@/domain/friends";
import { FeatureFlags, defaultFeatureFlags } from "@/lib/feature-flags";
import { demoActions, demoAutopsyReports, demoAssets, demoCards, demoEmergencyContacts, demoGoals, demoLoans, demoNotificationPreferences, demoPolicies, demoProfile, demoScamChecks, demoSubscriptions, demoTransactions, demoVaultDocuments, demoTaxProfile, demoTaxLots, demoTaxActionPlan, demoCircles, demoFriends, demoCalendarEvents } from "./demo-data";

type AppState = {
  profile?: UserProfile;
  profileMode: ProfileMode;
  overwhelmMode: boolean;
  demoDataEnabled: boolean;
  featureFlags: FeatureFlags;
  onboardingCompleted: boolean;
  assets: Asset[];
  loans: Loan[];
  liabilities: Liability[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  creditCards: CreditCard[];
  insurancePolicies: InsurancePolicy[];
  goals: Goal[];
  scamChecks: ReturnType<typeof demoScamChecks>;
  autopsyReports: AutopsyReport[];
  actions: ActionItem[];
  emergencyContacts: EmergencyContact[];
  vaultDocuments: VaultDocument[];
  notificationPreferences: NotificationPreferences;
  feedback: Feedback[];
  taxProfile?: TaxProfile;
  taxLots: TaxLot[];
  taxActionPlan?: TaxActionPlan;
  circles: ExpenseCircle[];
  friends: Friend[];
  calendarEvents: CalendarEvent[];
};

type AppActions = {
  toggleOverwhelmMode: () => void;
  setProfileMode: (mode: ProfileMode) => void;
  setProfile: (profile: UserProfile) => void;
  setFeatureFlag: (key: keyof FeatureFlags, enabled: boolean) => void;
  enableDemoData: () => void;
  disableDemoData: () => void;
  seedDemoData: () => void;
  clearData: () => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (loan: Loan) => void;
  addLiability: (liability: Liability) => void;
  updateLiability: (liability: Liability) => void;
  addExpense: (transaction: Transaction, paymentSource: { type: 'asset' | 'creditCard', id: string }) => void;
  addTransaction: (transaction: Transaction) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  addCreditCard: (card: CreditCard) => void;
  updateCreditCard: (card: CreditCard) => void;
  removeCreditCard: (id: string) => void;
  addInsurancePolicy: (policy: InsurancePolicy) => void;
  updateInsurancePolicy: (policy: InsurancePolicy) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  setActions: (actions: ActionItem[]) => void;
  toggleActionStep: (actionId: string, stepId: string) => void;
  markOnboardingCompleted: () => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  updateNotificationPreferences: (prefs: NotificationPreferences) => void;
  addVaultDocument: (doc: VaultDocument) => void;
  addFeedback: (feedback: Feedback) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  updateTaxProfile: (profile: TaxProfile) => void;
  addTaxLot: (lot: TaxLot) => void;
  toggleTaxActionStep: (stepId: string) => void;
  addCircle: (circle: ExpenseCircle) => void;
  updateCircle: (circle: ExpenseCircle) => void;
  addSharedExpense: (circleId: string, expense: SharedExpense) => void;
  addFriend: (friend: Friend) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  removeCalendarEvent: (id: string) => void;
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  profile: demoProfile(),
  profileMode: "Balanced",
  overwhelmMode: false,
  demoDataEnabled: true,
  featureFlags: defaultFeatureFlags,
  onboardingCompleted: false,
  assets: [],
  loans: [],
  liabilities: [],
  transactions: [],
  subscriptions: [],
  creditCards: [],
  insurancePolicies: [],
  goals: [],
  scamChecks: [],
  autopsyReports: [],
  actions: [],
  emergencyContacts: [],
  vaultDocuments: [],
  notificationPreferences: {
    email: true,
    push: false,
    productUpdates: true,
    reminders: true,
  },
  feedback: [],
  taxProfile: demoTaxProfile(),
  taxLots: [],
  taxActionPlan: undefined,
  circles: [],
  friends: [],
  calendarEvents: [],
  toggleOverwhelmMode: () => set((s) => ({ overwhelmMode: !s.overwhelmMode })),
  setProfileMode: (mode) => set(() => ({ profileMode: mode })),
  setProfile: (profile) => set(() => ({ profile })),
  setFeatureFlag: (key, enabled) =>
    set((s) => ({ featureFlags: { ...s.featureFlags, [key]: enabled } })),
  enableDemoData: () => set(() => ({ demoDataEnabled: true })),
  disableDemoData: () => set(() => ({ demoDataEnabled: false })),
  seedDemoData: () =>
    set(() => ({
      assets: demoAssets(),
      loans: demoLoans(),
      liabilities: [],
      transactions: demoTransactions(),
      subscriptions: demoSubscriptions(),
      creditCards: demoCards(),
      insurancePolicies: demoPolicies(),
      goals: demoGoals(),
      scamChecks: demoScamChecks(),
      autopsyReports: demoAutopsyReports(),
      actions: demoActions(),
      emergencyContacts: demoEmergencyContacts(),
      vaultDocuments: demoVaultDocuments(),
      notificationPreferences: demoNotificationPreferences(),
      taxProfile: demoTaxProfile(),
      taxLots: demoTaxLots(),
      taxActionPlan: demoTaxActionPlan(),
      circles: demoCircles(),
      friends: demoFriends(),
      calendarEvents: demoCalendarEvents(),
    })),
  clearData: () =>
    set(() => ({
      assets: [],
      loans: [],
      liabilities: [],
      transactions: [],
      subscriptions: [],
      creditCards: [],
      insurancePolicies: [],
      goals: [],
      scamChecks: [],
      autopsyReports: [],
      actions: [],
      emergencyContacts: [],
      vaultDocuments: [],
      taxLots: [],
      taxActionPlan: undefined,
      circles: [],
      friends: [],
      calendarEvents: [],
    })),
  addAsset: (asset) =>
    set((s) => ({
      assets: [...s.assets, asset],
    })),
  updateAsset: (asset) =>
    set((s) => ({
      assets: s.assets.map((a) => (a.id === asset.id ? asset : a)),
    })),
  removeAsset: (id) =>
    set((s) => ({
      assets: s.assets.filter((a) => a.id !== id),
    })),
  addLoan: (loan) =>
    set((s) => ({
      loans: [...s.loans, loan],
    })),
  updateLoan: (loan) =>
    set((s) => ({
      loans: s.loans.map((l) => (l.id === loan.id ? loan : l)),
    })),
  addLiability: (liability) =>
    set((s) => ({
      liabilities: [...s.liabilities, liability],
    })),
  updateLiability: (liability) =>
    set((s) => ({
      liabilities: s.liabilities.map((l) => (l.id === liability.id ? liability : l)),
    })),
  addExpense: (transaction: Transaction, paymentSource: { type: 'asset' | 'creditCard', id: string }) =>
    set((s) => {
      let assets = s.assets;
      let creditCards = s.creditCards;
      let liabilities = s.liabilities;
      
      if (paymentSource.type === 'asset') {
        const assetIndex = s.assets.findIndex((a) => a.id === paymentSource.id);
        if (assetIndex >= 0) {
          const asset = s.assets[assetIndex];
          // Expense reduces asset value
          const newValue = asset.value - Math.abs(transaction.amount);
          assets = [...s.assets];
          assets[assetIndex] = { ...asset, value: newValue };
        }
      } else if (paymentSource.type === 'creditCard') {
        const cardIndex = s.creditCards.findIndex((c) => c.id === paymentSource.id);
        if (cardIndex >= 0) {
          const card = s.creditCards[cardIndex];
          // Expense increases credit card balance (debt)
          const newBalance = card.balance + Math.abs(transaction.amount);
          creditCards = [...s.creditCards];
          creditCards[cardIndex] = { ...card, balance: newBalance };

          // Sync with Liabilities
          // Check if liability exists for this card (by name or some link)
          // For simplicity, we match by name or create new
          const liabilityIndex = s.liabilities.findIndex(l => l.name === card.brand + " " + card.last4 || l.name === card.rewardProgram);
          
          if (liabilityIndex >= 0) {
             const liability = s.liabilities[liabilityIndex];
             const newLiabBalance = liability.balance + Math.abs(transaction.amount);
             liabilities = [...s.liabilities];
             liabilities[liabilityIndex] = { ...liability, balance: newLiabBalance };
          } else {
             // Create new liability for this card
             const newLiability: Liability = {
               id: `liab-card-${card.id}`,
               name: `${card.brand.toUpperCase()} ${card.last4}`,
               type: 'credit',
               balance: newBalance, // Sync total balance
               apr: card.apr
             };
             liabilities = [...s.liabilities, newLiability];
          }
        }
      }

      return {
        assets,
        creditCards,
        liabilities,
        transactions: [...s.transactions, transaction],
      };
    }),
  addTransaction: (transaction) =>
    set((s) => {
      let assets = s.assets;
      if (transaction.account) {
        const assetIndex = s.assets.findIndex((a) => a.name === transaction.account);
        if (assetIndex >= 0) {
          const asset = s.assets[assetIndex];
          const newValue = asset.value + transaction.amount;
          assets = [...s.assets];
          assets[assetIndex] = { ...asset, value: newValue };
        }
      }
      return {
        assets,
        transactions: [...s.transactions, transaction],
      };
    }),
  addSubscription: (subscription) =>
    set((s) => ({
      subscriptions: [...s.subscriptions, subscription],
    })),
  updateSubscription: (subscription) =>
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? subscription : sub)),
    })),
  addCreditCard: (card) =>
    set((s) => ({
      creditCards: [...s.creditCards, card],
    })),
  updateCreditCard: (card) =>
    set((s) => ({
      creditCards: s.creditCards.map((c) => (c.id === card.id ? card : c)),
    })),
  removeCreditCard: (id) =>
    set((s) => ({
      creditCards: s.creditCards.filter((c) => c.id !== id),
    })),
  addInsurancePolicy: (policy) =>
    set((s) => ({
      insurancePolicies: [...s.insurancePolicies, policy],
    })),
  updateInsurancePolicy: (policy) =>
    set((s) => ({
      insurancePolicies: s.insurancePolicies.map((p) => (p.id === policy.id ? policy : p)),
    })),
  addGoal: (goal) =>
    set((s) => ({
      goals: [...s.goals, goal],
    })),
  updateGoal: (goal) =>
    set((s) => ({
      goals: s.goals.map((g) => (g.id === goal.id ? goal : g)),
    })),
  setActions: (actions) =>
    set(() => ({
      actions,
    })),
  toggleActionStep: (actionId, stepId) =>
    set((s) => {
      const updated = s.actions.map((action) => {
        if (action.id !== actionId) return action;
        const updatedSteps = action.steps.map((step) =>
          step.id === stepId ? { ...step, done: !step.done } : step
        );
        const allDone = updatedSteps.every((step) => step.done);
        const status: ActionItem["status"] =
          allDone ? "done" : updatedSteps.some((step) => step.done) ? "in_progress" : "new";
        return { ...action, steps: updatedSteps, status };
      });
      return { actions: updated };
    }),
  markOnboardingCompleted: () => set(() => ({ onboardingCompleted: true })),
  addEmergencyContact: (contact) =>
    set((s) => ({
      emergencyContacts: [...s.emergencyContacts, contact],
    })),
  updateNotificationPreferences: (prefs) =>
    set(() => ({
      notificationPreferences: prefs,
    })),
  addVaultDocument: (doc) =>
    set((s) => ({
      vaultDocuments: [...s.vaultDocuments, doc],
    })),
  addFeedback: (feedback) =>
    set((s) => ({
      feedback: [...s.feedback, feedback],
    })),
  deleteTransaction: (id) =>
    set((s) => {
      const txn = s.transactions.find((t) => t.id === id);
      if (!txn) return {};

      let assets = [...s.assets];
      let creditCards = [...s.creditCards];
      let liabilities = [...s.liabilities];

      const revertTransaction = (t: Transaction) => {
        if (t.amount < 0) {
          const assetIndex = assets.findIndex((a) => a.name === t.account);
          if (assetIndex >= 0) {
            assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value + Math.abs(t.amount) };
          } else {
            const cardIndex = creditCards.findIndex((c) => t.account?.includes(c.last4) || t.account === `${c.brand} ${c.last4}`);
            if (cardIndex >= 0) {
              creditCards[cardIndex] = { ...creditCards[cardIndex], balance: creditCards[cardIndex].balance - Math.abs(t.amount) };
              const liabIndex = liabilities.findIndex((l) => l.name === creditCards[cardIndex].brand + " " + creditCards[cardIndex].last4);
              if (liabIndex >= 0) {
                liabilities[liabIndex] = { ...liabilities[liabIndex], balance: liabilities[liabIndex].balance - Math.abs(t.amount) };
              }
            }
          }
        } else {
          const assetIndex = assets.findIndex((a) => a.name === t.account);
          if (assetIndex >= 0) {
            assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value - t.amount };
          }
        }
      };

      revertTransaction(txn);

      return {
        transactions: s.transactions.filter((t) => t.id !== id),
        assets,
        creditCards,
        liabilities,
      };
    }),
  updateTransaction: (transaction) =>
    set((s) => {
      const oldTxn = s.transactions.find((t) => t.id === transaction.id);
      if (!oldTxn) return {};

      let assets = [...s.assets];
      let creditCards = [...s.creditCards];
      let liabilities = [...s.liabilities];

      const applyChange = (t: Transaction, reverse: boolean) => {
        const absAmount = Math.abs(t.amount);
        if (t.amount < 0) {
          const assetIndex = assets.findIndex((a) => a.name === t.account);
          if (assetIndex >= 0) {
            if (reverse) {
              assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value + absAmount };
            } else {
              assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value - absAmount };
            }
          } else {
            const cardIndex = creditCards.findIndex((c) => t.account?.includes(c.last4) || t.account === `${c.brand} ${c.last4}`);
            if (cardIndex >= 0) {
              if (reverse) {
                creditCards[cardIndex] = { ...creditCards[cardIndex], balance: creditCards[cardIndex].balance - absAmount };
              } else {
                creditCards[cardIndex] = { ...creditCards[cardIndex], balance: creditCards[cardIndex].balance + absAmount };
              }
              const liabIndex = liabilities.findIndex((l) => l.name === creditCards[cardIndex].brand + " " + creditCards[cardIndex].last4);
              if (liabIndex >= 0) {
                liabilities[liabIndex] = { ...liabilities[liabIndex], balance: creditCards[cardIndex].balance };
              }
            }
          }
        } else {
          const assetIndex = assets.findIndex((a) => a.name === t.account);
          if (assetIndex >= 0) {
            if (reverse) {
              assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value - t.amount };
            } else {
              assets[assetIndex] = { ...assets[assetIndex], value: assets[assetIndex].value + t.amount };
            }
          }
        }
      };

      applyChange(oldTxn, true);
      applyChange(transaction, false);

      return {
        transactions: s.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
        assets,
        creditCards,
        liabilities,
      };
    }),
  updateTaxProfile: (profile) => set(() => ({ taxProfile: profile })),
  addTaxLot: (lot) => set((s) => ({ taxLots: [...s.taxLots, lot] })),
  toggleTaxActionStep: (stepId) =>
    set((s) => {
      if (!s.taxActionPlan) return {};
      const updatedSteps = s.taxActionPlan.steps.map((step) =>
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
      );
      return {
        taxActionPlan: { ...s.taxActionPlan, steps: updatedSteps },
      };
    }),
  addCircle: (circle) =>
    set((s) => ({
      circles: [circle, ...s.circles],
    })),
  updateCircle: (circle) =>
    set((s) => ({
      circles: s.circles.map((c) => (c.id === circle.id ? circle : c)),
    })),
  addSharedExpense: (circleId, expense) =>
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c;
        return { ...c, expenses: [expense, ...c.expenses] };
      }),
    })),
  addFriend: (friend) =>
    set((s) => ({
      friends: [...s.friends, friend],
    })),
  addCalendarEvent: (event) =>
    set((s) => ({
      calendarEvents: [...s.calendarEvents, event],
    })),
  removeCalendarEvent: (id) =>
    set((s) => ({
      calendarEvents: s.calendarEvents.filter((e) => e.id !== id),
    })),
}));
