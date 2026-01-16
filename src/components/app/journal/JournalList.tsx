import { JournalEntry, Mood } from '@/types/sakina';
import { JournalCard } from './JournalCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';

interface JournalListProps {
  history: JournalEntry[];
  filterMood?: Mood | 'all';
}

export function JournalList({ history, filterMood = 'all' }: JournalListProps) {
  const filteredHistory =
    filterMood === 'all'
      ? history
      : history.filter((entry) => entry.mood === filterMood);

  if (filteredHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {filterMood === 'all' ? 'No entries yet' : 'No matching entries'}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {filterMood === 'all'
            ? 'Start your first journal entry today!'
            : `You haven't logged any ${filterMood} moods yet.`}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <ul className="space-y-4 pr-4" role="list">
        {filteredHistory.map((entry) => (
          <li key={entry.id}>
            <JournalCard entry={entry} />
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
