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


def _build_period_summary(entries: list, days: int) -> str:
    """Build a summary of entries for the given period insights."""
    period_name = "month" if days > 7 else "week"
    if not entries:
        return f"No journal entries this {period_name}."
    
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
    Get AI-generated wellness insights for a specific period.
    
    Analyzes journal entries from the past N days to identify:
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
    period_name = "month" if request.days > 7 else "week"
    if entry_count == 0:
        return StressPattern(
            trend="stable",
            avg_stress_score=0,
            frequent_themes=[],
            recommendation="Start journaling to track your wellness patterns.",
            weekly_summary=f"No journal entries yet this {period_name}. Take a moment to check in with yourself.",
            entry_count=0
        )
    
    # Build summary for AI
    entries_summary = _build_period_summary(entries, request.days)
    
    # Generate insights with AI
    result = await generate_weekly_insights(entries_summary, entry_count, avg_stress, days=request.days)
    
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
        "avg_stress_score": round(avg_stress, 1) if avg_stress is not None else None,
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
    # Optimize: Only fetch unique dates from the last 90 days
    # This avoids fetching all entry content
    from sqlalchemy import func
    
    # Get unique dates with entries (optimized query)
    entry_dates_query = db.query(
        func.date(JournalEntry.created_at)
    ).filter(
        JournalEntry.user_id == UUID(user_id)
    ).distinct().order_by(
        desc(func.date(JournalEntry.created_at))
    ).limit(90).all()  # Only need recent history for current streak
    
    if not entry_dates_query:
        # Check if there are any entries at all for total count
        total_count = db.query(JournalEntry).filter(
            JournalEntry.user_id == UUID(user_id)
        ).count()
        
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_entries": total_count
        }
    
    # Convert result tuples to date objects
    entry_dates = [d[0] for d in entry_dates_query]
    
    # Calculate streaks
    today = datetime.utcnow().date()
    last_entry_date = entry_dates[0]

    # Current streak only counts if the most recent entry is today or yesterday
    current_streak = 0
    is_active = (last_entry_date == today) or (last_entry_date == today - timedelta(days=1))
    if is_active:
        current_streak = 1
        previous_date = last_entry_date
        for date in entry_dates[1:]:
            if date == previous_date - timedelta(days=1):
                current_streak += 1
                previous_date = date
            else:
                break

    # Longest streak across the available history
    longest_streak = 1
    running = 1
    prev_date = entry_dates[0]
    for date in entry_dates[1:]:
        if date == prev_date - timedelta(days=1):
            running += 1
        else:
            longest_streak = max(longest_streak, running)
            running = 1
        prev_date = date
    longest_streak = max(longest_streak, running)
                
    # Get total count separately
    total_count = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id)
    ).count()

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_entries": total_count
    }
