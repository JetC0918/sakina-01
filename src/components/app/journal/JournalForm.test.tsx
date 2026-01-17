import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalForm } from './JournalForm';

describe('JournalForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with text tab as default', () => {
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /write/i })).toHaveAttribute('data-state', 'active');
      expect(screen.getByPlaceholderText(/express your thoughts/i)).toBeInTheDocument();
    });

    it('should render mood selector', () => {
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Mood selector should be present
      expect(screen.getByText(/how are you feeling/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to voice tab when clicked', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const voiceTab = screen.getByRole('tab', { name: /voice note/i });
      await user.click(voiceTab);

      expect(voiceTab).toHaveAttribute('data-state', 'active');
    });

    it('should show text input in text tab', () => {
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/what's on your mind/i)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should disable submit button when no mood selected', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      await user.type(textarea, 'Test journal entry');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when no text content', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Select a mood first
      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when text is empty', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Select a mood
      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when both mood and text are provided', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Select mood
      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      // Type text
      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      await user.type(textarea, 'Feeling peaceful today');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should enable submit button when mood is selected and text provided', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Type text first (button still disabled - no mood)
      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      await user.type(textarea, 'Test');
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).toBeDisabled();

      // Select mood (button should now be enabled)
      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Text Entry Submission', () => {
    it('should submit valid text entry', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Select mood (using correct capitalized label)
      const stressedButton = screen.getByRole('radio', { name: 'Stressed' });
      await user.click(stressedButton);

      // Type content
      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      const testContent = 'Had a tough day at work';
      await user.type(textarea, testContent);

      // Submit
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'text',
        content: testContent,
        mood: 'stressed',
      });
    });

    it('should trim whitespace from text content', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      await user.type(textarea, '  Content with spaces  ');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'text',
        content: 'Content with spaces',
        mood: 'calm',
      });
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Clearing', () => {
    it('should enable submit button when user types after selecting mood', async () => {
      const user = userEvent.setup();
      render(<JournalForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Select mood first
      const calmButton = screen.getByRole('radio', { name: 'Calm' });
      await user.click(calmButton);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      expect(submitButton).toBeDisabled(); // Still disabled - no text

      // Start typing
      const textarea = screen.getByPlaceholderText(/express your thoughts/i);
      await user.type(textarea, 'T');

      // Button should now be enabled
      expect(submitButton).not.toBeDisabled();
    });
  });
});
