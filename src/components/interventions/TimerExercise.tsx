import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TimerExerciseProps {
  durationSeconds: number; // e.g. 60 for 1 minute
  onComplete: (durationSeconds: number) => void;
}

export function TimerExercise({ durationSeconds = 60, onComplete }: TimerExerciseProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(true);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setTotalElapsed((t) => t + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto complete when time runs out
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 py-8">
      <div className="relative flex items-center justify-center">
        {/* Progress Ring could go here, but using linear progress for simplicity + consistency */}
        <div className="text-6xl font-mono font-bold tracking-wider text-foreground">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-64 space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-xs text-muted-foreground">
          {isActive ? 'Focus on being present' : 'Paused'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {timeLeft > 0 ? (
          <>
             <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleTimer}
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onComplete(totalElapsed)}
            >
              Done Early
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            className="w-full min-w-[200px]"
            onClick={() => onComplete(totalElapsed)}
          >
            Finish Session
          </Button>
        )}
      </div>
    </div>
  );
}
