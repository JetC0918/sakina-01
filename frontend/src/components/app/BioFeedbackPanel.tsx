import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSakina } from '@/hooks/useSakina';
import { InterventionDialog } from '@/components/interventions/InterventionDialog';
import { interventions } from '@/data/interventions';
import { Activity, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InterventionDef } from '@/data/interventions';

export function BioFeedbackPanel() {
  const { state, actions } = useSakina();
  const { bioStatus, nudge } = state;
  const [selectedIntervention, setSelectedIntervention] = React.useState<InterventionDef | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getStatusColor = () => {
    switch (bioStatus.status) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'optimal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'overload':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (bioStatus.status) {
      case 'low':
        return 'Low Activity';
      case 'optimal':
        return 'Optimal';
      case 'high':
        return 'Elevated';
      case 'overload':
        return 'Stressed';
      default:
        return 'Unknown';
    }
  };

  const handleStartExercise = () => {
    // Default to Box Breathing if type matches or is generic
    // If grounding, pick grounding
    let intervention = interventions[0]; // Box Breathing default
    
    if (nudge.type === 'grounding') {
      const found = interventions.find(i => i.type === 'grounding');
      if (found) intervention = found;
    }
    
    setSelectedIntervention(intervention);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // If they were doing a nudge, dismiss it on close (or maybe we should only dismiss on complete? 
    // The previous code dismissed on complete. 
    // But InterventionDialog handles logging. 
    // We should probably dismiss the nudge if the dialog closes, assuming they did something or ignored it?
    // Actually, let's keep it simple: if the dialog closes, we presume they are done with the interaction.)
    if (nudge.active) {
       actions.dismissNudge();
    }
  };

  return (
    <>
      <InterventionDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        intervention={selectedIntervention}
      />

      <div className="flex flex-col gap-4 h-full">
        {/* Bio Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold">{bioStatus.currentLoad}</div>
                <div className={cn('inline-block px-2 py-1 rounded-md text-xs font-medium', getStatusColor())}>
                  {getStatusLabel()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(bioStatus.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nudge Card - Only shown when active */}
        {nudge.active && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-semibold">{nudge.type === 'breathing' ? '🌬️ Take a Breath' : nudge.type === 'grounding' ? '🌳 Ground Yourself' : '💭 Reflect'}</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={actions.dismissNudge} aria-label="Dismiss nudge">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription className="text-xs">{nudge.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{nudge.context}</p>
              <Button size="sm" className="w-full" onClick={handleStartExercise}>
                Start Exercise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Session Goal Placeholder */}
        {!nudge.active && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Today's Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Stay mindful and balanced throughout your day.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
