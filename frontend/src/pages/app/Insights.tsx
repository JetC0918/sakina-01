import { useState, useMemo } from 'react';
import { generateBioTrends } from '@/lib/mock-bio-data';
import { BioLoadChart } from '@/components/app/insights/BioLoadChart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/PageTransition';

export default function Insights() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Generate mock bio-load data (cached based on time range)
  const bioData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30;
    return generateBioTrends(days);
  }, [timeRange]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const avgLoad = Math.round(
      bioData.reduce((sum, point) => sum + point.bioLoad, 0) / bioData.length
    );
    const interventionCount = bioData.filter((point) => point.intervention).length;
    const peakLoad = Math.max(...bioData.map((point) => point.bioLoad));

    return { avgLoad, interventionCount, peakLoad };
  }, [bioData]);

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground">
          Track your wellness journey with data-driven patterns.
        </p>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Bio-Load</CardDescription>
            <CardTitle className="text-3xl">
              {metrics.avgLoad}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {metrics.avgLoad >= 75
                  ? 'High'
                  : metrics.avgLoad >= 50
                    ? 'Moderate'
                    : 'Optimal'}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Interventions Taken</CardDescription>
            <CardTitle className="text-3xl">{metrics.interventionCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Peak Load</CardDescription>
            <CardTitle className="text-3xl text-red-500">{metrics.peakLoad}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bio-Load Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Bio-Load Trend</CardTitle>
          <CardDescription>
            Your stress levels over time with intervention markers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <BioLoadChart data={bioData} range={timeRange} />
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
}
