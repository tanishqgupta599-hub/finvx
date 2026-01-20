export type FeatureFlags = {
  home: boolean;
  profile: boolean;
  netWorth: boolean;
  debt: boolean;
  spending: boolean;
  expenses: boolean;
  cards: boolean;
  goals: boolean;
  safety: boolean;
  scam: boolean;
  reports: boolean;
  oracle: boolean;
  tax: boolean;
  circles: boolean;
  subscriptions: boolean;
  calendar: boolean;
  investments: boolean;
  settings: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
  home: true,
  profile: true,
  netWorth: true,
  debt: true,
  spending: true,
  expenses: true,
  cards: true,
  goals: true,
  safety: true,
  scam: true,
  reports: true,
  oracle: true,
  tax: true,
  circles: true,
  subscriptions: true,
  calendar: true,
  investments: true,
  settings: true,
};

