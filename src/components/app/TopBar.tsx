import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { useSakina } from '@/hooks/useSakina';
import { cn } from '@/lib/utils';
import { SakinaLogo } from '@/components/SakinaLogo';

interface TopBarProps {
  onOpenPanel: () => void;
}

export function TopBar({ onOpenPanel }: TopBarProps) {
  const { state } = useSakina();
  const { bioStatus, nudge } = state;

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <SakinaLogo className="w-8 h-8" />
          <h1 className="text-lg font-semibold">Sakina</h1>
        </div>

        {/* Bio Status Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenPanel}
          className={cn('gap-2', nudge.active && 'animate-pulse')}
          aria-label="Open bio-feedback panel"
        >
          <Activity className={cn('w-4 h-4', nudge.active && 'text-primary')} />
          <span className="text-sm">{bioStatus.currentLoad}</span>
          {nudge.active && <span className="w-2 h-2 rounded-full bg-primary" />}
        </Button>
      </div>
    </header>
  );
}
