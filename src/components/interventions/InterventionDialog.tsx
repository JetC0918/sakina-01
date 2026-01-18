import React, { useState, useEffect } from 'react';
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

  // Countdown state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen && intervention) {
      setIsCountingDown(true);
      setCountdownValue(5);
      setCompleted(false);
    }
  }, [isOpen, intervention]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isCountingDown && countdownValue > 0) {
      timer = setTimeout(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && isCountingDown && countdownValue === 0) {
      setIsCountingDown(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isCountingDown, countdownValue]);

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

  const renderCountdown = () => {
    let instructions = "";
    switch (intervention.type) {
      case 'breathing':
        instructions = "Find a comfortable position and focus on your breath.";
        break;
      case 'grounding':
        instructions = "Look around you and prepare to engage your senses.";
        break;
      case 'pause':
        instructions = "Take a moment to pause and reset.";
        break;
      default:
        instructions = "Get ready to begin.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-xl font-medium text-center max-w-xs">{instructions}</div>
        <div className="relative flex items-center justify-center">
          {/* Countdown Circle */}
          <div className="w-40 h-40 rounded-full border-4 border-primary flex items-center justify-center bg-background shadow-xl">
            <div
              className="text-8xl font-bold text-foreground animate-pulse pb-2"
            >
              {countdownValue}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Starting in...</p>
      </div>
    );
  };

  const renderContent = () => {
    if (isCountingDown) {
      return renderCountdown();
    }

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
