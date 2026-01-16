import React, { createContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SakinaStore, Theme, JournalEntry, BioDataPoint, NudgeState, Mood } from '@/types/sakina';

// Context type definition
interface SakinaContextType {
  state: SakinaStore;
  actions: {
    setTheme: (theme: Theme) => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
    updateBioStatus: (status: Partial<BioDataPoint>) => void;
    triggerNudge: (nudge: Partial<NudgeState>) => void;
    dismissNudge: () => void;
  };
}

// Initial state
const initialState: SakinaStore = {
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: {
      nudges: true,
      dailyReminder: false,
    },
  },
  journalHistory: [],
  bioStatus: {
    currentLoad: 35,
    status: 'optimal',
    lastUpdated: new Date().toISOString(),
  },
  nudge: {
    active: false,
    message: '',
    type: 'breathing',
    context: '',
  },
};

// Create context
export const SakinaContext = createContext<SakinaContextType | undefined>(undefined);

// Provider component
export function SakinaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<SakinaStore>('sakina-store', initialState);

  // Actions
  const setTheme = useCallback(
    (theme: Theme) => {
      setState((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme,
        },
      }));
    },
    [setState]
  );

  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        journalHistory: [newEntry, ...prev.journalHistory],
      }));
    },
    [setState]
  );

  const updateBioStatus = useCallback(
    (status: Partial<BioDataPoint>) => {
      setState((prev) => ({
        ...prev,
        bioStatus: {
          ...prev.bioStatus,
          ...status,
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    [setState]
  );

  const triggerNudge = useCallback(
    (nudge: Partial<NudgeState>) => {
      setState((prev) => ({
        ...prev,
        nudge: {
          ...prev.nudge,
          ...nudge,
          active: true,
        },
      }));
    },
    [setState]
  );

  const dismissNudge = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nudge: {
        ...prev.nudge,
        active: false,
      },
      bioStatus: {
        ...prev.bioStatus,
        currentLoad: 35,
        status: 'optimal',
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [setState]);

  const contextValue: SakinaContextType = {
    state,
    actions: {
      setTheme,
      addJournalEntry,
      updateBioStatus,
      triggerNudge,
      dismissNudge,
    },
  };

  return <SakinaContext.Provider value={contextValue}>{children}</SakinaContext.Provider>;
}
