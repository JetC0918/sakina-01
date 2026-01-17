import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine
from sqlalchemy import text

def check_distinct_values():
    with engine.connect() as conn:
        print("Checking distinct values for Enums...")
        
        # User Subscription
        try:
            result = conn.execute(text("SELECT DISTINCT subscription FROM public.users"))
            values = [row[0] for row in result]
            print(f"\nUser.subscription values: {values}")
        except Exception as e:
            print(f"Error checking users: {e}")

        # Journal Entry Type
        try:
            result = conn.execute(text("SELECT DISTINCT entry_type FROM public.journal_entries"))
            values = [row[0] for row in result]
            print(f"\nJournalEntry.entry_type values: {values}")
        except Exception as e:
            print(f"Error checking journal entries (entry_type): {e}")

        # Journal Mood
        try:
            result = conn.execute(text("SELECT DISTINCT mood FROM public.journal_entries"))
            values = [row[0] for row in result]
            print(f"\nJournalEntry.mood values: {values}")
        except Exception as e:
            print(f"Error checking journal entries (mood): {e}")

        # Intervention Type
        try:
            result = conn.execute(text("SELECT DISTINCT intervention_type FROM public.intervention_logs"))
            values = [row[0] for row in result]
            print(f"\nInterventionLog.intervention_type values: {values}")
        except Exception as e:
            print(f"Error checking intervention logs: {e}")

if __name__ == "__main__":
    check_distinct_values()
