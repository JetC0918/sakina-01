import { useState } from 'react';
import { Mood } from '@/types/sakina';
import { MoodSelector } from './MoodSelector';
import { VoiceRecorder } from './VoiceRecorder';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface JournalFormProps {
  onSubmit: (data: { type: 'text' | 'voice'; content: string; mood?: Mood }) => void;
  onCancel: () => void;
}

export function JournalForm({ onSubmit, onCancel }: JournalFormProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined);
  const [textContent, setTextContent] = useState('');
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validation - only content is required, mood is optional
    if (activeTab === 'text') {
      if (!textContent.trim()) {
        setError('Please write something about how you feel');
        return;
      }
      onSubmit({
        type: 'text',
        content: textContent.trim(),
        mood: selectedMood,  // Can be undefined
      });
    } else {
      if (voiceDuration === 0) {
        setError('Please record a voice note');
        return;
      }
      onSubmit({
        type: 'voice',
        content: `${voiceDuration}s`, // Store duration as content for voice entries
        mood: selectedMood,  // Can be undefined
      });
    }
  };

  const handleRecordingComplete = (duration: number) => {
    setVoiceDuration(duration);
    setError(null);
  };

  const handleMoodChange = (mood: Mood) => {
    setSelectedMood(mood);
    setError(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    setError(null);
  };

  const isSubmitDisabled =
    (activeTab === 'text' && !textContent.trim()) ||
    (activeTab === 'voice' && voiceDuration === 0);

  return (
    <div className="flex flex-col h-full py-4 space-y-6">
      {/* Mood Selector - Optional */}
      <div className="space-y-2">
        <MoodSelector value={selectedMood} onChange={handleMoodChange} />
        <p className="text-xs text-muted-foreground text-center">
          Optional — AI will detect your mood if not selected
        </p>
      </div>

      {/* Input Mode Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'voice')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Write</TabsTrigger>
          <TabsTrigger value="voice">Voice Note</TabsTrigger>
        </TabsList>

        {/* Text Input */}
        <TabsContent value="text" className="space-y-2 mt-4">
          <Label htmlFor="journal-text">What's on your mind?</Label>
          <Textarea
            id="journal-text"
            placeholder="Express your thoughts and feelings..."
            value={textContent}
            onChange={handleTextChange}
            className="min-h-[200px] resize-none"
          />
        </TabsContent>

        {/* Voice Input */}
        <TabsContent value="voice" className="mt-4">
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex-1"
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
}
