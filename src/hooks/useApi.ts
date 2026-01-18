/**
 * React hook for Sakina AI API operations.
 * Provides methods to interact with the Python backend.
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createJournalEntry,
    getJournalEntries,
    deleteJournalEntry,
    checkForNudge,
    getWeeklyInsights,
    getInsightsStats,
    getJournalingStreak,
    logIntervention,
    checkApiHealth,
    updateUserProfile,
    getUserProfile,
    type JournalEntryResponse,
    type NudgeDecision,
    type StressPattern,
    type InsightsStats,
    type UserOnboardingRequest,
    type UserProfile,
} from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
// ═══════════════════════════════════════════════════════════════════════════════
// Journal Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useJournalEntries(mood?: string) {
    return useQuery({
        queryKey: ['journal-entries', mood],
        queryFn: () => getJournalEntries({ mood }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            // Check if any entry is pending analysis
            const hasPendingAnalysis = data.some((entry) => !entry.analyzed_at);
            return hasPendingAnalysis ? 2000 : false;
        },
    });
}

export function useCreateJournalEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { content: string; mood: string; type: 'text' | 'voice' }) => {
            return createJournalEntry(data.content, data.mood, data.type);
        },
        onSuccess: () => {
            // Invalidate journal entries to refetch
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({
                title: 'Entry saved',
                description: 'Your journal has been updated. AI analysis is processing...',
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to save entry',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        },
    });
}

export function useDeleteJournalEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteJournalEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            toast({
                title: 'Entry deleted',
                description: 'Journal entry has been removed.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to delete entry',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Nudge Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useNudgeCheck() {
    return useQuery({
        queryKey: ['nudge-check'],
        queryFn: checkForNudge,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        retry: 1,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Insights Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useWeeklyInsights(days: number = 7) {
    return useQuery({
        queryKey: ['weekly-insights', days],
        queryFn: () => getWeeklyInsights(days),
        staleTime: 30 * 60 * 1000, // 30 minutes - AI insights are expensive
        retry: 2,
    });
}

export function useInsightsStats(days: number = 7) {
    return useQuery({
        queryKey: ['insights-stats', days],
        queryFn: () => getInsightsStats(days),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    });
}

export function useJournalingStreak() {
    return useQuery({
        queryKey: ['journaling-streak'],
        queryFn: getJournalingStreak,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Combined Insights Hook (Optimized - Stats load fast, AI loads separately)
// ═══════════════════════════════════════════════════════════════════════════════

import { getInsightsSummary, type InsightsSummary } from '@/lib/api-client';

export function useInsightsData(days: number = 7) {
    // Fast path: stats + streak combined
    const summaryQuery = useQuery({
        queryKey: ['insights-summary', days],
        queryFn: () => getInsightsSummary(days),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });

    // Slow path: AI-generated insights (loads separately)
    const aiQuery = useQuery({
        queryKey: ['weekly-insights', days],
        queryFn: () => getWeeklyInsights(days),
        staleTime: 30 * 60 * 1000, // 30 minutes - cache AI results longer
        retry: 2,
    });

    return {
        // Stats load immediately
        stats: summaryQuery.data?.stats,
        streak: summaryQuery.data?.streak,
        statsLoading: summaryQuery.isLoading,
        statsError: summaryQuery.isError,

        // AI insights load separately (slower)
        insights: aiQuery.data,
        insightsLoading: aiQuery.isLoading,
        insightsError: aiQuery.isError,

        // Combined loading state - true only if stats are loading
        isLoading: summaryQuery.isLoading,
        isError: summaryQuery.isError || aiQuery.isError,

        refetch: () => {
            summaryQuery.refetch();
            aiQuery.refetch();
        },
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Intervention Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useLogIntervention() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logIntervention,
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['insights-stats'] });
            queryClient.invalidateQueries({ queryKey: ['nudge-check'] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Health Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useApiHealth() {
    return useQuery({
        queryKey: ['api-health'],
        queryFn: checkApiHealth,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// User Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useUserProfile(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: getUserProfile,
        retry: false, // Do not retry if 404
        staleTime: 5 * 60 * 1000,
        enabled: options?.enabled ?? true,
    });
}

export function useUpdateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast({
                title: 'Profile updated',
                description: 'Your profile has been successfully updated.',
                duration: 10000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Combined Hook for Dashboard (Optimized - Single API Call)
// ═══════════════════════════════════════════════════════════════════════════════

import { getDashboardSummary, type DashboardSummary } from '@/lib/api-client';

export function useDashboardData() {
    const queryClient = useQueryClient();

    const dashboardQuery = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: getDashboardSummary,
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            // Poll if any entry is pending analysis
            const hasPendingAnalysis = data.entries.some((entry) => !entry.analyzed_at);
            return hasPendingAnalysis ? 3000 : false;
        },
    });

    return {
        isLoading: dashboardQuery.isLoading,
        isError: dashboardQuery.isError,
        entries: dashboardQuery.data?.entries || [],
        nudge: dashboardQuery.data?.nudge,
        stats: dashboardQuery.data?.stats,
        streak: dashboardQuery.data?.streak,
        refetch: () => {
            dashboardQuery.refetch();
            // Also invalidate individual queries so other pages get fresh data
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['nudge-check'] });
            queryClient.invalidateQueries({ queryKey: ['insights-stats'] });
            queryClient.invalidateQueries({ queryKey: ['journaling-streak'] });
        },
    };
}
