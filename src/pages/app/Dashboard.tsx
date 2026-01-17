import { useState, useEffect, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Removed direct import: import { InterventionDialog } from '@/components/interventions/InterventionDialog';
import { interventions, InterventionDef } from '@/data/interventions';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  useDashboardData,
  useCreateJournalEntry,
  useLogIntervention,
  useApiHealth
} from '@/hooks/useApi';
import type { Mood } from '@/types/sakina';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Brain, Flame, TrendingUp, Wind } from 'lucide-react';

const InterventionDialog = lazy(() =>
  import('@/components/interventions/InterventionDialog').then(m => ({ default: m.InterventionDialog }))
);

export default function Dashboard() {
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionDef | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // API hooks
  const { entries, nudge, stats, streak, isLoading, isError, refetch } = useDashboardData();
  const createEntry = useCreateJournalEntry();
  const logInterventionMutation = useLogIntervention();
  const { data: apiHealthy } = useApiHealth();

  // Show nudge toast when nudge is detected
  useEffect(() => {
    if (nudge?.should_nudge && nudge.priority === 'high') {
      toast({
        title: '🌿 Sakina noticed something',
        description: nudge.message,
      });
    }
  }, [nudge]);

  const handleStartExercise = (nudgeType?: string) => {
    let intervention = interventions[0]; // Box Breathing default

    if (nudgeType === 'grounding' || nudge?.nudge_type === 'grounding') {
      const found = interventions.find(i => i.type === 'grounding');
      if (found) intervention = found;
    }

    setSelectedIntervention(intervention);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = async (completed: boolean = false, durationSeconds: number = 0) => {
    // Log intervention if completed
    if (completed && selectedIntervention) {
      await logInterventionMutation.mutateAsync({
        intervention_type: selectedIntervention.type as 'breathing' | 'grounding' | 'pause',
        subtype: selectedIntervention.id,
        trigger_reason: nudge?.context || 'User initiated',
        duration_seconds: durationSeconds,
        completed: true,
      });
      toast({
        title: 'Great job! 🎉',
        description: 'Your wellness exercise has been logged.',
      });
    }
    setIsDialogOpen(false);
    setSelectedIntervention(null);
  };

  const handleQuickMood = async (mood: Mood) => {
    await createEntry.mutateAsync({
      content: `Quick mood check: ${mood}`,
      mood,
      type: 'text',
    });
  };

  return (
    <>
      <InterventionDialog
        isOpen={isDialogOpen}
        onClose={() => handleCloseDialog(false)}
        intervention={selectedIntervention}
      />

      <PageTransition>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Here's your wellness overview for today.</p>
          </div>

          {/* API Status Indicator */}
          {apiHealthy === false && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="pt-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ Backend API is not available. Some features may not work.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Nudge Card - Shows when AI detects stress */}
          {nudge?.should_nudge && (
            <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    Sakina noticed something
                  </CardTitle>
                  <span className={`text-xs px-2 py-1 rounded ${nudge.priority === 'high' ? 'bg-red-100 text-red-700' :
                    nudge.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                    {nudge.priority} priority
                  </span>
                </div>
                <CardDescription>{nudge.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{nudge.context}</p>
                <Button className="w-full" onClick={() => handleStartExercise(nudge.nudge_type)}>
                  Start {nudge.nudge_type === 'breathing' ? 'Breathing' :
                    nudge.nudge_type === 'grounding' ? 'Grounding' : 'Reflection'} Exercise
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  Streak
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{streak?.current_streak || 0} days</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.entry_count || 0}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Avg Stress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className={`text-2xl font-bold ${(stats?.avg_stress_score || 0) > 70 ? 'text-red-500' :
                    (stats?.avg_stress_score || 0) > 40 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                    {stats?.avg_stress_score?.toFixed(0) || '--'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Calm Time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.total_calm_minutes || 0}m</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Mood Card */}
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling?</CardTitle>
              <CardDescription>Quick check-in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(['calm', 'okay', 'tired', 'stressed', 'anxious', 'energized'] as const).map((mood) => (
                  <Button
                    key={mood}
                    variant="outline"
                    size="sm"
                    disabled={createEntry.isPending}
                    onClick={() => handleQuickMood(mood)}
                    className="capitalize"
                  >
                    {mood === 'calm' && '😌 '}
                    {mood === 'okay' && '🙂 '}
                    {mood === 'tired' && '😴 '}
                    {mood === 'stressed' && '😰 '}
                    {mood === 'anxious' && '😟 '}
                    {mood === 'energized' && '⚡ '}
                    {mood}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Journal Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your latest reflections</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-destructive mb-2">Failed to load entries</p>
                  <Button variant="outline" size="sm" onClick={refetch}>
                    Retry
                  </Button>
                </div>
              ) : entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No journal entries yet. Start by checking in above!
                </p>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="text-sm p-3 rounded-md bg-muted">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize flex items-center gap-1">
                          {entry.mood}
                          {entry.stress_score !== null && entry.stress_score !== undefined && (
                            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${entry.stress_score > 70 ? 'bg-red-100 text-red-600' :
                              entry.stress_score > 40 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                              {entry.stress_score}
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                      {entry.supportive_message && (
                        <p className="text-xs text-primary mt-2 italic">
                          "{entry.supportive_message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Take a moment for yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {interventions.slice(0, 4).map((intervention) => (
                  <Button
                    key={intervention.id}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => {
                      setSelectedIntervention(intervention);
                      setIsDialogOpen(true);
                    }}
                  >
                    <intervention.icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{intervention.title}</div>
                      <div className="text-xs text-muted-foreground">{intervention.durationLabel}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </>
  );
}
