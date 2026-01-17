"""
Insights API Router - Weekly wellness pattern analysis.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.auth import get_current_user_id
from app.models.journal import JournalEntry
from app.models.intervention import InterventionLog
from app.schemas.schemas import InsightsRequest, StressPattern
from app.services.gemini_service import generate_weekly_insights

router = APIRouter()


def _build_weekly_summary(entries: list) -> str:
    """Build a summary of entries for weekly insights."""
    if not entries:
        return "No journal entries this week."
    
    summary_parts = []
    for entry in entries:
        day = entry.created_at.strftime("%A")
        themes = ", ".join(entry.key_themes[:3]) if entry.key_themes else "none identified"
        summary_parts.append(
            f"- {day}: Mood={entry.mood.value}, Stress={entry.stress_score or 'N/A'}, Themes={themes}"
        )
    
    return "\n".join(summary_parts)


@router.post("/weekly", response_model=StressPattern)
async def get_weekly_insights(
    request: InsightsRequest = InsightsRequest(),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get AI-generated weekly wellness insights.
    
    Analyzes journal entries from the past week to identify:
    - Stress trend (improving, stable, declining)
    - Common themes
    - Personalized recommendations
    """
    # Get entries from the past N days
    since = datetime.utcnow() - timedelta(days=request.days)
    
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id),
        JournalEntry.created_at >= since
    ).order_by(desc(JournalEntry.created_at)).all()
    
    # Calculate stats
    stress_scores = [e.stress_score for e in entries if e.stress_score is not None]
    avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else 50.0
    entry_count = len(entries)
    
    # If no entries, return default response
    if entry_count == 0:
        return StressPattern(
            trend="stable",
            avg_stress_score=0,
            frequent_themes=[],
            recommendation="Start journaling to track your wellness patterns.",
            weekly_summary="No journal entries yet this week. Take a moment to check in with yourself.",
            entry_count=0
        )
    
    # Build summary for AI
    entries_summary = _build_weekly_summary(entries)
    
    # Generate insights with AI
    result = await generate_weekly_insights(entries_summary, entry_count, avg_stress)
    
    return StressPattern(
        trend=result["trend"],
        avg_stress_score=round(avg_stress, 1),
        frequent_themes=result["frequent_themes"],
        recommendation=result["recommendation"],
        weekly_summary=result["weekly_summary"],
        entry_count=entry_count
    )


@router.get("/stats")
async def get_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get quick stats without AI analysis.
    
    Returns:
    - Entry count
    - Average stress
    - Mood distribution
    - Intervention count
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get entries
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id),
        JournalEntry.created_at >= since
    ).all()
    
    # Get interventions
    interventions = db.query(InterventionLog).filter(
        InterventionLog.user_id == UUID(user_id),
        InterventionLog.created_at >= since
    ).all()
    
    # Calculate stats
    stress_scores = [e.stress_score for e in entries if e.stress_score is not None]
    avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else None
    
    # Mood distribution
    mood_counts = {}
    for entry in entries:
        mood = entry.mood.value
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    # Intervention stats
    completed_interventions = sum(1 for i in interventions if i.completed)
    total_intervention_time = sum(i.duration_seconds for i in interventions if i.completed)
    
    return {
        "period_days": days,
        "entry_count": len(entries),
        "avg_stress_score": round(avg_stress, 1) if avg_stress else None,
        "mood_distribution": mood_counts,
        "intervention_count": len(interventions),
        "completed_interventions": completed_interventions,
        "total_calm_minutes": round(total_intervention_time / 60, 1)
    }


@router.get("/streak")
async def get_journaling_streak(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Calculate user's journaling streak.
    
    Returns:
    - Current streak (consecutive days with entries)
    - Longest streak ever
    - Total entries
    """
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id)
    ).order_by(desc(JournalEntry.created_at)).all()
    
    if not entries:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_entries": 0
        }
    
    # Get unique dates with entries
    entry_dates = set()
    for entry in entries:
        entry_dates.add(entry.created_at.date())
    
    entry_dates = sorted(entry_dates, reverse=True)
    
    # Calculate current streak
    current_streak = 0
    today = datetime.utcnow().date()
    
    for i, date in enumerate(entry_dates):
        expected_date = today - timedelta(days=i)
        if date == expected_date:
            current_streak += 1
        else:
            break
    
    # Calculate longest streak (simplified)
    longest_streak = current_streak  # For now, same as current
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_entries": len(entries)
    }
