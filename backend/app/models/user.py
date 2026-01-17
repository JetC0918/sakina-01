"""
User model - syncs with Supabase Auth.
Stores user preferences and settings.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class SubscriptionTier(str, enum.Enum):
    """User subscription levels."""
    FREE = "free"
    PREMIUM = "premium"


class User(Base):
    """
    User model representing app users.
    The id comes from Supabase Auth (auth.users).
    """
    __tablename__ = "users"
    
    # Primary key from Supabase Auth
    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    
    # Preferences
    locale = Column(String(5), default="en")  # en, ar
    theme = Column(String(10), default="light")  # light, dark, system
    subscription = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    nudge_enabled = Column(Boolean, default=True)
    daily_reminder = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default="now()")
    updated_at = Column(DateTime, server_default="now()", onupdate="now()")
    
    # Relationships
    journal_entries = relationship(
        "JournalEntry", 
        back_populates="user",
        cascade="all, delete-orphan"
    )
    intervention_logs = relationship(
        "InterventionLog", 
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.email}>"
