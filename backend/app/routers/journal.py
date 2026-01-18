"""
Journal API Router - CRUD operations for journal entries with AI analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime
from typing import List

from app.database import get_db, SessionLocal
from app.auth import get_current_user_id
from app.models.journal import JournalEntry, MoodType, EntryType
from app.schemas.schemas import (
    JournalEntryCreate, 
    JournalEntryResponse,
    AnalyzeRequest,
    JournalAnalysis
)
from app.services.gemini_service import analyze_journal_entry

router = APIRouter()


async def _analyze_and_update_entry(entry_id: UUID):
    """
    Background task to analyze journal entry with AI and update the record.
    Also sets mood if not provided by user.
    """
    try:
        db = SessionLocal()
        try:
            entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
            if not entry:
                return
        
            # Run AI analysis - pass mood value if present, else None
            current_mood = entry.mood.value if entry.mood else None
            analysis = await analyze_journal_entry(entry.content, current_mood)
        
            # Update entry with analysis results
            entry.stress_score = analysis["stress_score"]
            entry.emotional_tone = analysis["emotional_tone"]
            entry.key_themes = analysis["key_themes"]
            entry.suggested_intervention = analysis["suggested_intervention"]
            entry.supportive_message = analysis["supportive_message"]
            entry.analyzed_at = datetime.utcnow()
            
            # If mood wasn't provided by user, set it from AI detection
            if entry.mood is None and analysis.get("detected_mood"):
                detected_mood_str = analysis["detected_mood"]
                # Match to MoodType enum (case-insensitive)
                mood_enum = next(
                    (m for m in MoodType if m.value.lower() == detected_mood_str.lower()), 
                    MoodType.Okay  # Default fallback
                )
                entry.mood = mood_enum
        
            db.commit()
        finally:
            db.close()
    except Exception as e:
        # Log error but don't fail - analysis is non-critical
        print(f"Analysis background task error: {e}")


@router.post("/", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new journal entry.
    
    Mood is optional - if not provided, AI will detect it during analysis.
    AI analysis is triggered in the background and will be available
    when fetching the entry later.
    """
    # Create new entry - mood can be None
    db_entry = JournalEntry(
        user_id=UUID(user_id),
        entry_type=EntryType(entry.entry_type),
        content=entry.content,
        mood=MoodType(entry.mood) if entry.mood else None
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    # Trigger AI analysis in background (non-blocking)
    background_tasks.add_task(_analyze_and_update_entry, db_entry.id)
    
    return db_entry


@router.get("/", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    skip: int = 0,
    limit: int = 20,
    mood: str = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get user's journal entries with optional mood filter.
    
    Entries are returned in reverse chronological order.
    """
    query = db.query(JournalEntry).filter(
        JournalEntry.user_id == UUID(user_id)
    )
    
    # Optional mood filter
    if mood and mood != "all":
        # Case-insensitive matching for MoodType
        mood_enum = next((m for m in MoodType if m.value.lower() == mood.lower()), None)
        
        if mood_enum:
            query = query.filter(JournalEntry.mood == mood_enum)
        else:
            # If invalid mood provided, return empty list (or raise 400)
            # Returning empty list implies "no entries match this filter"
            return []
    
    entries = query.order_by(desc(JournalEntry.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return entries


@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific journal entry by ID."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == UUID(user_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return entry


@router.delete("/{entry_id}")
async def delete_journal_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == UUID(user_id)
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Entry deleted successfully"}


@router.post("/analyze", response_model=JournalAnalysis)
async def analyze_text(
    request: AnalyzeRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Directly analyze text content without creating a journal entry.
    
    Useful for real-time analysis or preview before saving.
    """
    result = await analyze_journal_entry(request.content, request.mood)
    return JournalAnalysis(**result)
