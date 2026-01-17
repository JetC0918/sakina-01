import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  ComposedChart,
  Area,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MapPin } from 'lucide-react';
import { BioTrendPoint } from '@/lib/mock-bio-data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface BioLoadChartProps {
  data: BioTrendPoint[];
  range: '7d' | '30d';
}

// Custom Recharts component props type
interface CustomMarkerProps {
  cx?: number;
  cy?: number;
  payload?: BioTrendPoint;
}

// Custom intervention marker component
const InterventionMarker = ({ cx, cy, payload }: CustomMarkerProps) => {
  if (!cx || !cy || !payload?.intervention) return null;

  return (
    <g>
      <MapPin
        x={cx - 10}
        y={cy - 20}
        width={20}
        height={20}
        fill="#3B82F6"
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
    </g>
  );
};

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BioTrendPoint }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const timestamp = parseISO(data.timestamp);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {format(timestamp, 'MMM d, HH:mm')}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                data.bioLoad >= 75
                  ? '#EF4444'
                  : data.bioLoad >= 50
                    ? '#F59E0B'
                    : '#22C55E',
            }}
          />
          <p className="text-sm font-medium">
            Bio-Load: {data.bioLoad}
            <span className="text-xs text-muted-foreground ml-1">
              {data.bioLoad >= 75
                ? '(High)'
                : data.bioLoad >= 50
                  ? '(Moderate)'
                  : '(Optimal)'}
            </span>
          </p>
        </div>
        {data.intervention && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-blue-600 capitalize">
              🧘 {data.intervention.type} ({Math.floor(data.intervention.duration / 60)}min)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export function BioLoadChart({ data, range }: BioLoadChartProps) {
  // Downsample data for performance (show every Nth point)
  const sampledData = useMemo(() => {
    const interval = range === '7d' ? 3 : 12; // Every 3h for 7d, 12h for 30d
    return data.filter((_, index) => index % interval === 0);
  }, [data, range]);

  // Pre-filter intervention data for Scatter performance
  const interventionData = useMemo(
    () => sampledData.filter((d) => d.intervention),
    [sampledData]
  );

  // Format X-axis labels
  const formatXAxis = (timestamp: string) => {
    const date = parseISO(timestamp);
    return range === '7d' ? format(date, 'EEE HH:mm') : format(date, 'MMM d');
  };

  return (
    <ChartContainer
      config={{
        bioLoad: {
          label: 'Bio-Load',
          color: '#22C55E',
        },
      }}
      className="w-full"
      aria-label={`Bio-load trend chart for last ${range === '7d' ? '7 days' : '30 days'}`}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={sampledData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="bioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.4} />
            </linearGradient>
          </defs>

          {/* Axes */}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={range === '7d' ? 50 : 80}
          />
          <YAxis
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />

          {/* Main Bio-Load Area Chart */}
          <Area
            type="monotone"
            dataKey="bioLoad"
            stroke="#22C55E"
            strokeWidth={3}
            fill="url(#bioGradient)"
            animationDuration={1000}
          />

          {/* Intervention Markers (Scatter Overlay) */}
          <Scatter
            data={interventionData}
            dataKey="bioLoad"
            fill="#3B82F6"
            shape={<InterventionMarker />}
            animationDuration={1500}
            isAnimationActive={false}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
