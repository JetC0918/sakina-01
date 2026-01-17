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
        staleTime: 30 * 60 * 1000, // 30 minutes
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
// Combined Hook for Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

export function useDashboardData() {
    const journalQuery = useJournalEntries();
    const nudgeQuery = useNudgeCheck();
    const statsQuery = useInsightsStats(7);
    const streakQuery = useJournalingStreak();

    return {
        isLoading: journalQuery.isLoading || nudgeQuery.isLoading,
        isError: journalQuery.isError || nudgeQuery.isError,
        entries: journalQuery.data || [],
        nudge: nudgeQuery.data,
        stats: statsQuery.data,
        streak: streakQuery.data,
        refetch: () => {
            journalQuery.refetch();
            nudgeQuery.refetch();
            statsQuery.refetch();
            streakQuery.refetch();
        },
    };
}
