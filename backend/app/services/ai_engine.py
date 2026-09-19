import os
import google.generativeai as genai
from app.config import settings
import logging
import json

logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.demo_mode = settings.DEMO_MODE
        if self.api_key:
            genai.configure(api_key=self.api_key)

    def generate_insight(self, analysis_data: dict) -> dict:
        if self.demo_mode or not self.api_key:
            return {
                "summary": "Satellite-derived indicators suggest a moderate decrease in vegetation in this area.",
                "key_findings": [
                    "Potential vegetation decline was detected, estimated at 2.4 sq km.",
                    "Potential built-up expansion of 1.1 sq km was observed."
                ],
                "possible_implications": [
                    "Loss of habitat for local wildlife.",
                    "Increased human-wildlife conflict near expanded built-up zones."
                ],
                "recommended_actions": [
                    "This area may warrant field verification by conservation officers.",
                    "Increase ground patrols in the detected vegetation loss hotspots."
                ],
                "limitations": [
                    "The result does not establish the cause of the change.",
                    "Cloud cover may have affected the accuracy of the satellite reading in some pixels."
                ]
            }

        prompt = f"""
You are an expert environmental data interpreter for WildWatch AI.
Given the following satellite-derived numerical changes between two time periods, provide a responsible, structured environmental interpretation.

IMPORTANT RULES:
1. Do not invent wildlife species or causes of change.
2. Do not claim illegal activity (like poaching or illegal deforestation).
3. Do not claim confirmed ground truth.
4. Use careful language: "Satellite-derived indicators suggest...", "Potential vegetation decline...", "Area requiring field verification."
5. Output ONLY valid JSON matching this structure:
{{
  "summary": "string",
  "key_findings": ["string"],
  "possible_implications": ["string"],
  "recommended_actions": ["string"],
  "limitations": ["string"]
}}

Input Data:
{json.dumps(analysis_data, indent=2)}
        """

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            # Extract JSON from response
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
                
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini AI generation failed: {e}")
            # Fallback safe response so it doesn't break the dashboard
            return {
                "summary": "AI interpretation temporarily unavailable.",
                "key_findings": ["Numerical analysis completed successfully."],
                "possible_implications": [],
                "recommended_actions": ["Review the satellite maps and indices manually."],
                "limitations": ["AI insight generation failed."]
            }

ai_engine = AIEngine()