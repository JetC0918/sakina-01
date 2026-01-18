import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useInsightsData } from '@/hooks/useApi';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  Flame,
  Activity,
  Wind,
  RefreshCw,
  ThumbsUp
} from 'lucide-react';

export default function Insights() {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const days = parseInt(timeRange);

  // Optimized: Stats load fast, AI insights load separately in background
  const {
    stats,
    streak,
    insights,
    insightsLoading,
    isLoading,
    isError,
    refetch
  } = useInsightsData(days);


  // Trend icon based on pattern
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-0">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Insights</h1>
            <Button variant="ghost" size="icon" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">
            AI-powered analysis of your wellness journey.
          </p>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7' | '30')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="7">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Error State */}
        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-2">Failed to load insights.</p>
              <Button variant="outline" onClick={refetch}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Weekly Summary */}
        {!isError && (
          <Card className={`border-2 ${getTrendColor(insights?.trend)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI {timeRange === '7' ? 'Weekly' : 'Monthly'} Summary
                </CardTitle>
                {insightsLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(insights?.trend)}
                    <span className="text-sm font-medium capitalize">{insights?.trend || 'stable'}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-foreground">{insights?.weekly_summary || 'No data available yet.'}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Metrics */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{stats?.entry_count || insights?.entry_count || 0}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Avg Stress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className={`text-3xl font-bold ${(insights?.avg_stress_score || 0) > 70 ? 'text-red-500' :
                  (insights?.avg_stress_score || 0) > 40 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                  {insights?.avg_stress_score?.toFixed(0) || stats?.avg_stress_score?.toFixed(0) || '--'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                Exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{stats?.completed_interventions || 0}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{streak?.current_streak || 0} days</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Common Themes */}
        {insights?.frequent_themes && insights.frequent_themes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Themes</CardTitle>
              <CardDescription>Topics that came up in your entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.frequent_themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendation */}
        {insights?.recommendation && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{insights.recommendation}</p>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {stats?.mood_distribution && Object.keys(stats.mood_distribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Distribution</CardTitle>
              <CardDescription>How you've been feeling this {days === 7 ? 'week' : 'month'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.mood_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => {
                    const total = Object.values(stats.mood_distribution).reduce((a, b) => a + b, 0);
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{mood}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${mood === 'calm' || mood === 'energized' ? 'bg-green-500' :
                              mood === 'okay' ? 'bg-blue-500' :
                                mood === 'tired' ? 'bg-yellow-500' :
                                  'bg-red-500'
                              }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!insights || insights.entry_count === 0) && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No journal entries yet. Start journaling to see AI-powered insights!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
