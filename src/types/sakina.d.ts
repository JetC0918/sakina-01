// Core type definitions for Sakina wellness dashboard

export type Mood = 'stressed' | 'anxious' | 'tired' | 'okay' | 'calm' | 'energized';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications: {
    nudges: boolean;
    dailyReminder: boolean;
  };
  subscription: 'free' | 'premium';
}

export interface JournalEntry {
  id: string;
  type: 'text' | 'voice';
  content: string;
  mood: Mood;
  timestamp: string; // ISO String
}

export interface BioDataPoint {
  currentLoad: number; // 0-100
  status: 'low' | 'optimal' | 'high' | 'overload';
  lastUpdated: string;
}

export interface NudgeState {
  active: boolean;
  message: string;
  type: 'breathing' | 'grounding' | 'reflection';
  context: string; // e.g. "You've been typing fast"
}

export interface InterventionLog {
  id: string;
  type: 'breathing' | 'grounding' | 'pause';
  subType?: string; // e.g. 'box-breathing', '4-7-8'
  timestamp: string; // ISO String
  durationSeconds: number;
  completed: boolean;
}

export interface SakinaStore {
  preferences: UserPreferences;
  journalHistory: JournalEntry[];
  interventionHistory: InterventionLog[];
  bioStatus: BioDataPoint;
  nudge: NudgeState;
}
