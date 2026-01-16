import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSakina } from '@/hooks/useSakina';
import type { Mood } from '@/types/sakina';

export default function Dashboard() {
  const { state, actions } = useSakina();

  const simulateStress = () => {
    actions.updateBioStatus({ currentLoad: 120, status: 'overload' });
    actions.triggerNudge({
      message: 'I noticed your stress levels are elevated.',
      type: 'breathing',
      context: 'Your bio-load has increased significantly. Let\'s take a moment to breathe.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Here's your wellness overview for today.</p>
      </div>

      {/* Dev Testing Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">🛠️ Development Testing</CardTitle>
          <CardDescription>Test the nudge system by simulating stress</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={simulateStress} variant="outline">
            Simulate Stress
          </Button>
        </CardContent>
      </Card>

      {/* Active Nudge Card - Shows when stress is triggered */}
      {state.nudge.active && (
        <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                🌬️ Sakina noticed something
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={actions.dismissNudge}>
                Dismiss
              </Button>
            </div>
            <CardDescription>{state.nudge.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{state.nudge.context}</p>
            <Button className="w-full">Start Breathing Exercise</Button>
          </CardContent>
        </Card>
      )}

      {/* Current Mood Card */}
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Quick check-in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['calm', 'okay', 'tired', 'stressed'] as const satisfies readonly Mood[]).map((mood) => (
              <Button
                key={mood}
                variant="outline"
                size="sm"
                onClick={() =>
                  actions.addJournalEntry({
                    type: 'text',
                    content: `Quick mood check: ${mood}`,
                    mood,
                  })
                }
              >
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
          {state.journalHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No journal entries yet. Start by checking in above!</p>
          ) : (
            <div className="space-y-2">
              {state.journalHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="text-sm p-2 rounded-md bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{entry.mood}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
