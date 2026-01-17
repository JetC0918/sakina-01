import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { SakinaProvider, SakinaContext } from './SakinaContext';
import { useContext } from 'react';
import type { Theme, Language, Mood } from '@/types/sakina';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper hook to access context
const useTestContext = () => {
  const context = useContext(SakinaContext);
  if (!context) throw new Error('Context not available');
  return context;
};

describe('SakinaContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should provide initial state with default values', () => {
      const TestComponent = () => {
        const { state } = useTestContext();
        return (
          <div>
            <span data-testid="theme">{state.preferences.theme}</span>
            <span data-testid="language">{state.preferences.language}</span>
            <span data-testid="bio-load">{state.bioStatus.currentLoad}</span>
          </div>
        );
      };

      render(
        <SakinaProvider>
          <TestComponent />
        </SakinaProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('light');
      expect(screen.getByTestId('language').textContent).toBe('en');
      expect(screen.getByTestId('bio-load').textContent).toBe('35');
    });
  });

  describe('Theme Management', () => {
    it('should update theme preference', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.setTheme('dark' as Theme);
      });

      expect(result.current.state.preferences.theme).toBe('dark');
    });

    it('should persist theme to localStorage', async () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.setTheme('light' as Theme);
      });

      await waitFor(() => {
        const stored = localStorageMock.getItem('sakina-store');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.preferences.theme).toBe('light');
      });
    });
  });

  describe('Language Management', () => {
    it('should update language preference', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.setLanguage('ar' as Language);
      });

      expect(result.current.state.preferences.language).toBe('ar');
    });

    it('should set html lang and dir attributes', async () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.setLanguage('ar' as Language);
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('lang')).toBe('ar');
        expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      });
    });
  });

  describe('Journal Management', () => {
    it('should add journal entry with generated ID and timestamp', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      const entry = {
        type: 'text' as const,
        content: 'Test journal entry',
        mood: 'calm' as Mood,
      };

      act(() => {
        result.current.actions.addJournalEntry(entry);
      });

      expect(result.current.state.journalHistory).toHaveLength(1);
      expect(result.current.state.journalHistory[0]).toMatchObject({
        type: 'text',
        content: 'Test journal entry',
        mood: 'calm',
      });
      expect(result.current.state.journalHistory[0].id).toBeTruthy();
      expect(result.current.state.journalHistory[0].timestamp).toBeTruthy();
    });

    it('should prepend new entries (newest first)', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.addJournalEntry({
          type: 'text',
          content: 'First entry',
          mood: 'calm',
        });
      });

      act(() => {
        result.current.actions.addJournalEntry({
          type: 'text',
          content: 'Second entry',
          mood: 'stressed',
        });
      });

      expect(result.current.state.journalHistory[0].content).toBe('Second entry');
      expect(result.current.state.journalHistory[1].content).toBe('First entry');
    });
  });

  describe('Bio Status Management', () => {
    it('should update bio status', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.updateBioStatus({
          currentLoad: 78,
          status: 'high',
        });
      });

      expect(result.current.state.bioStatus.currentLoad).toBe(78);
      expect(result.current.state.bioStatus.status).toBe('high');
    });

    it('should update lastUpdated timestamp when bio status changes', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      const beforeTime = new Date().toISOString();

      act(() => {
        result.current.actions.updateBioStatus({
          currentLoad: 90,
        });
      });

      const afterTime = new Date().toISOString();
      const updatedTime = result.current.state.bioStatus.lastUpdated;

      expect(updatedTime >= beforeTime).toBe(true);
      expect(updatedTime <= afterTime).toBe(true);
    });
  });

  describe('Nudge Management', () => {
    it('should trigger nudge', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.triggerNudge({
          message: 'Take a break',
          type: 'breathing',
          context: 'High stress detected',
        });
      });

      expect(result.current.state.nudge.active).toBe(true);
      expect(result.current.state.nudge.message).toBe('Take a break');
      expect(result.current.state.nudge.type).toBe('breathing');
    });

    it('should dismiss nudge and reset bio status', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      // First trigger a nudge with high bio load
      act(() => {
        result.current.actions.updateBioStatus({
          currentLoad: 85,
          status: 'overload',
        });
        result.current.actions.triggerNudge({
          message: 'Test nudge',
          type: 'breathing',
        });
      });

      expect(result.current.state.nudge.active).toBe(true);

      // Then dismiss it
      act(() => {
        result.current.actions.dismissNudge();
      });

      expect(result.current.state.nudge.active).toBe(false);
      expect(result.current.state.bioStatus.currentLoad).toBe(35);
      expect(result.current.state.bioStatus.status).toBe('optimal');
    });
  });

  describe('Intervention Logging', () => {
    it('should log intervention with generated ID and timestamp', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      const intervention = {
        type: 'breathing' as const,
        subType: 'box-breathing',
        duration: 300,
      };

      act(() => {
        result.current.actions.logIntervention(intervention);
      });

      expect(result.current.state.interventionHistory).toHaveLength(1);
      expect(result.current.state.interventionHistory![0]).toMatchObject({
        type: 'breathing',
        subType: 'box-breathing',
        duration: 300,
      });
      expect(result.current.state.interventionHistory![0].id).toBeTruthy();
      expect(result.current.state.interventionHistory![0].timestamp).toBeTruthy();
    });
  });

  describe('Notification Preferences', () => {
    it('should update notification preferences', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.updateNotificationPreferences({
          nudges: false,
          dailyReminder: true,
        });
      });

      expect(result.current.state.preferences.notifications.nudges).toBe(false);
      expect(result.current.state.preferences.notifications.dailyReminder).toBe(true);
    });

    it('should partially update notification preferences', () => {
      const { result } = renderHook(() => useTestContext(), {
        wrapper: SakinaProvider,
      });

      act(() => {
        result.current.actions.updateNotificationPreferences({
          nudges: false,
        });
      });

      expect(result.current.state.preferences.notifications.nudges).toBe(false);
      expect(result.current.state.preferences.notifications.dailyReminder).toBe(false);
    });
  });
});
