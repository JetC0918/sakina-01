"""
Intervention API Router - Log completed wellness exercises.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from datetime import datetime, timedelta
from typing import List

from app.database import get_db
from app.auth import get_current_user_id
from app.models.intervention import InterventionLog, InterventionType
from app.schemas.schemas import InterventionLogCreate, InterventionLogResponse

router = APIRouter()


@router.post("/", response_model=InterventionLogResponse)
async def log_intervention(
    log: InterventionLogCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Log a completed or attempted intervention.
    """
    db_log = InterventionLog(
        user_id=UUID(user_id),
        intervention_type=InterventionType(log.intervention_type),
        subtype=log.subtype,
        trigger_reason=log.trigger_reason,
        duration_seconds=log.duration_seconds,
        completed=log.completed
    )
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log


@router.get("/", response_model=List[InterventionLogResponse])
async def get_interventions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get user's intervention history.
    """
    logs = db.query(InterventionLog).filter(
        InterventionLog.user_id == UUID(user_id)
    ).order_by(desc(InterventionLog.created_at))\
     .offset(skip)\
     .limit(limit)\
     .all()
    
    return logs


@router.get("/recent")
async def get_recent_interventions(
    hours: int = 24,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get interventions from the last N hours.
    """
    since = datetime.utcnow() - timedelta(hours=hours)
    
    logs = db.query(InterventionLog).filter(
        InterventionLog.user_id == UUID(user_id),
        InterventionLog.created_at >= since
    ).order_by(desc(InterventionLog.created_at)).all()
    
    completed = [l for l in logs if l.completed]
    total_time = sum(l.duration_seconds for l in completed)
    
    return {
        "count": len(logs),
        "completed": len(completed),
        "total_seconds": total_time,
        "total_minutes": round(total_time / 60, 1),
        "logs": [InterventionLogResponse.model_validate(l) for l in logs]
    }
