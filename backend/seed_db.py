import random
from datetime import datetime, timedelta
from app.database import engine
from sqlalchemy import text

def seed_data():
    print("Starting seed process...")
    
    # Define our target users and their scenarios
    # Note: Using exact emails provided by user
    targets = [
        {
            "email": "test@test.com",
            "scenario": "burnout",
            "journal_count": 10,
            "intervention_count": 5
        },
        {
            "email": "test2@test.com",
            "scenario": "wellness",
            "journal_count": 10,
            "intervention_count": 5
        }
    ]

    # Use engine.begin() for automatic transaction management (auto-commit on success)
    with engine.begin() as conn:
        # 0. SYNC STEP: Ensure public.users is populated from auth.users
        print("Syncing auth.users to public.users...")
        try:
            conn.execute(text("""
                INSERT INTO public.users (id, email)
                SELECT id, email FROM auth.users
                ON CONFLICT (id) DO NOTHING;
            """))
            print("Sync complete.")
        except Exception as e:
            print(f"Warning: Could not sync users (might lack permissions to read auth.users): {e}")

        for target in targets:
            email = target["email"]
            print(f"\nProcessing user: {email} ({target['scenario']} scenario)")
            
            # 1. Find User ID
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            user_row = result.fetchone()
            
            if not user_row:
                print(f"  -> User {email} NOT FOUND. Skipping. Please sign up first.")
                continue
                
            user_id = user_row[0]
            print(f"  -> Found User ID: {user_id}")
            
            # 2. Clear ONLY this user's data
            print("  -> Clearing existing data for this user...")
            conn.execute(text("DELETE FROM intervention_logs WHERE user_id = :uid"), {"uid": user_id})
            conn.execute(text("DELETE FROM journal_entries WHERE user_id = :uid"), {"uid": user_id})
            
            # 3. Generate Data based on scenario
            print("  -> Generating new mock data...")
            
            # --- Journals ---
            entries = []
            base_time = datetime.now()
            
            for i in range(target["journal_count"]):
                # Create timestamp going backwards in time
                entry_time = base_time - timedelta(days=i)
                
                if target["scenario"] == "burnout":
                    mood = random.choice(["Stressed", "Anxious", "Exhausted", "Frustrated"])
                    stress_score = random.randint(70, 95)
                    content = random.choice([
                        "I feel completely overwhelmed today. Too much work.",
                        "Can't sleep, thinking about deadlines.",
                        "My head hurts from staring at the screen all day.",
                        "I snapped at a colleague today. I'm just so tired."
                    ])
                    intervention_sugg = "Breathing Exercise"
                else: # wellness
                    mood = random.choice(["Happy", "Calm", "Focused", "Grateful"])
                    stress_score = random.randint(10, 30)
                    content = random.choice([
                        "Had a great workout this morning!",
                        "Finished the project early. Feeling good.",
                        "Took a nice walk during lunch.",
                        "Slept 8 hours last night. Amazing."
                    ])
                    intervention_sugg = "None"

                entries.append({
                    "user_id": user_id,
                    "content": content,
                    "mood": mood,
                    "stress_score": stress_score,
                    "suggested_intervention": intervention_sugg,
                    "created_at": entry_time
                })
            
            # Bulk Insert Journals
            conn.execute(text("""
                INSERT INTO journal_entries 
                (user_id, content, mood, stress_score, suggested_intervention, created_at)
                VALUES (:user_id, :content, :mood, :stress_score, :suggested_intervention, :created_at)
            """), entries)
            
            # --- Interventions ---
            interventions = []
            for i in range(target["intervention_count"]):
                int_time = base_time - timedelta(days=i, hours=2)
                
                if target["scenario"] == "burnout":
                    completed = random.choice([True, False]) # Struggling to complete
                else:
                    completed = True # consistent
                    
                interventions.append({
                    "user_id": user_id,
                    "intervention_type": "Breathing",
                    "duration_seconds": 120,
                    "completed": completed,
                    "created_at": int_time
                })
                
            # Bulk Insert Interventions
            conn.execute(text("""
                INSERT INTO intervention_logs 
                (user_id, intervention_type, duration_seconds, completed, created_at)
                VALUES (:user_id, :intervention_type, :duration_seconds, :completed, :created_at)
            """), interventions)
            
            print("  -> Done.")

    print("\nSeed process completed successfully. Changes committed.")

if __name__ == "__main__":
    seed_data()
