import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useSakina } from '@/hooks/useSakina';
import { Mood } from '@/types/sakina';
import { MOOD_CONFIG, ALL_MOODS } from '@/lib/mood-utils';
import { JournalForm } from '@/components/app/journal/JournalForm';
import { JournalList } from '@/components/app/journal/JournalList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function Journal() {
  const { state, actions } = useSakina();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [filterMood, setFilterMood] = useState<Mood | 'all'>('all');

  const handleSubmit = (data: { type: 'text' | 'voice'; content: string; mood: Mood }) => {
    actions.addJournalEntry(data);
    setSheetOpen(false);
    toast({
      title: 'Entry saved',
      description: 'Your journal has been updated.',
    });
  };

  // Calculate weekly count (memoized for performance)
  const weeklyCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return state.journalHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekAgo;
    }).length;
  }, [state.journalHistory]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-24 md:pb-0 max-w-4xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Journal</h1>
        <p className="text-muted-foreground">
          {weeklyCount > 0
            ? `You've logged ${weeklyCount} ${weeklyCount === 1 ? 'entry' : 'entries'} this week`
            : 'Express yourself through voice or text'}
        </p>
      </div>

      {/* Mood Filter */}
      <div className="mb-6">
        <Select
          value={filterMood}
          onValueChange={(value) => setFilterMood(value as Mood | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {ALL_MOODS.map((mood) => (
              <SelectItem key={mood} value={mood}>
                {MOOD_CONFIG[mood].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List Area - Flex-1 to fill remaining space */}
      <div className="flex-1 min-h-0">
        <JournalList history={state.journalHistory} filterMood={filterMood} />
      </div>

      {/* FAB - Fixed Bottom Right (adjusted for mobile nav) */}
      <Button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-50 md:bottom-8 md:right-8"
        size="icon"
        aria-label="Create new journal entry"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Sheet Modal */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl sm:max-w-md sm:mx-auto"
        >
          <SheetHeader>
            <SheetTitle>New Entry</SheetTitle>
            <SheetDescription>
              How are you feeling right now?
            </SheetDescription>
          </SheetHeader>
          <JournalForm onSubmit={handleSubmit} onCancel={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
