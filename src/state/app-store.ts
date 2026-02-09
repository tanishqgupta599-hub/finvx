import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  updateAsset: (asset: Asset) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  addLoan: (loan: Loan) => Promise<void>;
  updateLoan: (loan: Loan) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
  addLiability: (liability: Liability) => Promise<void>;
  updateLiability: (liability: Liability) => Promise<void>;
  removeLiability: (id: string) => Promise<void>;
  addExpense: (transaction: Transaction, paymentSource: { type: 'asset' | 'creditCard', id: string }) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  addSubscription: (subscription: Subscription) => Promise<void>;
  updateSubscription: (subscription: Subscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  addCreditCard: (card: CreditCard) => Promise<void>;
  updateCreditCard: (card: CreditCard) => Promise<void>;
  removeCreditCard: (id: string) => Promise<void>;
  addInsurancePolicy: (policy: InsurancePolicy) => Promise<void>;
  updateInsurancePolicy: (policy: InsurancePolicy) => Promise<void>;
  removeInsurancePolicy: (id: string) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  setActions: (actions: ActionItem[]) => void;
  toggleActionStep: (actionId: string, stepId: string) => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
  addEmergencyContact: (contact: EmergencyContact) => Promise<void>;
  removeEmergencyContact: (id: string) => Promise<void>;
  updateNotificationPreferences: (prefs: NotificationPreferences) => Promise<void>;
  addVaultDocument: (doc: VaultDocument) => Promise<void>;
  removeVaultDocument: (id: string) => Promise<void>;
  addFeedback: (feedback: Feedback) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  updateTaxProfile: (profile: TaxProfile) => Promise<void>;
  addTaxLot: (lot: TaxLot) => Promise<void>;
  setTaxActionPlan: (plan: TaxActionPlan) => Promise<void>;
  toggleTaxActionStep: (stepId: string) => Promise<void>;
  addCircle: (circle: ExpenseCircle) => Promise<void>;
  updateCircle: (circle: ExpenseCircle) => Promise<void>;
  addSharedExpense: (circleId: string, expense: SharedExpense) => Promise<void>;
  addFriend: (friend: Friend) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  addCalendarEvent: (event: CalendarEvent) => Promise<void>;
  removeCalendarEvent: (id: string) => Promise<void>;
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
  syncUser: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      profile: demoProfile(),
      profileMode: "Balanced",
      overwhelmMode: false,
      demoDataEnabled: false, // Default to false for production
      isLoading: false,
      featureFlags: defaultFeatureFlags,
      onboardingCompleted: true, // Default to true to skip onboarding
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
              taxActionPlan: data.taxActionPlan, // Load tax action plan
              demoDataEnabled: !!data.isDemo, 
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

  updateProfile: async (profileUpdates) => {
    // Optimistic update
    set((s) => ({
      profile: s.profile ? { ...s.profile, ...profileUpdates } : undefined,
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileUpdates),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        set((s) => ({
          profile: { ...s.profile, ...updatedProfile },
        }));
        toast.success("Profile updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update profile in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating profile", error);
      toast.warning("Network error, updated locally.");
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
      profile: undefined,
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

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save asset to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving asset, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateAsset: async (asset) => {
    set((s) => ({
      assets: s.assets.map((a) => (a.id === asset.id ? asset : a)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
      if (response.ok) {
        const savedAsset = await response.json();
        set((s) => ({
          assets: s.assets.map((a) => (a.id === asset.id ? { ...savedAsset, value: Number(savedAsset.value) } : a)),
        }));
        toast.success("Asset updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update asset in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating asset", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeAsset: async (id) => {
    set((s) => ({
      assets: s.assets.filter((a) => a.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Asset removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete asset from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting asset", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addLoan: async (loan) => {
    set((s) => ({
      loans: [...s.loans, loan],
    }));
    
    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save loan to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
        // Do not rollback - keep local copy
      }
    } catch (error) {
       console.warn("Network error saving loan, keeping local copy", error);
       toast.warning("Network error, saved locally.");
       // Do not rollback - keep local copy
    }
  },
  updateLoan: async (loan) => {
    set((s) => ({
      loans: s.loans.map((l) => (l.id === loan.id ? loan : l)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loan),
      });
      if (response.ok) {
        const savedLoan = await response.json();
        set((s) => ({
           loans: s.loans.map((l) => (l.id === loan.id ? { ...savedLoan, principal: Number(savedLoan.principal), balance: Number(savedLoan.balance), apr: Number(savedLoan.apr), monthlyPayment: Number(savedLoan.monthlyPayment) } : l)),
        }));
        toast.success("Loan updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update loan in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating loan", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeLoan: async (id) => {
    set((s) => ({
      loans: s.loans.filter((l) => l.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Loan removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete loan from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting loan", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addLiability: async (liability) => {
    set((s) => ({
      liabilities: [...s.liabilities, liability],
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save liability to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving liability, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateLiability: async (liability) => {
    set((s) => ({
      liabilities: s.liabilities.map((l) => (l.id === liability.id ? liability : l)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/liabilities/${liability.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liability),
      });
      if (response.ok) {
        const savedLiability = await response.json();
        set((s) => ({
          liabilities: s.liabilities.map((l) => (l.id === liability.id ? { ...savedLiability, balance: Number(savedLiability.balance), apr: savedLiability.apr ? Number(savedLiability.apr) : undefined } : l)),
        }));
        toast.success("Liability updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update liability in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating liability", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeLiability: async (id) => {
    set((s) => ({
      liabilities: s.liabilities.filter((l) => l.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Liability removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete liability from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting liability", error);
      toast.warning("Network error, deleted locally.");
    }
  },
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

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save transaction to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving transaction, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  addSubscription: async (subscription) => {
    set((s) => ({
      subscriptions: [...s.subscriptions, subscription],
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save subscription to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving subscription, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateSubscription: async (subscription) => {
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? subscription : sub)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (response.ok) {
        const savedSub = await response.json();
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) => (sub.id === subscription.id ? { ...savedSub, amount: Number(savedSub.amount), nextChargeDate: new Date(savedSub.nextChargeDate) } : sub)),
        }));
        toast.success("Subscription updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update subscription in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating subscription", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeSubscription: async (id) => {
    set((s) => ({
      subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Subscription removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete subscription from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting subscription", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addCreditCard: async (card) => {
    set((s) => ({
      creditCards: [...s.creditCards, card],
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save card to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving card, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateCreditCard: async (card) => {
    set((s) => ({
      creditCards: s.creditCards.map((c) => (c.id === card.id ? card : c)),
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/credit-cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      if (response.ok) {
        const savedCard = await response.json();
        set((s) => ({
          creditCards: s.creditCards.map((c) => (c.id === card.id ? { ...savedCard, limit: Number(savedCard.limit), balance: Number(savedCard.balance), apr: Number(savedCard.apr) } : c)),
        }));
        toast.success("Card updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update card in backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating card, keeping local copy", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeCreditCard: async (id) => {
    set((s) => ({
      creditCards: s.creditCards.filter((c) => c.id !== id),
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/credit-cards/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Card deleted successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete card from backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting card, keeping local copy", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addInsurancePolicy: async (policy) => {
    set((s) => ({
      insurancePolicies: [...s.insurancePolicies, policy],
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save policy to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving policy, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateInsurancePolicy: async (policy) => {
    set((s) => ({
      insurancePolicies: s.insurancePolicies.map((p) => (p.id === policy.id ? policy : p)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/insurance/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      if (response.ok) {
        const savedPolicy = await response.json();
        set((s) => ({
          insurancePolicies: s.insurancePolicies.map((p) => (p.id === policy.id ? { ...savedPolicy, premium: Number(savedPolicy.premium), coverageAmount: savedPolicy.coverageAmount ? Number(savedPolicy.coverageAmount) : undefined } : p)),
        }));
        toast.success("Policy updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update policy in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating policy", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeInsurancePolicy: async (id) => {
    set((s) => ({
      insurancePolicies: s.insurancePolicies.filter((p) => p.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/insurance/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Policy removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete policy from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting policy", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addGoal: async (goal) => {
    set((s) => ({
      goals: [...s.goals, goal],
    }));

    // Check if we are in demo mode explicitly
    if (get().demoDataEnabled) return;

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
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save goal to backend, keeping local copy (Demo Mode fallback)", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving goal, keeping local copy", error);
      toast.warning("Network error, saved locally.");
    }
  },
  updateGoal: async (goal) => {
    set((s) => ({
      goals: s.goals.map((g) => (g.id === goal.id ? goal : g)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (response.ok) {
        const savedGoal = await response.json();
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goal.id ? { ...savedGoal, targetAmount: Number(savedGoal.targetAmount), currentAmount: Number(savedGoal.currentAmount), dueDate: savedGoal.dueDate ? new Date(savedGoal.dueDate) : undefined } : g)),
        }));
        toast.success("Goal updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update goal in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating goal", error);
      toast.warning("Network error, updated locally.");
    }
  },
  removeGoal: async (id) => {
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Goal removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete goal from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting goal", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  setActions: (actions) =>
    set(() => ({
      actions,
    })),
  toggleActionStep: async (actionId, stepId) => {
    // Optimistic update
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
    });

    if (get().demoDataEnabled) return;

    try {
      const state = get();
      const action = state.actions.find((a) => a.id === actionId);
      const step = action?.steps.find((s) => s.id === stepId);

      if (!step) return;

      const response = await fetch(`/api/action-steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: step.done }),
      });

      if (!response.ok) {
        throw new Error("Failed to update action step");
      }
      // No need to toast for every checkbox click usually, unless error
    } catch (error) {
      console.error("Failed to update action step:", error);
      toast.error("Failed to save progress");
      // Revert optimistic update
      set((s) => {
        const updated = s.actions.map((action) => {
          if (action.id !== actionId) return action;
          const updatedSteps = action.steps.map((step) =>
            step.id === stepId ? { ...step, done: !step.done } : step
          );
          // Recalculate status for revert
          const allDone = updatedSteps.every((step) => step.done);
          const status: ActionItem["status"] =
            allDone ? "done" : updatedSteps.some((step) => step.done) ? "in_progress" : "new";
          return { ...action, steps: updatedSteps, status };
        });
        return { actions: updated };
      });
    }
  },
  markOnboardingCompleted: async () => {
    set(() => ({ onboardingCompleted: true }));
    if (get().demoDataEnabled) return;
    try {
      await fetch("/api/user/onboarding", { method: "POST" });
    } catch (error) {
      console.warn("Failed to sync onboarding status", error);
    }
  },
  addEmergencyContact: async (contact) => {
    set((s) => ({
      emergencyContacts: [...s.emergencyContacts, contact],
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (response.ok) {
        const savedContact = await response.json();
        set((s) => ({
          emergencyContacts: s.emergencyContacts.map((c) => (c.id === contact.id ? savedContact : c)),
        }));
        toast.success("Contact saved successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save contact to backend", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving contact", error);
      toast.warning("Network error, saved locally.");
    }
  },
  removeEmergencyContact: async (id) => {
    set((s) => ({
      emergencyContacts: s.emergencyContacts.filter((c) => c.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/emergency-contacts/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Contact removed successfully");
      } else {
        console.warn("Failed to delete contact from backend");
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting contact", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  updateNotificationPreferences: async (prefs) => {
    set(() => ({
      notificationPreferences: prefs,
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (response.ok) {
        toast.success("Preferences updated");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update preferences in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating preferences", error);
      toast.warning("Network error, updated locally.");
    }
  },
  addVaultDocument: async (doc) => {
    set((s) => ({
      vaultDocuments: [...s.vaultDocuments, doc],
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (response.ok) {
        const savedDoc = await response.json();
        set((s) => ({
          vaultDocuments: s.vaultDocuments.map((d) => (d.id === doc.id ? savedDoc : d)),
        }));
        toast.success("Document saved successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save document to backend", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving document", error);
      toast.warning("Network error, saved locally.");
    }
  },
  removeVaultDocument: async (id) => {
    set((s) => ({
      vaultDocuments: s.vaultDocuments.filter((d) => d.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/vault/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Document removed successfully");
      } else {
        console.warn("Failed to delete document from backend");
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting document", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  addFeedback: async (feedback) => {
    set((s) => ({
      feedback: [...s.feedback, feedback],
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });
      if (response.ok) {
        toast.success("Feedback submitted successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to submit feedback to backend", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error submitting feedback", error);
      toast.warning("Network error, saved locally.");
    }
  },
  deleteTransaction: async (id) => {
    // Optimistic update
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
    });

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Transaction deleted successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete transaction from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
        // Consider rollback logic here if critical
      }
    } catch (error) {
      console.warn("Network error deleting transaction", error);
      toast.warning("Network error, deleted locally.");
    }
  },
  updateTransaction: async (transaction) => {
    // Optimistic update
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
    });

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (response.ok) {
        const savedTxn = await response.json();
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === transaction.id ? { ...savedTxn, amount: Number(savedTxn.amount), date: new Date(savedTxn.date) } : t)),
        }));
        toast.success("Transaction updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update transaction in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating transaction", error);
      toast.warning("Network error, updated locally.");
    }
  },
  updateTaxProfile: async (profile) => {
    set(() => ({ taxProfile: profile }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/tax/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Tax profile updated");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update tax profile in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating tax profile", error);
      toast.warning("Network error, updated locally.");
    }
  },
  addTaxLot: async (lot) => {
    set((s) => ({ taxLots: [...s.taxLots, lot] }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/tax/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lot),
      });
      if (response.ok) {
        const savedLot = await response.json();
        set((s) => ({
          taxLots: s.taxLots.map((l) => (l.id === lot.id ? savedLot : l)),
        }));
        toast.success("Tax lot added successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to add tax lot to backend", errorData);
        toast.warning("Backend unavailable, added locally.");
      }
    } catch (error) {
      console.warn("Network error adding tax lot", error);
      toast.warning("Network error, added locally.");
    }
  },
  setTaxActionPlan: async (plan: TaxActionPlan) => {
    set((s) => ({
      taxActionPlan: plan,
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/tax/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        const savedPlan = await response.json();
        // Update with server response (e.g. real IDs)
        set((s) => ({
            taxActionPlan: savedPlan
        }));
        toast.success("Tax plan saved successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to save tax plan to backend", errorData);
        toast.warning("Backend unavailable, saved locally.");
      }
    } catch (error) {
      console.warn("Network error saving tax plan", error);
      toast.warning("Network error, saved locally.");
    }
  },
  toggleTaxActionStep: async (stepId) => {
    set((s) => {
      if (!s.taxActionPlan) return {};
      const updatedSteps = s.taxActionPlan.steps.map((step) =>
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
      );
      return {
        taxActionPlan: { ...s.taxActionPlan, steps: updatedSteps },
      };
    });

    if (get().demoDataEnabled) return;

    try {
      const state = get();
      const step = state.taxActionPlan?.steps.find((s) => s.id === stepId);
      if (!step) return;

      const response = await fetch(`/api/tax/action-plan/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: step.isCompleted }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update tax action step in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating tax action step", error);
      toast.warning("Network error, updated locally.");
    }
  },
  addCircle: async (circle) => {
    set((s) => ({
      circles: [circle, ...s.circles],
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(circle),
      });
      if (response.ok) {
        const savedCircle = await response.json();
        set((s) => ({
          circles: s.circles.map((c) => (c.id === circle.id ? savedCircle : c)),
        }));
        toast.success("Circle created successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to create circle in backend", errorData);
        toast.warning("Backend unavailable, created locally.");
      }
    } catch (error) {
      console.warn("Network error creating circle", error);
      toast.warning("Network error, created locally.");
    }
  },
  updateCircle: async (circle) => {
    set((s) => ({
      circles: s.circles.map((c) => (c.id === circle.id ? circle : c)),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/circles/${circle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(circle),
      });
      if (response.ok) {
        const savedCircle = await response.json();
        set((s) => ({
          circles: s.circles.map((c) => (c.id === circle.id ? savedCircle : c)),
        }));
        toast.success("Circle updated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to update circle in backend", errorData);
        toast.warning("Backend unavailable, updated locally.");
      }
    } catch (error) {
      console.warn("Network error updating circle", error);
      toast.warning("Network error, updated locally.");
    }
  },
  addSharedExpense: async (circleId, expense) => {
    set((s) => ({
      circles: s.circles.map((c) => {
        if (c.id !== circleId) return c;
        return { ...c, expenses: [expense, ...c.expenses] };
      }),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/circles/${circleId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      if (response.ok) {
        const savedExpense = await response.json();
        set((s) => ({
          circles: s.circles.map((c) => {
            if (c.id !== circleId) return c;
            return { 
                ...c, 
                expenses: c.expenses.map(e => e.id === expense.id ? savedExpense : e)
            };
          }),
        }));
        toast.success("Expense added successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to add expense to backend", errorData);
        toast.warning("Backend unavailable, added locally.");
      }
    } catch (error) {
      console.warn("Network error adding expense", error);
      toast.warning("Network error, added locally.");
    }
  },
  addFriend: async (friend) => {
    set((s) => ({
      friends: [...s.friends, friend],
    }));

    if (get().demoDataEnabled) return;

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
  removeFriend: async (id) => {
    set((s) => ({
      friends: s.friends.filter((f) => f.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/friends/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Friend removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to remove friend from backend", errorData);
        toast.warning("Backend unavailable, removed locally.");
      }
    } catch (error) {
      console.warn("Network error removing friend", error);
      toast.warning("Network error, removed locally.");
    }
  },
  addCalendarEvent: async (event) => {
    set((s) => ({
      calendarEvents: [...s.calendarEvents, event],
    }));

    if (get().demoDataEnabled) return;

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
  removeCalendarEvent: async (id) => {
    set((s) => ({
      calendarEvents: s.calendarEvents.filter((e) => e.id !== id),
    }));

    if (get().demoDataEnabled) return;

    try {
      const response = await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Event removed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Failed to delete event from backend", errorData);
        toast.warning("Backend unavailable, deleted locally.");
      }
    } catch (error) {
      console.warn("Network error deleting event", error);
      toast.warning("Network error, deleted locally.");
    }
  },
}), {
  name: 'finverse-app-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ 
    profile: state.profile,
    profileMode: state.profileMode,
    overwhelmMode: state.overwhelmMode,
    demoDataEnabled: state.demoDataEnabled,
    featureFlags: state.featureFlags,
    onboardingCompleted: state.onboardingCompleted,
    assets: state.assets,
    loans: state.loans,
    liabilities: state.liabilities,
    transactions: state.transactions,
    subscriptions: state.subscriptions,
    creditCards: state.creditCards,
    insurancePolicies: state.insurancePolicies,
    goals: state.goals,
    scamChecks: state.scamChecks,
    autopsyReports: state.autopsyReports,
    actions: state.actions,
    emergencyContacts: state.emergencyContacts,
    vaultDocuments: state.vaultDocuments,
    notificationPreferences: state.notificationPreferences,
    feedback: state.feedback,
    taxProfile: state.taxProfile,
    taxLots: state.taxLots,
    taxActionPlan: state.taxActionPlan,
    circles: state.circles,
    friends: state.friends,
    calendarEvents: state.calendarEvents,
  }),
  version: 2, // Bump version to invalidate old caches (Fixes data leak on user switch)
  migrate: (persistedState: any, version: number) => {
    if (version < 2) {
      // Return empty state for older versions
      return {} as AppState & AppActions;
    }
    return persistedState as AppState & AppActions;
  },
}));
