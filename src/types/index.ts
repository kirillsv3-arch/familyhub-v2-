import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  birthDate?: string;
  familyId: string | null;
  partnerId: string | null;
  fcmToken?: string | null;
  caloriesGoal: number;
  proteinsGoal: number;
  fatsGoal: number;
  carbsGoal: number;
  goalType: 'maintenance' | 'cutting' | 'bulking';
  createdAt: Timestamp | Date | string;
}

export interface Tamagotchi {
  satiety: number;
  love: number;
  energy: number;
  xp: number;
  level: number;
  lastChecked: Timestamp | Date | string;
  items: string[];
}

export interface Family {
  id: string;
  code: string; // 6 characters
  memberIds: string[];
  createdAt: Timestamp | Date | string;
  coins: number;
  tamagotchi: Tamagotchi;
}

export interface Habit {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // ISO dates
}

export interface UserHabits {
  uid: string;
  habits: Habit[];
}

export type StoreType = 'ПЛАН' | 'Лента' | 'Магнит' | 'Самокат' | 'Лавка' | 'Аптека' | 'Другое' | 'Маркетплейсы';

export const STORES: StoreType[] = [
  'ПЛАН',
  'Лента',
  'Магнит',
  'Самокат',
  'Лавка',
  'Аптека',
  'Другое',
  'Маркетплейсы'
];

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  store: StoreType;
  isMarketplace: boolean;
  link?: string;
  isBought: boolean;
  price?: number;
  addedBy: string;
  createdAt: Timestamp | Date | string;
  boughtAt?: Timestamp | Date | string;
  archived?: boolean;
}

export interface PriceHistory {
  id: string;
  name: string;
  store: StoreType;
  price: number;
  date: Timestamp | Date | string;
  userId: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Timestamp | Date | string;
  userId: string;
  type: 'expense' | 'income';
}

/**
 * FIRESTORE PATHS:
 * Events: families/{familyId}/finance/data/events
 * PiggyBanks: families/{familyId}/finance/data/savings
 * History: families/{familyId}/finance/data/history
 */

export type FinanceEventType = 'income' | 'expense' | 'subscription' | 'purchase';

export interface FinanceEvent {
  id: string;
  type: FinanceEventType;
  title: string;
  amount: number; // For 'purchase', this might be 0 until completed
  dateType: 'dayOfMonth' | 'dayOfWeek';
  dateValue: number; // 1-31 for dayOfMonth, 0-6 for dayOfWeek
  repeatMonthly: boolean;
  isCompleted: boolean; // For purchase and one-time events
  completedAmount?: number;
  notificationSent: boolean;
  active: boolean; // Primarily for subscriptions
  userId: string;
  createdAt: Timestamp | Date | string;
}

export interface PiggyBankContribution {
  amount: number;
  date: Timestamp | Date | string;
  userId: string;
}

export interface PiggyBank {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  contributions: PiggyBankContribution[];
  wishlistItemId?: string;
  userId: string;
  createdAt: Timestamp | Date | string;
}

export interface FinanceHistory {
  id: string;
  eventId: string; // Reference to the template in 'events'
  amount: number;
  date: Timestamp | Date | string;
  userId: string;
}

export type WishlistPriority = 'idea' | 'someday' | 'want' | 'urgent';

export interface WishlistItem {
  id: string;
  name: string;
  link?: string;
  price?: number;
  priority: WishlistPriority;
  ownerId: string;
  createdAt: Timestamp | Date | string;
}

// Default values as per requirements
export const DEFAULT_USER_GOALS = {
  caloriesGoal: 2000,
  proteinsGoal: 150,
  fatsGoal: 70,
  carbsGoal: 250,
  goalType: 'maintenance' as const,
};

export const INITIAL_TAMAGOTCHI: Omit<Tamagotchi, 'lastChecked'> = {
  satiety: 100,
  love: 50,
  energy: 100,
  xp: 0,
  level: 1,
  items: [],
};
