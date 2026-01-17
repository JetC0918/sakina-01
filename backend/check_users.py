import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from sqlalchemy import select

def check_user(email):
    db = SessionLocal()
    try:
        result = db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            print(f"User {email} DOES exist in public.users")
        else:
            print(f"User {email} does NOT exist in public.users")
    except Exception as e:
        print(f"Error checking user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user("test2@test.com")
