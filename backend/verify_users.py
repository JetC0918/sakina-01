import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from sqlalchemy import select

def check_users():
    db = SessionLocal()
    emails = ["test@test.com", "test2@test.com"]
    try:
        for email in emails:
            result = db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if user:
                print(f"User {email}: EXISTS (ID: {user.id})")
            else:
                print(f"User {email}: MISSING")
    except Exception as e:
        print(f"Error checking users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
