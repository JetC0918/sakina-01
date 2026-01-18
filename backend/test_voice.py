import asyncio
import sys
import os
from unittest.mock import MagicMock, patch

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the function to test
from app.services.gemini_service import analyze_voice_journal

async def test_voice_analysis_mock():
    print("Testing Voice Analysis (Mocked)...")
    
    # 1. Setup Mock Response from Gemini
    mock_response = MagicMock()
    # Return valid JSON as Gemini would
    mock_response.text = '''
    {
        "transcript": "I am feeling really happy today because I finished my project.",
        "stress_score": 15,
        "emotional_tone": "satisfied",
        "key_themes": ["achievement", "relief"],
        "suggested_intervention": null,
        "supportive_message": "That is wonderful! Celebrate your win.",
        "detected_mood": "Happy"
    }
    '''
    
    # 2. Patch the model.generate_content method
    # We patch where it is *used* or where it is defined. 
    # gemini_service.py imports model, so we patch the model instance there.
    # Actually, gemini_service.py does `model = genai.GenerativeModel(...)`
    # We should patch `app.services.gemini_service.model`
    
    with patch('app.services.gemini_service.model') as mock_model:
        # Configure the mock to return our response
        mock_model.generate_content.return_value = mock_response
        
        # 3. Process Dummy Audio
        print("Sending dummy audio data...")
        audio_data = b"fake_audio_bytes_12345"
        mime_type = "audio/webm"
        
        result = await analyze_voice_journal(audio_data, mime_type)
        
        # 4. Verify Results
        print("\nAnalysis Result:")
        print(f"Transcript: {result.get('transcript')}")
        print(f"Mood: {result.get('detected_mood')}")
        print(f"Stress: {result.get('stress_score')}")
        
        # Assertions
        assert result.get("transcript") == "I am feeling really happy today because I finished my project."
        assert result.get("detected_mood") == "Happy"
        assert result.get("stress_score") == 15
        
        # Verify the mock was called correctly (with list of parts)
        # Call args: (prompt, parts) or just list
        # The implementation uses: model.generate_content([prompt, {'mime_type':..., 'data':...}])
        
        call_args = mock_model.generate_content.call_args
        # call_args[0] is args tuple. we expect 1 arg which is the list
        passed_list = call_args[0][0]
        
        assert isinstance(passed_list, list)
        assert len(passed_list) == 2
        # First part is prompt string
        assert "You are Sakina" in passed_list[0]
        # Second part is audio dict
        assert passed_list[1]["mime_type"] == mime_type
        assert passed_list[1]["data"] == audio_data
        
        print("\n✅ Mocked Voice Analysis Passed!")
        print("   - JSON parsing works")
        print("   - Audio data passed correctly to Gemini SDK")
        print("   - Error handling defaults not triggered")

if __name__ == "__main__":
    asyncio.run(test_voice_analysis_mock())
