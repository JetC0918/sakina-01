"""
JournalEntry model - stores user journal entries with AI analysis.
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class MoodType(str, enum.Enum):
    """Available mood options for journal entries."""
    Stressed = "Stressed"
    Anxious = "Anxious"
    Tired = "Tired"
    Okay = "Okay"
    Calm = "Calm"
    Energized = "Energized"
    Grateful = "Grateful"
    Focused = "Focused"
    Happy = "Happy"
    Exhausted = "Exhausted"
    Frustrated = "Frustrated"


class EntryType(str, enum.Enum):
    """Type of journal entry input."""
    text = "text"
    voice = "voice"


class JournalEntry(Base):
    """
    Journal entry with optional AI analysis results.
    Analysis is populated asynchronously after entry creation.
    """
    __tablename__ = "journal_entries"
    __table_args__ = {"schema": "public"}
    
    # Primary key
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()")
    )
    
    # Foreign key to user
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("public.users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Entry content
    entry_type = Column(Enum(EntryType), default=EntryType.text)
    content = Column(Text, nullable=False)
    mood = Column(Enum(MoodType), nullable=False)
    
    # AI Analysis results (populated after creation)
    stress_score = Column(Integer, nullable=True)  # 0-100
    emotional_tone = Column(String(50), nullable=True)  # e.g., "exhausted"
    key_themes = Column(ARRAY(String), nullable=True)  # e.g., ["work", "sleep"]
    suggested_intervention = Column(String(20), nullable=True)  # breathing, grounding, etc.
    supportive_message = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=text("now()"), index=True)
    
    # Relationships
    user = relationship("User", back_populates="journal_entries")
    
    def __repr__(self):
        return f"<JournalEntry {self.id} mood={self.mood}>"
    
    @property
    def is_analyzed(self) -> bool:
        """Check if AI analysis has been completed."""
        return self.analyzed_at is not None
