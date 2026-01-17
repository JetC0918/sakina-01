import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models.user import User
from app.models.journal import JournalEntry
from app.models.intervention import InterventionLog
from sqlalchemy import select

def verify_models():
    db = SessionLocal()
    try:
        print("Verifying User model (SubscriptionTier)...")
        db.execute(select(User).limit(1)).scalars().first()
        print("User model OK.")

        print("Verifying JournalEntry model (MoodType, EntryType)...")
        db.execute(select(JournalEntry).limit(1)).scalars().first()
        print("JournalEntry model OK.")

        print("Verifying InterventionLog model (InterventionType)...")
        db.execute(select(InterventionLog).limit(1)).scalars().first()
        print("InterventionLog model OK.")
        
        print("\nALL ENUM MAPPINGS VERIFIED SUCCESSFULLY.")
    except Exception as e:
        print(f"\nVERIFICATION FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_models()
