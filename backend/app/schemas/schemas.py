"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID


# ═══════════════════════════════════════════════════════════════════════════════
# Type Definitions
# ═══════════════════════════════════════════════════════════════════════════════

MoodLiteral = Literal["stressed", "anxious", "tired", "okay", "calm", "energized"]
EntryTypeLiteral = Literal["text", "voice"]
InterventionTypeLiteral = Literal["breathing", "grounding", "pause", "reflection"]
TrendLiteral = Literal["improving", "stable", "declining"]
PriorityLiteral = Literal["low", "medium", "high"]


# ═══════════════════════════════════════════════════════════════════════════════
# Journal Entry Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class JournalEntryCreate(BaseModel):
    """Request schema for creating a journal entry."""
    content: str = Field(..., min_length=1, max_length=5000)
    mood: MoodLiteral
    entry_type: EntryTypeLiteral = "text"


class JournalAnalysis(BaseModel):
    """AI analysis results for a journal entry."""
    stress_score: int = Field(..., ge=0, le=100)
    emotional_tone: str
    key_themes: List[str]
    suggested_intervention: Optional[InterventionTypeLiteral] = None
    supportive_message: str


class JournalEntryResponse(BaseModel):
    """Response schema for journal entry with optional analysis."""
    id: UUID
    user_id: UUID
    entry_type: EntryTypeLiteral
    content: str
    mood: MoodLiteral
    
    # AI Analysis (may be null if not yet analyzed)
    stress_score: Optional[int] = None
    emotional_tone: Optional[str] = None
    key_themes: Optional[List[str]] = None
    suggested_intervention: Optional[str] = None
    supportive_message: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════════════════════
# Nudge Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class NudgeCheckRequest(BaseModel):
    """Request to check if a nudge should be triggered."""
    recent_entries: List[JournalEntryResponse] = Field(default_factory=list)
    last_nudge_time: Optional[datetime] = None


class NudgeDecision(BaseModel):
    """AI decision on whether to show a nudge."""
    should_nudge: bool
    message: str = ""
    nudge_type: InterventionTypeLiteral = "breathing"
    context: str = ""
    priority: PriorityLiteral = "medium"


# ═══════════════════════════════════════════════════════════════════════════════
# Insights Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class InsightsRequest(BaseModel):
    """Request for weekly insights analysis."""
    days: int = Field(default=7, ge=1, le=30)


class StressPattern(BaseModel):
    """Weekly stress pattern analysis."""
    trend: TrendLiteral
    avg_stress_score: float = Field(..., ge=0, le=100)
    frequent_themes: List[str]
    recommendation: str
    weekly_summary: str
    entry_count: int


# ═══════════════════════════════════════════════════════════════════════════════
# Intervention Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class InterventionLogCreate(BaseModel):
    """Request schema for logging a completed intervention."""
    intervention_type: InterventionTypeLiteral
    subtype: Optional[str] = None
    trigger_reason: Optional[str] = None
    duration_seconds: int = Field(..., ge=0)
    completed: bool = False


class InterventionLogResponse(BaseModel):
    """Response schema for intervention log."""
    id: UUID
    user_id: UUID
    intervention_type: str
    subtype: Optional[str]
    trigger_reason: Optional[str]
    duration_seconds: int
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════════════════════
# User Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class UserPreferencesUpdate(BaseModel):
    """Request to update user preferences."""
    locale: Optional[Literal["en", "ar"]] = None
    theme: Optional[Literal["light", "dark", "system"]] = None
    nudge_enabled: Optional[bool] = None
    daily_reminder: Optional[bool] = None


class UserResponse(BaseModel):
    """Response schema for user profile."""
    id: UUID
    email: str
    locale: str
    theme: str
    subscription: str
    nudge_enabled: bool
    daily_reminder: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════════════════════
# Analysis Request (for direct AI analysis)
# ═══════════════════════════════════════════════════════════════════════════════

class AnalyzeRequest(BaseModel):
    """Direct request to analyze text content."""
    content: str = Field(..., min_length=1, max_length=5000)
    mood: MoodLiteral


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str = "1.0.0"
