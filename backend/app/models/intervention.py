"""
InterventionLog model - tracks completed wellness exercises.
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class InterventionType(str, enum.Enum):
    """Types of wellness interventions."""
    BREATHING = "breathing"
    GROUNDING = "grounding"
    PAUSE = "pause"
    REFLECTION = "reflection"


class InterventionLog(Base):
    """
    Log of completed or attempted interventions.
    Tracks user engagement with wellness exercises.
    """
    __tablename__ = "intervention_logs"
    
    # Primary key
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    
    # Foreign key to user
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Intervention details
    intervention_type = Column(Enum(InterventionType), nullable=False)
    subtype = Column(String(50), nullable=True)  # e.g., "box-breathing", "4-7-8"
    trigger_reason = Column(String(100), nullable=True)  # Why nudge was shown
    
    # Session metrics
    duration_seconds = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=text("now()"))
    
    # Relationships
    user = relationship("User", back_populates="intervention_logs")
    
    def __repr__(self):
        return f"<InterventionLog {self.intervention_type} completed={self.completed}>"
