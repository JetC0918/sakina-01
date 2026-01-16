import { useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (duration: number) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      onRecordingComplete(duration);
      setDuration(0);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="relative">
        {/* Ripple animation rings */}
        {isRecording && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 rounded-full bg-red-400 opacity-20"
              style={{
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                animationDelay: '0.3s',
              }}
              aria-hidden="true"
            />
          </>
        )}

        {/* Record button */}
        <Button
          type="button"
          size="icon"
          onClick={handleToggleRecording}
          className={cn(
            'relative h-24 w-24 rounded-full transition-all',
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-primary hover:bg-primary/90'
          )}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="h-10 w-10 fill-white" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </Button>
      </div>

      {/* Duration display */}
      <div className="text-center space-y-1">
        <p className="text-2xl font-mono font-semibold text-foreground">
          {formatDuration(duration)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isRecording ? 'Recording...' : 'Tap to start recording'}
        </p>
      </div>

      {/* Mock indicator */}
      <div className="px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
        <p className="text-xs text-amber-700 font-medium">
          🎙️ Voice recording is mocked
        </p>
      </div>
    </div>
  );
}
