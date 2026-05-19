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
