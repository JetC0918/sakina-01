import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine
from sqlalchemy import text

def apply_migration():
    try:
        with engine.connect() as conn:
            with open("migrations/002_add_user_profile_fields.sql", "r") as f:
                sql = f.read()
                # Split by newline to handle simple statements one by one or just execute
                statements = sql.split(';')
                for stmt in statements:
                    if stmt.strip():
                        print(f"Executing: {stmt.strip()}")
                        conn.execute(text(stmt))
                        conn.commit()
        print("Migration applied successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    apply_migration()
