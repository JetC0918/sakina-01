/**
 * Sakina AI API Client
 * Calls the Python FastAPI backend for all AI operations.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ══════════════════════════════════════════════════════════════════════════════�?
// Types
// ══════════════════════════════════════════════════════════════════════════════�?

export interface JournalAnalysis {
  stress_score: number;
  emotional_tone: string;
  key_themes: string[];
  suggested_intervention?: 'breathing' | 'grounding' | 'reflection' | 'pause';
  supportive_message: string;
}

export interface JournalEntryResponse {
  id: string;
  user_id: string;
  entry_type: 'text' | 'voice';
  content: string;
  mood: string;
  stress_score?: number;
  emotional_tone?: string;
  key_themes?: string[];
  suggested_intervention?: string;
  supportive_message?: string;
  analyzed_at?: string;
  created_at: string;
}

export interface NudgeDecision {
  should_nudge: boolean;
  message: string;
  nudge_type: 'breathing' | 'grounding' | 'reflection';
  context: string;
  priority: 'low' | 'medium' | 'high';
}

export interface StressPattern {
  trend: 'improving' | 'stable' | 'declining';
  avg_stress_score: number;
  frequent_themes: string[];
  recommendation: string;
  weekly_summary: string;
  entry_count: number;
}

export interface InsightsStats {
  period_days: number;
  entry_count: number;
  avg_stress_score: number | null;
  mood_distribution: Record<string, number>;
  intervention_count: number;
  completed_interventions: number;
  total_calm_minutes: number;
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Helper Functions
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Get auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  // Import dynamically to avoid circular deps
  const { supabase } = await import('./supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  // console.log(`[API] ${options.method || 'GET'} ${endpoint}`, { hasToken: !!token });

  if (!token) {
    console.warn('[API] No auth token found');
    throw new Error('Not authenticated');
  }

  const controller = options.signal ? null : new AbortController();
  const timeoutId = controller ? setTimeout(() => controller.abort(), 15000) : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: options.signal ?? controller?.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  if (!response.ok) {
    console.error(`[API] Error ${response.status} ${endpoint}`);
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Journal API
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
  content: string,
  mood: string,
  entryType: 'text' | 'voice' = 'text'
): Promise<JournalEntryResponse> {
  return apiRequest<JournalEntryResponse>('/api/journal/', {
    method: 'POST',
    body: JSON.stringify({
      content,
      mood,
      entry_type: entryType,
    }),
  });
}

/**
 * Get journal entries with optional filtering
 */
export async function getJournalEntries(
  options: { skip?: number; limit?: number; mood?: string } = {}
): Promise<JournalEntryResponse[]> {
  const { skip = 0, limit = 20, mood } = options;
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (mood && mood !== 'all') {
    params.set('mood', mood);
  }

  return apiRequest<JournalEntryResponse[]>(`/api/journal/?${params}`);
}

/**
 * Get a specific journal entry
 */
export async function getJournalEntry(entryId: string): Promise<JournalEntryResponse> {
  return apiRequest<JournalEntryResponse>(`/api/journal/${entryId}`);
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(entryId: string): Promise<void> {
  await apiRequest(`/api/journal/${entryId}`, { method: 'DELETE' });
}

/**
 * Directly analyze text without creating an entry
 */
export async function analyzeText(
  content: string,
  mood: string
): Promise<JournalAnalysis> {
  return apiRequest<JournalAnalysis>('/api/journal/analyze', {
    method: 'POST',
    body: JSON.stringify({ content, mood }),
  });
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Nudge API
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Check if a nudge should be triggered
 */
export async function checkForNudge(): Promise<NudgeDecision> {
  return apiRequest<NudgeDecision>('/api/nudge/check', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Get nudge status and metrics
 */
export async function getNudgeStatus(): Promise<{
  entries_last_24h: number;
  avg_stress_score: number | null;
  last_intervention: string | null;
  high_stress_entries: number;
}> {
  return apiRequest('/api/nudge/status');
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Insights API
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Get weekly AI insights
 */
export async function getWeeklyInsights(days: number = 7): Promise<StressPattern> {
  return apiRequest<StressPattern>('/api/insights/weekly', {
    method: 'POST',
    body: JSON.stringify({ days }),
  });
}

/**
 * Get quick stats
 */
export async function getInsightsStats(days: number = 7): Promise<InsightsStats> {
  return apiRequest<InsightsStats>(`/api/insights/stats?days=${days}`);
}

/**
 * Get journaling streak
 */
export async function getJournalingStreak(): Promise<{
  current_streak: number;
  longest_streak: number;
  total_entries: number;
}> {
  return apiRequest('/api/insights/streak');
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Intervention API
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Log a completed intervention
 */
export async function logIntervention(data: {
  intervention_type: 'breathing' | 'grounding' | 'pause';
  subtype?: string;
  trigger_reason?: string;
  duration_seconds: number;
  completed: boolean;
}): Promise<void> {
  await apiRequest('/api/intervention/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get recent interventions
 */
export async function getRecentInterventions(hours: number = 24): Promise<{
  count: number;
  completed: number;
  total_seconds: number;
  total_minutes: number;
}> {
  return apiRequest(`/api/intervention/recent?hours=${hours}`);
}

// ══════════════════════════════════════════════════════════════════════════════�?
// Health Check
// ══════════════════════════════════════════════════════════════════════════════�?

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════�?
// User API
// ══════════════════════════════════════════════════════════════════════════════�?

export interface UserOnboardingRequest {
  name?: string;
  age_group?: string;
  gender?: string;
  occupation?: string;
  wearable_connected?: boolean;
}

export interface UserProfile extends UserOnboardingRequest {
  id: string;
  email: string;
  locale: string;
  theme: string;
  subscription: string;
  nudge_enabled: boolean;
  daily_reminder: boolean;
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/user/profile');
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UserOnboardingRequest): Promise<void> {
  await apiRequest('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Dashboard API (Combined Endpoint)

export interface JournalingStreak {
  current_streak: number;
  longest_streak: number;
  total_entries: number;
}

export interface DashboardSummary {
  entries: JournalEntryResponse[];
  nudge: NudgeDecision;
  stats: InsightsStats;
  streak: JournalingStreak;
}

/**
 * Get all dashboard data in a single request.
 * Reduces 4 API calls to 1 for faster loading.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/api/dashboard/summary');
}