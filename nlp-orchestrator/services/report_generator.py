import json
from models.schemas import LiabilityReport

def generate_report(job_id: str, gemini_timeline: str, groq_legal: str) -> dict:
    """
    Takes the unstructured Markdown text from Gemini and Groq
    and merges them into a structured dict for the JSON response.
    """
    
    # In a real app we'd prompt Gemini/Groq to output actual JSON schema we can parse,
    # but for simplicity we wrap the markdown text into our JSON structure.
    
    report = {
        "jobId": job_id,
        "liabilityVerdict": "Analysis complete. See details below.",
        "timelineEvents": [
            {
                "time": "VIDEO_ANALYSIS",
                "description": gemini_timeline
            }
        ],
        "applicableSections": [
            {
                "law": "Applicable IPC/MVA Sections",
                "implication": groq_legal
            }
        ]
    }
    
    return report

def generate_avatar_script(job_id: str, groq_legal: str) -> str:
    """Generate a short 1-2 sentence Hinglish summary for the final avatar speech."""
    
    # We can either make another Groq call here, or just use a template for speed.
    # To keep this fast, we'll use a template based on whether Groq found sections.
    
    if "279" in groq_legal or "337" in groq_legal or "304A" in groq_legal:
        return "Analysis complete ho gayi. Aapki accident ki timeline aur IPC sections report me daal di gayi hai. Court report tab me check karein."
    elif len(groq_legal) > 50:
         return "Motor Vehicles Act ke under applicable sections dhund liye gaye hain. PDF report ready hai court ke liye. Kripya check karein."
    else:
        return "Forensic analysis poori ho gayi hai. Liability report extract kar li hai."
