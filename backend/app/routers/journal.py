"""
Journal API Router - CRUD operations for journal entries with AI analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime
from typing import List

from app.database import get_db
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


async def _analyze_and_update_entry(entry_id: UUID, db: Session):
    """
    Background task to analyze journal entry with AI and update the record.
    """
    try:
        entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
        if not entry:
            return
        
        # Run AI analysis
        analysis = await analyze_journal_entry(entry.content, entry.mood.value)
        
        # Update entry with analysis results
        entry.stress_score = analysis["stress_score"]
        entry.emotional_tone = analysis["emotional_tone"]
        entry.key_themes = analysis["key_themes"]
        entry.suggested_intervention = analysis["suggested_intervention"]
        entry.supportive_message = analysis["supportive_message"]
        entry.analyzed_at = datetime.utcnow()
        
        db.commit()
        
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
    
    AI analysis is triggered in the background and will be available
    when fetching the entry later.
    """
    # Create new entry
    db_entry = JournalEntry(
        user_id=UUID(user_id),
        entry_type=EntryType(entry.entry_type),
        content=entry.content,
        mood=MoodType(entry.mood)
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    # Trigger AI analysis in background (non-blocking)
    background_tasks.add_task(_analyze_and_update_entry, db_entry.id, db)
    
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
        query = query.filter(JournalEntry.mood == MoodType(mood))
    
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
