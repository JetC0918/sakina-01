import { Wind, Anchor, Clock, PauseCircle, LucideIcon } from 'lucide-react';

export interface InterventionDef {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  type: 'breathing' | 'grounding' | 'pause';
  icon: LucideIcon;
  params?: any;
}

export const interventions: InterventionDef[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A powerful technique to regain control and calm the nervous system.',
    durationLabel: '1 min',
    type: 'breathing',
    icon: Wind,
    params: {
      inhale: 4,
      holdIn: 4,
      exhale: 4,
      holdOut: 4,
    },
  },
  {
    id: '4-7-8-breathing',
    title: '4-7-8 Relaxing Breath',
    description: 'Natural tranquilizer for the nervous system to reduce anxiety.',
    durationLabel: '2 min',
    type: 'breathing',
    icon: PauseCircle,
    params: {
      inhale: 4,
      holdIn: 7,
      exhale: 8,
      holdOut: 0,
    },
  },
  {
    id: '5-4-3-2-1-grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to bring yourself back to the present moment.',
    durationLabel: '3-5 min',
    type: 'grounding',
    icon: Anchor,
  },
  {
    id: '1-minute-pause',
    title: '1-Minute Pause',
    description: 'A simple pause to reset and center yourself.',
    durationLabel: '1 min',
    type: 'pause',
    icon: Clock,
  },
];
