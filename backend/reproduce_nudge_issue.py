from pydantic import ValidationError
from app.schemas.schemas import NudgeDecision, InterventionLogCreate, JournalAnalysis

def test_nudge_decision():
    print("\n--- Testing NudgeDecision ---")
    try:
        # Fails currently because default "breathing" != "Breathing"
        # AND manual input "breathing" fails
        print("Attempting to create NudgeDecision with nudge_type='breathing'...")
        nudge = NudgeDecision(should_nudge=True, nudge_type="breathing")
        print(f"Success! nudge_type: {nudge.nudge_type}")
    except ValidationError as e:
        print("Caught expected ValidationError:")
        print(e)

def test_intervention_log():
    print("\n--- Testing InterventionLogCreate ---")
    try:
        print("Attempting to create InterventionLogCreate with intervention_type='breathing'...")
        log = InterventionLogCreate(intervention_type="breathing", duration_seconds=60)
        print(f"Success! intervention_type: {log.intervention_type}")
    except ValidationError as e:
        print("Caught expected ValidationError:")
        print(e)

def test_journal_analysis():
    print("\n--- Testing JournalAnalysis ---")
    try:
        print("Attempting to create JournalAnalysis with suggested_intervention='breathing'...")
        analysis = JournalAnalysis(
            stress_score=50, 
            emotional_tone="Netural", 
            key_themes=[], 
            supportive_message="Keep going",
            suggested_intervention="breathing"
        )
        print(f"Success! suggested_intervention: {analysis.suggested_intervention}")
    except ValidationError as e:
        print("Caught expected ValidationError:")
        print(e)

if __name__ == "__main__":
    test_nudge_decision()
    test_intervention_log()
    test_journal_analysis()
