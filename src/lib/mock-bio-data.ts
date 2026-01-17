// Mock bio-load data generator with realistic physiological patterns

import { InterventionLog } from '@/types/sakina';

export interface BioTrendPoint {
  timestamp: string; // ISO String
  bioLoad: number; // 0-100
  intervention?: {
    type: string;
    duration: number;
  };
}

/**
 * Generates realistic bio-load trends with circadian rhythm, stress spikes, and intervention effects
 * @param days - Number of days to generate (7 or 30)
 * @returns Array of bio-load data points with hourly granularity
 */
export function generateBioTrends(days: number): BioTrendPoint[] {
  const dataPoints: BioTrendPoint[] = [];
  const now = new Date();
  const hoursToGenerate = days * 24;

  // Define intervention timestamps (randomly placed, 2-4 per week)
  const interventionIndices = new Set<number>();
  const interventionsPerWeek = 3;
  const totalInterventions = Math.floor((days / 7) * interventionsPerWeek);

  for (let i = 0; i < totalInterventions; i++) {
    const randomHour = Math.floor(Math.random() * hoursToGenerate);
    interventionIndices.add(randomHour);
  }

  let recentInterventionEffect = 0; // Tracks decay effect from last intervention

  for (let hourOffset = -hoursToGenerate; hourOffset <= 0; hourOffset++) {
    const timestamp = new Date(now.getTime() + hourOffset * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    // 1. Base circadian rhythm (sinusoidal wave, peak at 14:00-16:00)
    const timeOfDay = hour + timestamp.getMinutes() / 60;
    const circadianPeak = 15; // 3 PM
    const circadianAmplitude = 20;
    const circadian = Math.sin(((timeOfDay - circadianPeak) / 12) * Math.PI) * circadianAmplitude;

    // 2. Workday stress modifier (higher on Mon-Fri, 9-18)
    const isWorkday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isWorkHours = hour >= 9 && hour <= 18;
    const workdayBonus = isWorkday && isWorkHours ? 15 : 0;

    // 3. Random noise
    const noise = (Math.random() - 0.5) * 10;

    // 4. Stress spike injection (10% chance during work hours)
    const spikeChance = isWorkHours ? 0.1 : 0.02;
    const stressSpike = Math.random() < spikeChance ? Math.random() * 20 : 0;

    // 5. Intervention decay effect (reduce load by 20-30 over next 3 hours)
    const currentIndex = hoursToGenerate + hourOffset;
    if (interventionIndices.has(currentIndex)) {
      recentInterventionEffect = -25; // Immediate drop
    } else if (recentInterventionEffect < 0) {
      recentInterventionEffect += 8; // Decay over ~3 hours
    }

    // Combine all factors
    let bioLoad = 50 + circadian + workdayBonus + noise + stressSpike + recentInterventionEffect;
    bioLoad = Math.max(0, Math.min(100, bioLoad)); // Clamp to 0-100

    const dataPoint: BioTrendPoint = {
      timestamp: timestamp.toISOString(),
      bioLoad: Math.round(bioLoad),
    };

    // Attach intervention metadata if this is an intervention hour
    if (interventionIndices.has(currentIndex)) {
      const interventionTypes = ['breathing', 'grounding', 'pause'];
      dataPoint.intervention = {
        type: interventionTypes[Math.floor(Math.random() * interventionTypes.length)],
        duration: Math.floor(Math.random() * 5 + 3) * 60, // 3-8 minutes in seconds
      };
    }

    dataPoints.push(dataPoint);
  }

  return dataPoints;
}

/**
 * Generates mock intervention history from bio-trend data
 */
export function extractInterventions(bioData: BioTrendPoint[]): InterventionLog[] {
  return bioData
    .filter((point) => point.intervention)
    .map((point, index) => ({
      id: `intervention-${index}`,
      type: point.intervention!.type as 'breathing' | 'grounding' | 'pause',
      timestamp: point.timestamp,
      durationSeconds: point.intervention!.duration,
      completed: true,
    }));
}
