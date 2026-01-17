import React, { useState } from 'react';
import { useSakina } from '@/hooks/useSakina';
import { interventions, InterventionDef } from '@/data/interventions';
import { InterventionCard } from '@/components/interventions/InterventionCard';
import { InterventionDialog } from '@/components/interventions/InterventionDialog';
import { PageTransition } from '@/components/ui/PageTransition';
import { useLocation } from 'react-router-dom';

export default function Interventions() {
  const { state } = useSakina();
  const location = useLocation();
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionDef | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelect = (intervention: InterventionDef) => {
    setSelectedIntervention(intervention);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageTransition>
        <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Calm & Focus</h1>
        <p className="text-muted-foreground">
          Tools to help you regulate, ground, and center yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interventions.map((intervention) => (
          <InterventionCard
            key={intervention.id}
            intervention={intervention}
            onClick={() => handleSelect(intervention)}
          />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {(state.interventionHistory?.length ?? 0) === 0 ? (
          <div className="p-8 border rounded-lg bg-muted/20 text-center text-muted-foreground">
            No sessions recorded yet. Try one of the exercises above.
          </div>
        ) : (
          <div className="space-y-2">
            {(state.interventionHistory ?? []).slice(0, 5).map((log) => {
              const def = interventions.find(i => i.id === log.subType) || interventions[0];
              return (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-secondary">
                      {/* Need to handle dynamic icon import or just generic */}
                      {/* Simplified for now */}
                      <div className="w-4 h-4 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium">{def.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleDateString()} • {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Completed
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        </div>
      </PageTransition>

      <InterventionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        intervention={selectedIntervention}
      />
    </>
  );
}