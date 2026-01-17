import React, { createContext, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SakinaStore, Theme, Language, JournalEntry, BioDataPoint, NudgeState, Mood, InterventionLog } from '@/types/sakina';

// Context type definition
interface SakinaContextType {
  state: SakinaStore;
  actions: {
    setTheme: (theme: Theme) => void;
    setLanguage: (language: Language) => void;
    updateNotificationPreferences: (prefs: Partial<SakinaStore['preferences']['notifications']>) => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
    logIntervention: (entry: Omit<InterventionLog, 'id' | 'timestamp'>) => void;
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
    subscription: 'free',
  },
  journalHistory: [],
  interventionHistory: [],
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

  const setLanguage = useCallback(
    (language: Language) => {
      setState((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          language,
        },
      }));
    },
    [setState]
  );

  const updateNotificationPreferences = useCallback(
    (prefs: Partial<SakinaStore['preferences']['notifications']>) => {
      setState((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            ...prefs,
          },
        },
      }));
    },
    [setState]
  );

  const logIntervention = useCallback(
    (entry: Omit<InterventionLog, 'id' | 'timestamp'>) => {
      const newEntry: InterventionLog = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        interventionHistory: [newEntry, ...(prev.interventionHistory || [])],
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

  // Side Effects: Sync theme and language to DOM
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = state.preferences;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Initial application
      applyTheme(mediaQuery.matches);

      // Listen for OS theme changes
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [state.preferences.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const { language } = state.preferences;

    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [state.preferences.language]);

  const contextValue: SakinaContextType = {
    state,
    actions: {
      setTheme,
      setLanguage,
      updateNotificationPreferences,
      addJournalEntry,
      logIntervention,
      updateBioStatus,
      triggerNudge,
      dismissNudge,
    },
  };

  return <SakinaContext.Provider value={contextValue}>{children}</SakinaContext.Provider>;
}
