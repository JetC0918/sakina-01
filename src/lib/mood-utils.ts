import { Mood } from '@/types/sakina';

/**
 * Mood configuration mapping for UI styling
 * Maps each mood type to its corresponding colors and labels
 */
export const MOOD_CONFIG: Record<
  Mood,
  {
    label: string;
    color: string;    // Text color
    bg: string;       // Background color
    border: string;   // Border color
  }
> = {
  stressed: {
    label: 'Stressed',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-200',
  },
  anxious: {
    label: 'Anxious',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
  },
  tired: {
    label: 'Tired',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
  },
  okay: {
    label: 'Okay',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
  },
  calm: {
    label: 'Calm',
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-200',
  },
  energized: {
    label: 'Energized',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
  },
};

/**
 * Get all available mood values
 */
export const ALL_MOODS = Object.keys(MOOD_CONFIG) as Mood[];
