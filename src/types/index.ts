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

export type FinanceEventType = 'income' | 'expense' | 'subscription' | 'shopping';

export interface FinanceEvent {
  id: string;
  type: FinanceEventType;
  category?: 'loan' | string;
  name: string;
  amount?: number;
  dateType: 'dayOfMonth' | 'dayOfWeek' | 'specificDates';
  dateValue: number[]; // days of month 1-31, days of week 0-6, or timestamps for specificDates
  recurring: boolean;
  userId: string | 'family';
  createdAt: Timestamp | Date | string;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
}

export interface FinanceHistory {
  id: string;
  eventId?: string;
  type: FinanceEventType;
  amount: number;
  date: Timestamp | Date | string;
  userId: string;
  note?: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  wishlistItemId?: string;
  userId: string;
  isArchived: boolean;
  createdAt: Timestamp | Date | string;
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
