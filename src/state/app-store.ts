import { create } from "zustand";
import { toast } from "sonner";
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
  addAsset: (asset: Asset) => Promise<void>;
  updateAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  addLoan: (loan: Loan) => Promise<void>;
  updateLoan: (loan: Loan) => void;
  addLiability: (liability: Liability) => Promise<void>;
  updateLiability: (liability: Liability) => void;
  addExpense: (transaction: Transaction, paymentSource: { type: 'asset' | 'creditCard', id: string }) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  addSubscription: (subscription: Subscription) => Promise<void>;
  updateSubscription: (subscription: Subscription) => void;
  addCreditCard: (card: CreditCard) => Promise<void>;
  updateCreditCard: (card: CreditCard) => void;
  removeCreditCard: (id: string) => void;
  addInsurancePolicy: (policy: InsurancePolicy) => Promise<void>;
  updateInsurancePolicy: (policy: InsurancePolicy) => void;
  addGoal: (goal: Goal) => Promise<void>;
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
  addFriend: (friend: Friend) => Promise<void>;
  addCalendarEvent: (event: CalendarEvent) => Promise<void>;
  removeCalendarEvent: (id: string) => void;
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
  syncUser: () => Promise<void>;
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  profile: demoProfile(),
  profileMode: "Balanced",
  overwhelmMode: false,
  demoDataEnabled: false, // Default to false for production
  isLoading: false,
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
  taxProfile: undefined,
  taxLots: [],
  taxActionPlan: undefined,
  circles: [],
  friends: [],
  calendarEvents: [],
  
  // New actions
  fetchUserData: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/bootstrap");
      if (response.ok) {
        const data = await response.json();
        set({
          profile: data, 
          assets: data.assets || [],
          loans: data.loans || [],
          liabilities: data.liabilities || [],
          transactions: data.transactions || [],
          subscriptions: data.subscriptions || [],
          creditCards: data.creditCards || [],
          insurancePolicies: data.insurancePolicies || [],
          goals: data.goals || [],
          calendarEvents: data.calendarEvents || [],
          scamChecks: data.scamChecks || [],
          autopsyReports: data.autopsyReports || [],
          actions: data.actionItems || [],
          emergencyContacts: data.emergencyContacts || [],
          vaultDocuments: data.vaultDocuments || [],
          friends: data.friends || [],
          circles: data.circles || [],
          taxProfile: data.taxProfile, // Load tax profile
          demoDataEnabled: false, 
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  syncUser: async () => {
    try {
      const response = await fetch("/api/user/sync", { method: "POST" });
      if (response.ok) {
        const userData = await response.json();
        set((state) => ({
           profile: { ...state.profile, ...userData }
        }));
      }
    } catch (error) {
      console.error("Failed to sync user:", error);
    }
  },

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
  addAsset: async (asset) => {
    set((s) => ({
      assets: [...s.assets, asset],
    }));
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
      if (response.ok) {
        const savedAsset = await response.json();
        set((s) => ({
          assets: s.assets.map((a) => (a.id === asset.id ? { ...savedAsset, value: Number(savedAsset.value) } : a)),
        }));
        toast.success("Asset saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save asset:", errorData);
        toast.error(`Failed to save asset: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          assets: s.assets.filter((a) => a.id !== asset.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save asset:", error);
      toast.error("Failed to save asset. Check connection.");
      set((s) => ({
        assets: s.assets.filter((a) => a.id !== asset.id),
      }));
    }
  },
  updateAsset: (asset) =>
    set((s) => ({
      assets: s.assets.map((a) => (a.id === asset.id ? asset : a)),
    })),
  removeAsset: (id) =>
    set((s) => ({
      assets: s.assets.filter((a) => a.id !== id),
    })),
  addLoan: async (loan) => {
    set((s) => ({
      loans: [...s.loans, loan],
    }));
    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loan),
      });
      if (response.ok) {
        const savedLoan = await response.json();
        set((s) => ({
           loans: s.loans.map((l) => (l.id === loan.id ? { ...savedLoan, principal: Number(savedLoan.principal), balance: Number(savedLoan.balance), apr: Number(savedLoan.apr), monthlyPayment: Number(savedLoan.monthlyPayment) } : l)),
        }));
        toast.success("Loan saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save loan:", errorData);
        toast.error(`Failed to save loan: ${errorData.error || "Unknown error"}`);
        set((s) => ({
           loans: s.loans.filter((l) => l.id !== loan.id),
        }));
      }
    } catch (error) {
       console.error("Failed to save loan:", error);
       toast.error("Failed to save loan. Check connection.");
       set((s) => ({
          loans: s.loans.filter((l) => l.id !== loan.id),
       }));
    }
  },
  updateLoan: (loan) =>
    set((s) => ({
      loans: s.loans.map((l) => (l.id === loan.id ? loan : l)),
    })),
  addLiability: async (liability) => {
    set((s) => ({
      liabilities: [...s.liabilities, liability],
    }));
    try {
      const response = await fetch("/api/liabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liability),
      });
      if (response.ok) {
        const savedLiability = await response.json();
        set((s) => ({
          liabilities: s.liabilities.map((l) => (l.id === liability.id ? { ...savedLiability, balance: Number(savedLiability.balance), apr: savedLiability.apr ? Number(savedLiability.apr) : undefined } : l)),
        }));
        toast.success("Liability saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save liability:", errorData);
        toast.error(`Failed to save liability: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          liabilities: s.liabilities.filter((l) => l.id !== liability.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save liability:", error);
      toast.error("Failed to save liability. Check connection.");
      set((s) => ({
        liabilities: s.liabilities.filter((l) => l.id !== liability.id),
      }));
    }
  },
  updateLiability: (liability) =>
    set((s) => ({
      liabilities: s.liabilities.map((l) => (l.id === liability.id ? liability : l)),
    })),
  addExpense: async (transaction, paymentSource) => {
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
    });

    try {
       const response = await fetch("/api/transactions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...transaction, paymentSource }),
       });
       if (response.ok) {
         const savedTxn = await response.json();
         set((s) => ({
           transactions: s.transactions.map((t) => (t.id === transaction.id ? { ...savedTxn, amount: Number(savedTxn.amount), date: new Date(savedTxn.date) } : t)),
         }));
         toast.success("Expense saved successfully");
       } else {
         const errorData = await response.json();
         console.error("Failed to save expense:", errorData);
         toast.error(`Failed to save expense: ${errorData.error || "Unknown error"}`);
         // Rollback logic is complex here due to side effects, for now just removing transaction
         // Ideally we should refetch or have a robust rollback
         set((s) => ({
            transactions: s.transactions.filter((t) => t.id !== transaction.id),
         }));
       }
    } catch (error) {
       console.error("Failed to save expense:", error);
       toast.error("Failed to save expense. Check connection.");
       set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== transaction.id),
       }));
    }
  },
  addTransaction: async (transaction) => {
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
    });
    
    // Attempt to resolve paymentSource for backend
    let paymentSource = undefined;
    if (transaction.account) {
      const asset = get().assets.find(a => a.name === transaction.account);
      if (asset) {
        paymentSource = { type: 'asset', id: asset.id };
      }
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, paymentSource }),
      });
      if (response.ok) {
        const savedTxn = await response.json();
        set((s) => ({
           transactions: s.transactions.map((t) => (t.id === transaction.id ? { ...savedTxn, amount: Number(savedTxn.amount), date: new Date(savedTxn.date) } : t)),
        }));
        toast.success("Transaction saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save transaction:", errorData);
        toast.error(`Failed to save transaction: ${errorData.error || "Unknown error"}`);
        set((s) => ({
           transactions: s.transactions.filter((t) => t.id !== transaction.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
      toast.error("Failed to save transaction. Check connection.");
      set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== transaction.id),
      }));
    }
  },
  addSubscription: async (subscription) => {
    set((s) => ({
      subscriptions: [...s.subscriptions, subscription],
    }));
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (response.ok) {
        const savedSub = await response.json();
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? { ...savedSub, amount: Number(savedSub.amount), nextChargeDate: new Date(savedSub.nextChargeDate) } : sub)),
        }));
        toast.success("Subscription saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save subscription:", errorData);
        toast.error(`Failed to save subscription: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          subscriptions: s.subscriptions.filter((s) => s.id !== subscription.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save subscription:", error);
      toast.error("Failed to save subscription. Check connection.");
      set((s) => ({
        subscriptions: s.subscriptions.filter((s) => s.id !== subscription.id),
      }));
    }
  },
  updateSubscription: (subscription) =>
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? subscription : sub)),
    })),
  addCreditCard: async (card) => {
    set((s) => ({
      creditCards: [...s.creditCards, card],
    }));
    try {
      const response = await fetch("/api/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      if (response.ok) {
        const savedCard = await response.json();
        set((s) => ({
          creditCards: s.creditCards.map((c) => (c.id === card.id ? { ...savedCard, limit: Number(savedCard.limit), balance: Number(savedCard.balance), apr: Number(savedCard.apr) } : c)),
        }));
        toast.success("Card saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save card:", errorData);
        toast.error(`Failed to save card: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          creditCards: s.creditCards.filter((c) => c.id !== card.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save card:", error);
      toast.error("Failed to save card. Check connection.");
      set((s) => ({
        creditCards: s.creditCards.filter((c) => c.id !== card.id),
      }));
    }
  },
  updateCreditCard: (card) =>
    set((s) => ({
      creditCards: s.creditCards.map((c) => (c.id === card.id ? card : c)),
    })),
  removeCreditCard: (id) =>
    set((s) => ({
      creditCards: s.creditCards.filter((c) => c.id !== id),
    })),
  addInsurancePolicy: async (policy) => {
    set((s) => ({
      insurancePolicies: [...s.insurancePolicies, policy],
    }));
    try {
      const response = await fetch("/api/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      if (response.ok) {
        const savedPolicy = await response.json();
        set((s) => ({
          insurancePolicies: s.insurancePolicies.map((p) => (p.id === policy.id ? { ...savedPolicy, premium: Number(savedPolicy.premium), coverageAmount: savedPolicy.coverageAmount ? Number(savedPolicy.coverageAmount) : undefined } : p)),
        }));
        toast.success("Policy saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save policy:", errorData);
        toast.error(`Failed to save policy: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          insurancePolicies: s.insurancePolicies.filter((p) => p.id !== policy.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save policy:", error);
      toast.error("Failed to save policy. Check connection.");
      set((s) => ({
        insurancePolicies: s.insurancePolicies.filter((p) => p.id !== policy.id),
      }));
    }
  },
  updateInsurancePolicy: (policy) =>
    set((s) => ({
      insurancePolicies: s.insurancePolicies.map((p) => (p.id === policy.id ? policy : p)),
    })),
  addGoal: async (goal) => {
    set((s) => ({
      goals: [...s.goals, goal],
    }));
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (response.ok) {
        const savedGoal = await response.json();
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goal.id ? { ...savedGoal, targetAmount: Number(savedGoal.targetAmount), currentAmount: Number(savedGoal.currentAmount), dueDate: savedGoal.dueDate ? new Date(savedGoal.dueDate) : undefined } : g)),
        }));
        toast.success("Goal saved successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to save goal:", errorData);
        toast.error(`Failed to save goal: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== goal.id),
        }));
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error("Failed to save goal. Check connection.");
      set((s) => ({
        goals: s.goals.filter((g) => g.id !== goal.id),
      }));
    }
  },
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
  addFriend: async (friend) => {
    set((s) => ({
      friends: [...s.friends, friend],
    }));
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(friend),
      });
      if (response.ok) {
        const savedFriend = await response.json();
        set((s) => ({
          friends: s.friends.map((f) => (f.id === friend.id ? savedFriend : f)),
        }));
        toast.success("Friend added successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to add friend:", errorData);
        toast.error(`Failed to add friend: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          friends: s.friends.filter((f) => f.id !== friend.id),
        }));
      }
    } catch (error) {
      console.error("Failed to add friend:", error);
      toast.error("Failed to add friend. Check connection.");
      set((s) => ({
        friends: s.friends.filter((f) => f.id !== friend.id),
      }));
    }
  },
  addCalendarEvent: async (event) => {
    set((s) => ({
      calendarEvents: [...s.calendarEvents, event],
    }));
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const savedEvent = await response.json();
        set((s) => ({
          calendarEvents: s.calendarEvents.map((e) => (e.id === event.id ? { ...savedEvent, date: new Date(savedEvent.date) } : e)),
        }));
        toast.success("Event added successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to add event:", errorData);
        toast.error(`Failed to add event: ${errorData.error || "Unknown error"}`);
        set((s) => ({
          calendarEvents: s.calendarEvents.filter((e) => e.id !== event.id),
        }));
      }
    } catch (error) {
      console.error("Failed to add event:", error);
      toast.error("Failed to add event. Check connection.");
      set((s) => ({
        calendarEvents: s.calendarEvents.filter((e) => e.id !== event.id),
      }));
    }
  },
  removeCalendarEvent: (id) =>
    set((s) => ({
      calendarEvents: s.calendarEvents.filter((e) => e.id !== id),
    })),
}));
