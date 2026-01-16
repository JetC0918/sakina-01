import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute session

    useEffect(() => {
        if (!isOpen) return;

        // Cycle phases: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
        // Box breathing technique: 4-4-4-4
        // Simplified for this animation: Inhale 4s, Exhale 4s (8s cycle) to match the CSS animation

        // We'll use a simple 8s cycle to match the CSS animation
        // 0-4s: Inhale
        // 4-8s: Exhale

        const cycleInterval = setInterval(() => {
            setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
        }, 4000);

        const timerInterval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerInterval);
                    clearInterval(cycleInterval);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            clearInterval(cycleInterval);
            clearInterval(timerInterval);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-md p-6 mx-auto bg-card rounded-xl shadow-2xl border border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>

                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                    <h2 className="text-2xl font-bold text-center">Take a Moment</h2>

                    <div className="relative flex items-center justify-center w-64 h-64">
                        {/* Animated Circles */}
                        <div className={cn(
                            "absolute inset-0 bg-primary/20 rounded-full blur-xl",
                            "animate-breathe"
                        )} />
                        <div className={cn(
                            "absolute inset-4 bg-primary/30 rounded-full blur-md",
                            "animate-breathe delay-75"
                        )} />
                        <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32 bg-primary rounded-full shadow-lg animate-text-breathe">
                            <span className="text-3xl font-bold text-primary-foreground">
                                {phase === 'inhale' ? 'Inhale' : 'Exhale'}
                            </span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground">Follow the rhythm of the circle.</p>
                        {timeLeft === 0 ? (
                            <Button onClick={onClose} className="mt-4 w-full">Complete Session</Button>
                        ) : (
                            <p className="text-sm font-medium text-muted-foreground/60">{timeLeft}s remaining</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
