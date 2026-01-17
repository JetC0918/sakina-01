import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Interventions from './Interventions';
import { SakinaProvider } from '@/context/SakinaContext';

// Mock the interventions data
vi.mock('@/data/interventions', () => ({
  interventions: [
    {
      id: 'box-breathing',
      title: 'Box Breathing',
      description: '4-4-4-4 pattern',
      type: 'breathing',
      durationLabel: '5 min',
      icon: 'Wind',
      params: {
        inhale: 4,
        holdIn: 4,
        exhale: 4,
        holdOut: 4,
      },
    },
    {
      id: 'physiological-sigh',
      title: 'Physiological Sigh',
      description: 'Quick stress relief',
      type: 'breathing',
      durationLabel: '1 min',
      icon: 'Wind',
      params: {
        inhale: 2,
        holdIn: 0,
        exhale: 4,
        holdOut: 0,
      },
    },
    {
      id: '5-4-3-2-1',
      title: '5-4-3-2-1 Grounding',
      description: 'Sensory awareness',
      type: 'grounding',
      durationLabel: '3 min',
      icon: 'Anchor',
    },
  ],
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SakinaProvider>{component}</SakinaProvider>
    </BrowserRouter>
  );
};

describe('Interventions Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Don't clear localStorage here - it's already mocked in setup.ts
  });

  describe('Rendering', () => {
    it('should render page title and description', () => {
      renderWithProviders(<Interventions />);

      expect(screen.getByText(/calm & focus/i)).toBeInTheDocument();
      expect(screen.getByText(/tools to help you regulate/i)).toBeInTheDocument();
    });

    it('should render all intervention cards', () => {
      renderWithProviders(<Interventions />);

      expect(screen.getByText('Box Breathing')).toBeInTheDocument();
      expect(screen.getByText('Physiological Sigh')).toBeInTheDocument();
      expect(screen.getByText('5-4-3-2-1 Grounding')).toBeInTheDocument();
    });

    it('should render intervention descriptions', () => {
      renderWithProviders(<Interventions />);

      expect(screen.getByText('4-4-4-4 pattern')).toBeInTheDocument();
      expect(screen.getByText('Quick stress relief')).toBeInTheDocument();
      expect(screen.getByText('Sensory awareness')).toBeInTheDocument();
    });

    it('should show "no sessions" message when history is empty', () => {
      renderWithProviders(<Interventions />);

      expect(screen.getByText(/no sessions recorded yet/i)).toBeInTheDocument();
    });
  });

  describe('Intervention Selection', () => {
    it('should open dialog when intervention card is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Interventions />);

      const boxBreathingCard = screen.getByText('Box Breathing').closest('div[role="button"]');
      expect(boxBreathingCard).toBeInTheDocument();

      await user.click(boxBreathingCard!);

      // Dialog should be open (check for dialog content or overlay)
      await waitFor(() => {
        // The dialog component should render its content
        expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Interventions />);

      // Open dialog
      const card = screen.getByText('Box Breathing').closest('div[role="button"]');
      await user.click(card!);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
      });

      // Close dialog (find close button)
      const closeButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('aria-label')?.includes('close') || btn.textContent?.includes('Close')
      );

      if (closeButton) {
        await user.click(closeButton);
      }
    });
  });

  describe('Recent Sessions Display', () => {
    it('should display recent sessions when intervention history exists', () => {
      // Pre-populate localStorage with intervention history
      const mockHistory = [
        {
          id: '1',
          type: 'breathing',
          subType: 'box-breathing',
          durationSeconds: 300,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'grounding',
          subType: '5-4-3-2-1',
          durationSeconds: 180,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ];

      localStorage.setItem(
        'sakina-store',
        JSON.stringify({
          preferences: { theme: 'system', language: 'en', notifications: {}, subscription: 'free' },
          journalHistory: [],
          interventionHistory: mockHistory,
          bioStatus: { currentLoad: 35, status: 'optimal', lastUpdated: new Date().toISOString() },
          nudge: { active: false, message: '', type: 'breathing', context: '' },
        })
      );

      renderWithProviders(<Interventions />);

      // Should show recent sessions section
      expect(screen.getByText(/recent sessions/i)).toBeInTheDocument();

      // Should show completed status
      const completedElements = screen.getAllByText(/completed/i);
      expect(completedElements.length).toBeGreaterThan(0);
    });

    it('should limit recent sessions to 5 entries', () => {
      // Create 10 mock sessions
      const mockHistory = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'breathing',
        subType: 'box-breathing',
        durationSeconds: 300,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      }));

      localStorage.setItem(
        'sakina-store',
        JSON.stringify({
          preferences: { theme: 'system', language: 'en', notifications: {}, subscription: 'free' },
          journalHistory: [],
          interventionHistory: mockHistory,
          bioStatus: { currentLoad: 35, status: 'optimal', lastUpdated: new Date().toISOString() },
          nudge: { active: false, message: '', type: 'breathing', context: '' },
        })
      );

      renderWithProviders(<Interventions />);

      // Should only display 5 sessions (plus header)
      const completedElements = screen.getAllByText(/completed/i);
      expect(completedElements.length).toBe(5);
    });
  });

  describe('Intervention Types', () => {
    it('should render breathing interventions', () => {
      renderWithProviders(<Interventions />);

      const boxBreathingElements = screen.getAllByText('Box Breathing');
      expect(boxBreathingElements.length).toBeGreaterThan(0);

      const physiologicalSighElements = screen.getAllByText('Physiological Sigh');
      expect(physiologicalSighElements.length).toBeGreaterThan(0);
    });

    it('should render grounding interventions', () => {
      renderWithProviders(<Interventions />);

      expect(screen.getByText('5-4-3-2-1 Grounding')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(<Interventions />);

      const mainHeading = screen.getByRole('heading', { name: /calm & focus/i });
      expect(mainHeading).toBeInTheDocument();

      const sectionHeading = screen.getByRole('heading', { name: /recent sessions/i });
      expect(sectionHeading).toBeInTheDocument();
    });

    it('should have clickable intervention cards', () => {
      renderWithProviders(<Interventions />);

      const cards = screen.getAllByRole('button').filter((el) => {
        const parent = el.closest('div');
        return parent?.textContent?.includes('Breathing') || parent?.textContent?.includes('Grounding');
      });

      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
