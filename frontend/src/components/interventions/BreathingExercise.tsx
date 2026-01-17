import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BreathingExerciseProps {
  params: {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
  onComplete: (durationSeconds: number) => void;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export function BreathingExercise({ params, onComplete }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState(params.inhale);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // We use a ref to track the current phase properties without dependency cycles
  const currentPhaseRef = useRef<Phase>('inhale');

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTotalSeconds((s) => s + 1);

      setSecondsRemainingInPhase((prev) => {
        if (prev > 1) return prev - 1;

        // Phase transition
        let nextPhase: Phase = 'inhale';
        let nextDuration = params.inhale;

        switch (currentPhaseRef.current) {
          case 'inhale':
            nextPhase = params.holdIn > 0 ? 'hold-in' : 'exhale';
            nextDuration = params.holdIn > 0 ? params.holdIn : params.exhale;
            break;
          case 'hold-in':
            nextPhase = 'exhale';
            nextDuration = params.exhale;
            break;
          case 'exhale':
            nextPhase = params.holdOut > 0 ? 'hold-out' : 'inhale';
            nextDuration = params.holdOut > 0 ? params.holdOut : params.inhale;
            break;
          case 'hold-out':
            nextPhase = 'inhale';
            nextDuration = params.inhale;
            break;
        }

        currentPhaseRef.current = nextPhase;
        setPhase(nextPhase);
        return nextDuration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, params]);

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold-in': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold-out': return 'Hold';
    }
  };

  const getScale = () => {
    // Return a CSS transform scale value based on phase
    // This is a rough visual approximation for the CSS transition
    switch (phase) {
      case 'inhale': return 'scale-150';
      case 'hold-in': return 'scale-150';
      case 'exhale': return 'scale-100';
      case 'hold-out': return 'scale-100';
    }
  };

  const getTransitionDuration = () => {
    switch (phase) {
      case 'inhale': return params.inhale * 1000;
      case 'hold-in': return params.holdIn * 1000;
      case 'exhale': return params.exhale * 1000;
      case 'hold-out': return params.holdOut * 1000;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8 min-h-[400px]" role="region" aria-label="Breathing exercise in progress">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated Circles */}
        <div
          className={cn(
            "absolute inset-0 bg-primary/20 rounded-full blur-xl transition-transform ease-in-out",
            getScale()
          )}
          style={{ transitionDuration: `${getTransitionDuration()}ms` }}
        />
        <div
          className={cn(
            "absolute inset-4 bg-primary/30 rounded-full blur-md transition-transform ease-in-out",
            getScale()
          )}
          style={{ transitionDuration: `${getTransitionDuration()}ms` }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32 bg-primary rounded-full shadow-lg">
          <span
            className="text-xl font-bold text-primary-foreground animate-pulse"
            aria-live="polite"
            aria-atomic="true"
          >
            {getInstruction()}
          </span>
          <span className="text-sm font-medium text-primary-foreground/80 mt-1">
            {secondsRemainingInPhase}s
          </span>
        </div>
      </div>

      <div className="text-center space-y-4 max-w-xs">
        <p className="text-muted-foreground text-sm">
          Follow the rhythm. Focus on your breath.
        </p>
        <div className="text-2xl font-mono font-medium text-foreground">
          {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
        </div>
        <Button 
          variant="secondary" 
          onClick={() => {
            setIsActive(false);
            onComplete(totalSeconds);
          }}
          className="w-full"
        >
          End Session
        </Button>
      </div>
    </div>
  );
}
