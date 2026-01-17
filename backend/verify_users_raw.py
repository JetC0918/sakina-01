import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def check_users_raw():
    emails = ["test@test.com", "test2@test.com"]
    with engine.connect() as conn:
        for email in emails:
            try:
                result = conn.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": email})
                row = result.fetchone()
                if row:
                    print(f"User {email}: EXISTS (ID: {row[0]})")
                else:
                    print(f"User {email}: MISSING")
            except Exception as e:
                print(f"Error checking {email}: {e}")

if __name__ == "__main__":
    check_users_raw()
