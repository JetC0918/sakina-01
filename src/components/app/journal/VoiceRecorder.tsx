import { useEffect } from 'react';
import { Mic, Square, RotateCcw, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface VoiceRecorderProps {
  onRecordingComplete: (data: { duration: number; audioBlob: Blob; audioUrl: string }) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  // Effect to clean up URL when component unmounts is handled in the hook

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleReset = () => {
    clearRecording();
  };

  // When recording stops and we have data, notify parent
  useEffect(() => {
    if (!isRecording && audioBlob && audioUrl && duration > 0) {
      onRecordingComplete({ duration, audioBlob, audioUrl });
    }
  }, [isRecording, audioBlob, audioUrl, duration, onRecordingComplete]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="w-full px-4 py-2 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Recording State or Playback State */}
      {!audioUrl ? (
        <div className="relative">
          {/* Ripple animation rings - only when recording */}
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
              'relative h-24 w-24 rounded-full transition-all shadow-lg',
              isRecording
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : 'bg-primary hover:bg-primary/90'
            )}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="h-10 w-10 fill-white text-white" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </Button>
        </div>
      ) : (
        /* Playback View */
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="w-full p-4 bg-muted/40 rounded-xl border border-border">
            <audio src={audioUrl} controls className="w-full h-10" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Record Again
          </Button>
        </div>
      )}

      {/* Duration display - only show when recording or waiting to start */}
      {!audioUrl && (
        <div className="text-center space-y-1">
          <p className={cn(
            "text-3xl font-mono font-semibold transition-colors",
            isRecording ? "text-red-500" : "text-foreground"
          )}>
            {formatDuration(duration)}
          </p>
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Listening...' : 'Tap to start recording'}
          </p>
        </div>
      )}
    </div>
  );
}
