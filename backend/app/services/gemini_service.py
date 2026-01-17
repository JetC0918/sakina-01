"""
Gemini AI Service - handles all interactions with Google's Gemini API.
"""
import google.generativeai as genai
import json
import logging
from typing import Optional
from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini with API key
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize model
model = genai.GenerativeModel("gemini-1.5-flash")


# ═══════════════════════════════════════════════════════════════════════════════
# Prompts
# ═══════════════════════════════════════════════════════════════════════════════

ANALYSIS_PROMPT = """You are Sakina, a warm and supportive wellness companion for young professionals.
Your role is to analyze journal entries with empathy and provide emotional support.

Analyze this journal entry and provide insights:

**Journal Entry:** {content}

**User's self-reported mood:** {mood}

**Instructions:**
1. Assess the stress level (0-100, where 0 is completely calm and 100 is extremely stressed)
2. Identify the emotional tone in 1-2 words
3. Extract 2-3 key themes or concerns
4. Suggest an appropriate intervention if stress is elevated
5. Write a warm, supportive message (1-2 sentences, NO clinical language)

**IMPORTANT:** Respond ONLY with valid JSON in this EXACT format (no markdown, no extra text):
{{"stress_score": <number 0-100>, "emotional_tone": "<1-2 words>", "key_themes": ["<theme1>", "<theme2>"], "suggested_intervention": "<breathing|grounding|reflection|null>", "supportive_message": "<warm supportive message>"}}
"""

NUDGE_PROMPT = """You are Sakina, a proactive wellness companion. Based on the user's recent journal patterns, 
decide if they need a gentle intervention nudge.

**Recent Journal Summary:**
{summary}

**Last nudge:** {last_nudge}

**Rules:**
- Only nudge if there's genuine concern (multiple stressed entries, declining pattern)
- Don't over-nudge (max once per day unless stress is very high)
- Be warm and non-intrusive
- Suggest specific intervention type based on their needs

**Respond ONLY with valid JSON:**
{{"should_nudge": <true|false>, "message": "<warm nudge message if true, empty if false>", "nudge_type": "<breathing|grounding|reflection>", "context": "<brief reason for nudge>", "priority": "<low|medium|high>"}}
"""

INSIGHTS_PROMPT = """You are Sakina, analyzing a user's wellness patterns over the past week.

**Journal Entries Summary:**
{entries_summary}

**Entry Count:** {entry_count}
**Average Stress Score:** {avg_stress}

**Task:** Provide a supportive weekly summary.

**Respond ONLY with valid JSON:**
{{"trend": "<improving|stable|declining>", "frequent_themes": ["<theme1>", "<theme2>"], "recommendation": "<one actionable recommendation>", "weekly_summary": "<2-3 sentences summarizing their week warmly>"}}
"""


# ═══════════════════════════════════════════════════════════════════════════════
# Service Functions
# ═══════════════════════════════════════════════════════════════════════════════

async def analyze_journal_entry(content: str, mood: str) -> dict:
    """
    Analyze a journal entry for stress signals and emotional tone.
    
    Args:
        content: Journal entry text
        mood: User's self-reported mood
        
    Returns:
        Analysis results with stress_score, emotional_tone, key_themes, etc.
    """
    try:
        prompt = ANALYSIS_PROMPT.format(content=content, mood=mood)
        response = model.generate_content(prompt)
        
        # Parse JSON from response
        result = _parse_json_response(response.text)
        
        # Validate required fields
        result.setdefault("stress_score", 50)
        result.setdefault("emotional_tone", mood)
        result.setdefault("key_themes", [])
        result.setdefault("suggested_intervention", None)
        result.setdefault("supportive_message", "Thank you for sharing. I'm here with you.")
        
        # Clamp stress score to valid range
        result["stress_score"] = max(0, min(100, result["stress_score"]))
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        # Return fallback response on error
        return {
            "stress_score": 50,
            "emotional_tone": mood,
            "key_themes": [],
            "suggested_intervention": None,
            "supportive_message": "Thank you for sharing. I'm here with you."
        }


async def generate_nudge_decision(
    entries_summary: str,
    last_nudge_time: Optional[str] = None
) -> dict:
    """
    Decide whether to show a proactive nudge based on journal patterns.
    
    Args:
        entries_summary: Summary of recent journal entries
        last_nudge_time: When the last nudge was shown
        
    Returns:
        Nudge decision with should_nudge, message, nudge_type, etc.
    """
    try:
        last_nudge = last_nudge_time or "Never"
        prompt = NUDGE_PROMPT.format(summary=entries_summary, last_nudge=last_nudge)
        response = model.generate_content(prompt)
        
        result = _parse_json_response(response.text)
        
        # Validate required fields
        result.setdefault("should_nudge", False)
        result.setdefault("message", "")
        result.setdefault("nudge_type", "breathing")
        result.setdefault("context", "")
        result.setdefault("priority", "medium")
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini nudge error: {e}")
        return {
            "should_nudge": False,
            "message": "",
            "nudge_type": "breathing",
            "context": "",
            "priority": "low"
        }


async def generate_weekly_insights(
    entries_summary: str,
    entry_count: int,
    avg_stress: float
) -> dict:
    """
    Generate weekly wellness insights from journal entries.
    
    Args:
        entries_summary: Summary of journal entries for the week
        entry_count: Number of entries in the period
        avg_stress: Average stress score
        
    Returns:
        Weekly pattern analysis with trend, themes, recommendation, summary
    """
    try:
        prompt = INSIGHTS_PROMPT.format(
            entries_summary=entries_summary,
            entry_count=entry_count,
            avg_stress=round(avg_stress, 1)
        )
        response = model.generate_content(prompt)
        
        result = _parse_json_response(response.text)
        
        # Validate required fields
        result.setdefault("trend", "stable")
        result.setdefault("frequent_themes", [])
        result.setdefault("recommendation", "Keep journaling regularly to track your wellness.")
        result.setdefault("weekly_summary", "Thank you for staying connected with your emotions this week.")
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini insights error: {e}")
        return {
            "trend": "stable",
            "frequent_themes": [],
            "recommendation": "Keep journaling regularly to track your wellness.",
            "weekly_summary": "Thank you for staying connected with your emotions."
        }


def _parse_json_response(text: str) -> dict:
    """
    Parse JSON from Gemini response, handling potential formatting issues.
    
    Args:
        text: Raw response text from Gemini
        
    Returns:
        Parsed JSON as dictionary
    """
    # Clean up response - remove markdown code blocks if present
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error: {e}, raw text: {text[:200]}")
        raise ValueError(f"Failed to parse AI response as JSON: {e}")
