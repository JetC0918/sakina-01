import asyncio
import os
import sys

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.gemini_service import analyze_journal_entry

async def test_ai_analysis():
    print("Testing Gemini AI Service...")
    
    test_content = "I've been feeling a bit overwhelmed with work lately, but I'm trying to stay positive."
    test_mood = "slightly stressed"
    
    print(f"Analyzing entry: '{test_content}'")
    print(f"Input mood: {test_mood}")
    print("-" * 30)
    
    try:
        result = await analyze_journal_entry(test_content, test_mood)
        
        print("Analysis Result:")
        print(f"Stress Score: {result.get('stress_score')}")
        print(f"Emotional Tone: {result.get('emotional_tone')}")
        print(f"Key Themes: {', '.join(result.get('key_themes', []))}")
        print(f"Suggested Intervention: {result.get('suggested_intervention')}")
        print(f"Supportive Message: {result.get('supportive_message')}")
        
        if result.get('stress_score') != 50 or result.get('supportive_message') != "Thank you for sharing. I'm here with you.":
            print("\n✅ AI is functioning correctly!")
        else:
            print("\n⚠️ AI returned fallback values. This might indicate an API issue or empty response.")
            
    except Exception as e:
        print(f"\n❌ Error during AI analysis: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai_analysis())
