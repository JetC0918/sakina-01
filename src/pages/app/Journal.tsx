import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Mood } from '@/types/sakina';
import { MOOD_CONFIG, ALL_MOODS } from '@/lib/mood-utils';
import { JournalForm } from '@/components/app/journal/JournalForm';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/PageTransition';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useJournalEntries, useCreateJournalEntry, useInsightsStats } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

export default function Journal() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [filterMood, setFilterMood] = useState<Mood | 'all'>('all');

  // API hooks
  const { data: entries, isLoading, isError, refetch } = useJournalEntries(
    filterMood === 'all' ? undefined : filterMood
  );

  // Use stats endpoint for accurate weekly count (server-side calculation)
  const { data: stats } = useInsightsStats(7);

  const createEntry = useCreateJournalEntry();

  const handleSubmit = async (data: { type: 'text' | 'voice'; content: string; mood?: Mood }) => {
    await createEntry.mutateAsync({
      content: data.content,
      mood: data.mood,  // Can be undefined - AI will detect
      type: data.type,
    });
    setSheetOpen(false);
  };

  // Use count from stats API, or fallback to 0
  const weeklyCount = stats?.entry_count || 0;

  return (
    <PageTransition>
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

        {/* Mood Filter & New Entry Button */}
        <div className="flex items-center justify-between mb-6">
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

          <Button
            onClick={() => setSheetOpen(true)}
            className="gap-2"
            aria-label="Create new journal entry"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {/* Journal Entries List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          {isLoading ? (
            // Loading skeletons
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : isError ? (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Failed to load journal entries.</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : entries?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No journal entries yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by creating your first entry!
                </p>
              </CardContent>
            </Card>
          ) : (
            entries?.map((entry) => (
              <Card key={entry.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize flex items-center gap-2">
                      {entry.mood ? (
                        <>
                          {MOOD_CONFIG[entry.mood as Mood]?.emoji || '📝'}
                          {entry.mood}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">
                          🔄 Analyzing mood...
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{entry.content}</p>

                  {/* AI Analysis Results */}
                  {entry.analyzed_at && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-primary">AI Analysis</span>
                        {entry.stress_score !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${entry.stress_score > 70 ? 'bg-red-100 text-red-700' :
                            entry.stress_score > 40 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            Stress: {entry.stress_score}
                          </span>
                        )}
                      </div>
                      {entry.emotional_tone && (
                        <p className="text-xs text-muted-foreground mb-1">
                          <strong>Tone:</strong> {entry.emotional_tone}
                        </p>
                      )}
                      {entry.key_themes && entry.key_themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {entry.key_themes.map((theme, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.supportive_message && (
                        <p className="text-sm text-foreground/80 italic">
                          "{entry.supportive_message}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Loading indicator for pending analysis */}
                  {!entry.analyzed_at && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      AI analysis in progress...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
            <JournalForm
              onSubmit={handleSubmit}
              onCancel={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </PageTransition>
  );
}
