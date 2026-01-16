import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Play } from 'lucide-react';
import { JournalEntry } from '@/types/sakina';
import { MOOD_CONFIG } from '@/lib/mood-utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JournalCardProps {
  entry: JournalEntry;
}

export function JournalCard({ entry }: JournalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const moodConfig = MOOD_CONFIG[entry.mood];

  const relativeTime = formatDistanceToNow(new Date(entry.timestamp), {
    addSuffix: true,
  });

  const shouldShowReadMore = entry.type === 'text' && entry.content.length > 150;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge
            className={cn(
              'capitalize',
              moodConfig.bg,
              moodConfig.color,
              'border',
              moodConfig.border
            )}
            variant="outline"
          >
            {moodConfig.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{relativeTime}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {entry.type === 'text' ? (
          <>
            <p
              className={cn(
                'text-sm text-muted-foreground whitespace-pre-wrap',
                !isExpanded && shouldShowReadMore && 'line-clamp-3'
              )}
            >
              {entry.content}
            </p>
            {shouldShowReadMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-0 text-primary hover:text-primary/80"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
              aria-label="Play voice note"
            >
              <Play className="h-4 w-4 fill-current" />
            </Button>
            <div className="flex-1 space-y-1">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-primary rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground">
                Voice note ({entry.content})
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
