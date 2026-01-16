import { Mood } from '@/types/sakina';
import { MOOD_CONFIG, ALL_MOODS } from '@/lib/mood-utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  value: Mood | undefined;
  onChange: (mood: Mood) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">How are you feeling?</label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue as Mood);
        }}
        className="flex flex-wrap gap-2 justify-start"
      >
        {ALL_MOODS.map((mood) => (
          <ToggleGroupItem
            key={mood}
            value={mood}
            aria-label={MOOD_CONFIG[mood].label}
            className={cn(
              'rounded-full px-4 py-2 transition-all border-2',
              value === mood
                ? `${MOOD_CONFIG[mood].bg} ${MOOD_CONFIG[mood].color} ${MOOD_CONFIG[mood].border}`
                : 'border-gray-300 text-gray-600 hover:bg-gray-50 data-[state=on]:bg-gray-50'
            )}
          >
            {MOOD_CONFIG[mood].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
