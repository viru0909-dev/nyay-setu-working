"""
Layer 2: Smart Router
Routes each sub-question to the most appropriate AI model.
- Simple/factual → Groq LPU (fast, <300ms)
- Complex reasoning/precedent → Gemini (deep analysis)
"""

# Keywords that indicate a complex / deep-reasoning query needing Gemini
COMPLEX_KEYWORDS = [
    "precedent", "case law", "supreme court", "high court", "constitutional",
    "fundamental right", "landmark", "judgment", "verdict", "ratio decidendi",
    "obiter dictum", "constitutional validity", "judicial review", "writ",
    "article 32", "article 226", "public interest litigation", "pil",
    "interpretation", "distinguish", "overrule", "doctrine", "jurisprudence",
    "principle", "analysis", "reasoning", "historical", "amendment", "bill of rights"
]

# Keywords that indicate a simple/factual lookup suitable for Groq
SIMPLE_KEYWORDS = [
    "section", "ipc", "bns", "cpc", "crpc", "bnss", "mva", "penalty",
    "fine", "imprisonment", "bail", "cognizable", "non-cognizable",
    "definition", "meaning", "what is", "how to file", "procedure",
    "time limit", "limitation", "fee", "form", "document", "required",
    "eligibility", "who can", "where to file", "court fee"
]


def classify_question(question: str) -> str:
    """
    Classify a legal sub-question as 'simple' (→ Groq) or 'complex' (→ Gemini).
    Returns: 'groq' or 'gemini'
    """
    lower_q = question.lower()

    complex_score = sum(1 for kw in COMPLEX_KEYWORDS if kw in lower_q)
    simple_score = sum(1 for kw in SIMPLE_KEYWORDS if kw in lower_q)

    # Strongly complex signals → Gemini
    if complex_score >= 2:
        return "gemini"
    
    # Strongly simple signals → Groq
    if simple_score >= 1 and complex_score == 0:
        return "groq"
    
    # Length heuristic: short factual questions → Groq, longer analytical → Gemini
    word_count = len(question.split())
    if word_count <= 12:
        return "groq"
    elif word_count >= 20:
        return "gemini"
    
    # Default: Groq (faster, cheaper)
    return "groq"


def route_questions(sub_questions: list[str]) -> list[dict]:
    """
    Route each sub-question to the best model.
    Returns: list of {question, model}
    """
    return [
        {
            "question": q,
            "model": classify_question(q)
        }
        for q in sub_questions
    ]
