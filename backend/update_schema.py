from app.database import engine
from sqlalchemy import text

def update_schema():
    # Use engine.begin() which automatically commits on success
    with engine.begin() as conn:
        print("Adding missing columns to users table...")
        
        commands = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group VARCHAR(20);",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS wearable_connected BOOLEAN DEFAULT FALSE;"
        ]
        
        for cmd in commands:
            try:
                conn.execute(text(cmd))
                print(f"Executed: {cmd}")
            except Exception as e:
                print(f"Error executing {cmd}: {e}")
        
        print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
