import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { InterventionDef } from '@/data/interventions';
import { BreathingExercise } from './BreathingExercise';
import { GroundingExercise } from './GroundingExercise';
import { TimerExercise } from './TimerExercise';
import { useSakina } from '@/hooks/useSakina';

interface InterventionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  intervention: InterventionDef | null;
}

export function InterventionDialog({ isOpen, onClose, intervention }: InterventionDialogProps) {
  const isMobile = useIsMobile();
  const { actions } = useSakina();
  const [completed, setCompleted] = useState(false);

  const handleComplete = (duration: number) => {
    if (intervention) {
      actions.logIntervention({
        type: intervention.type,
        subType: intervention.id,
        durationSeconds: duration,
        completed: true,
      });
    }
    setCompleted(true);
    // Slight delay before closing to show completion state if we had one, 
    // but for now we just close or let user close.
    // Actually, let's close it after a brief success feedback or just close.
    onClose(); 
  };

  if (!intervention) return null;

  const renderContent = () => {
    switch (intervention.type) {
      case 'breathing':
        return (
          <BreathingExercise 
            params={intervention.params} 
            onComplete={handleComplete} 
          />
        );
      case 'grounding':
        return (
          <GroundingExercise onComplete={handleComplete} />
        );
      case 'pause':
        return (
          <TimerExercise 
            durationSeconds={60} 
            onComplete={handleComplete} 
          />
        );
      default:
        return <div>Unknown intervention type</div>;
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="min-h-[85vh] px-4">
          <DrawerHeader className="text-center">
            <DrawerTitle>{intervention.title}</DrawerTitle>
          </DrawerHeader>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{intervention.title}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
