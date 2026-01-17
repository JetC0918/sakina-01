import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InterventionDef } from '@/data/interventions';
import { Play } from 'lucide-react';
import { cardInteractionProps } from '@/lib/animation-utils';

interface InterventionCardProps {
  intervention: InterventionDef;
  onClick: () => void;
}

export function InterventionCard({ intervention, onClick }: InterventionCardProps) {
  const Icon = intervention.icon;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      {...cardInteractionProps}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Start ${intervention.title} exercise, ${intervention.durationLabel}`}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="w-24 h-24" />
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {intervention.durationLabel}
            </span>
          </div>
          <CardTitle className="text-lg">{intervention.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription className="line-clamp-2 mb-4">
            {intervention.description}
          </CardDescription>

          <Button
            variant="outline"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Start
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
