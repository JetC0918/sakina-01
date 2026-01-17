"""
Dashboard API Router - Combined data endpoints to reduce network round trips.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
import asyncio

from app.database import get_db
from app.auth import get_current_user_id
from app.routers.journal import get_journal_entries
from app.routers.nudge import check_for_nudge
from app.routers.insights import get_stats, get_journaling_streak
from app.schemas.schemas import JournalEntryResponse

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all dashboard data in a single request.
    Reduces 4 separate API calls to 1.
    """
    # Note: In a true async database setup, we could run these queries in parallel.
    # With synchronous SQLAlchemy, they run sequentially but we save HTTP overhead.
    # We reuse the existing logic from other routers to ensure consistency.
    
    # 1. Get recent entries (limit 5)
    entries_raw = await get_journal_entries(
        skip=0, 
        limit=5, 
        mood=None, 
        db=db, 
        user_id=user_id
    )
    entries = [JournalEntryResponse.model_validate(entry) for entry in entries_raw]
    
    # 2. Check for nudge
    nudge = await check_for_nudge(db=db, user_id=user_id)
    
    # 3. Get insights stats (7 days)
    stats = await get_stats(days=7, db=db, user_id=user_id)
    
    # 4. Get streak
    streak = await get_journaling_streak(db=db, user_id=user_id)
    
    return {
        "entries": entries,
        "nudge": nudge,
        "stats": stats,
        "streak": streak
    }
