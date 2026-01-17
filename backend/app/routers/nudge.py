"""
Nudge API Router - Proactive wellness nudge generation.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.auth import get_current_user_id
from app.models.journal import JournalEntry
from app.models.intervention import InterventionLog
from app.models.user import User
from app.schemas.schemas import NudgeDecision, NudgeCheckRequest
from app.services.gemini_service import generate_nudge_decision

router = APIRouter()


def _build_entries_summary(entries: list) -> str:
    """Build a summary of journal entries for AI analysis."""
    if not entries:
        return "No recent journal entries."
    
    summary_parts = []
    for entry in entries[:5]:  # Last 5 entries
        summary_parts.append(
            f"- Mood: {entry.mood.value}, "
            f"Stress: {entry.stress_score or 'not analyzed'}, "
            f"Content snippet: {entry.content[:100]}..."
        )
    
    return "\n".join(summary_parts)


@router.post("/check", response_model=NudgeDecision)
async def check_nudge(
    request: NudgeCheckRequest = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Check if a proactive nudge should be triggered for the user.
    
    Considers:
    - Recent journal entries and stress levels
    - Time since last nudge
    - User's nudge preferences
    """
    # Check if user has nudges enabled
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user and not user.nudge_enabled:
        return NudgeDecision(
            should_nudge=False,
            message="",
            nudge_type="breathing",
            context="Nudges disabled",
            priority="low"
        )
    
    # Get recent journal entries (last 24 hours)
    since = datetime.utcnow() - timedelta(hours=24)
    recent_entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id),
        JournalEntry.created_at >= since
    ).order_by(desc(JournalEntry.created_at)).all()
    
    # Get last intervention time
    last_intervention = db.query(InterventionLog).filter(
        InterventionLog.user_id == UUID(user_id)
    ).order_by(desc(InterventionLog.created_at)).first()
    
    last_nudge_time = None
    if last_intervention:
        last_nudge_time = last_intervention.created_at.isoformat()
    
    # Build summary for AI
    entries_summary = _build_entries_summary(recent_entries)
    
    # Quick heuristic check before calling AI
    # If no entries or all entries are calm, don't nudge
    if not recent_entries:
        # Check for inactivity nudge (no entries in 48 hours)
        last_entry = db.query(JournalEntry).filter(
            JournalEntry.user_id == UUID(user_id)
        ).order_by(desc(JournalEntry.created_at)).first()
        
        if last_entry:
            hours_since_last = (datetime.utcnow() - last_entry.created_at).total_seconds() / 3600
            if hours_since_last > 48:
                return NudgeDecision(
                    should_nudge=True,
                    message="I noticed you've been quiet lately. How are you feeling today?",
                    nudge_type="reflection",
                    context="No journal entries for 48 hours",
                    priority="low"
                )
        
        return NudgeDecision(
            should_nudge=False,
            message="",
            nudge_type="breathing",
            context="No recent activity",
            priority="low"
        )
    
    # Calculate average stress score
    stress_scores = [e.stress_score for e in recent_entries if e.stress_score is not None]
    avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else 50
    
    # Quick rules before AI call
    high_stress_count = sum(1 for s in stress_scores if s > 70)
    
    if avg_stress < 40 and high_stress_count == 0:
        return NudgeDecision(
            should_nudge=False,
            message="",
            nudge_type="breathing",
            context="Stress levels are healthy",
            priority="low"
        )
    
    # Use AI for nuanced decision
    result = await generate_nudge_decision(entries_summary, last_nudge_time)
    
    return NudgeDecision(**result)


@router.get("/status")
async def nudge_status(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get current nudge status and related metrics.
    """
    # Get stats for last 24 hours
    since = datetime.utcnow() - timedelta(hours=24)
    
    recent_entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id),
        JournalEntry.created_at >= since
    ).all()
    
    stress_scores = [e.stress_score for e in recent_entries if e.stress_score is not None]
    avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else None
    
    # Get last intervention
    last_intervention = db.query(InterventionLog).filter(
        InterventionLog.user_id == UUID(user_id)
    ).order_by(desc(InterventionLog.created_at)).first()
    
    return {
        "entries_last_24h": len(recent_entries),
        "avg_stress_score": round(avg_stress, 1) if avg_stress else None,
        "last_intervention": last_intervention.created_at.isoformat() if last_intervention else None,
        "high_stress_entries": sum(1 for s in stress_scores if s and s > 70)
    }
