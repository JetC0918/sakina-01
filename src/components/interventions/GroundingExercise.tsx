import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GroundingExerciseProps {
  onComplete: (durationSeconds: number) => void;
}

const steps = [
  {
    count: 5,
    title: 'Things you see',
    description: 'Look around and name 5 things you can see right now.',
    icon: '👁️',
  },
  {
    count: 4,
    title: 'Things you can touch',
    description: 'Find 4 things you can touch or feel. Notice their texture.',
    icon: '✋',
  },
  {
    count: 3,
    title: 'Things you hear',
    description: 'Listen closely. Name 3 sounds you can hear in the background.',
    icon: '👂',
  },
  {
    count: 2,
    title: 'Things you can smell',
    description: 'Name 2 things you can smell. Or, find a favorite scent.',
    icon: '👃',
  },
  {
    count: 1,
    title: 'Thing you can taste',
    description: 'Name 1 thing you can taste right now, or just take a sip of water.',
    icon: '👅',
  },
];

export function GroundingExercise({ onComplete }: GroundingExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      onComplete(duration);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <div className="flex flex-col h-full min-h-[400px] py-6 px-4">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>5-4-3-2-1 Technique</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 key={currentStep}">
        <div className="text-6xl select-none mb-4">{step.icon}</div>

        <h3 className="text-3xl font-bold text-primary" style={{ WebkitTextStroke: '1px black' }}>
          Find {step.count} {step.title}
        </h3>

        <p className="text-lg text-muted-foreground max-w-md">
          {step.description}
        </p>

        <div className="pt-8 w-full max-w-xs">
          <Button onClick={handleNext} size="lg" className="w-full text-lg h-12">
            {currentStep === steps.length - 1 ? (
              <>
                Complete <Check className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
