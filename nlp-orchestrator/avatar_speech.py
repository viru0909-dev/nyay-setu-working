"""
Layer 5: Avatar Speech Layer
1. Generates context-aware interim messages while research runs (to keep user engaged)
2. Converts the final answer to Hinglish spoken dialogue for the 3D avatar
"""

import random
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_MODEL_FAST

client = AsyncGroq(api_key=GROQ_API_KEY)

# Context-aware interim message templates
INTERIM_TEMPLATES = {
    "general": [
        "Aapke sawaal par research kar raha hoon...",
        "Legal databases check kar raha hoon...",
        "Indian kanoon mein dhundh raha hoon...",
        "Please wait, deep analysis chal rahi hai...",
        "Aapki problem samajh li, ab solution dhundh raha hoon...",
    ],
    "accident": [
        "Motor Vehicles Act ke sections research kar raha hoon...",
        "Accident liability law check kar raha hoon...",
        "Insurance aur compensation rules dhundh raha hoon...",
        "MVA aur negligence provisions analyze kar raha hoon...",
    ],
    "property": [
        "Property transfer laws check kar raha hoon...",
        "Registration Act ke provisions dhundh raha hoon...",
        "Land dispute resolution options analyze kar raha hoon...",
    ],
    "criminal": [
        "BNS (Bharatiya Nyaya Sanhita) sections research kar raha hoon...",
        "Criminal procedure laws check kar raha hoon...",
        "Bail aur arrest ke provisions dhundh raha hoon...",
        "FIR aur police complaint procedure analyze kar raha hoon...",
    ],
    "consumer": [
        "Consumer Protection Act 2019 check kar raha hoon...",
        "Consumer court procedure aur options dhundh raha hoon...",
        "Compensation claim rules analyze kar raha hoon...",
    ],
    "family": [
        "Family law provisions check kar raha hoon...",
        "Hindu Marriage Act ke sections dhundh raha hoon...",
        "Divorce aur custody laws analyze kar raha hoon...",
    ],
    "labour": [
        "Labour laws aur workers' rights check kar raha hoon...",
        "Industrial Disputes Act ke provisions dhundh raha hoon...",
        "Compensation aur settlement options analyze kar raha hoon...",
    ],
}

# Domain detection keywords
DOMAIN_KEYWORDS = {
    "accident": [
        "accident",
        "vehicle",
        "car",
        "bike",
        "road",
        "collision",
        "injury",
        "mva",
        "motor",
    ],
    "property": [
        "property",
        "land",
        "house",
        "flat",
        "rent",
        "tenant",
        "possession",
        "registration",
    ],
    "criminal": [
        "fir",
        "police",
        "arrest",
        "bail",
        "crime",
        "criminal",
        "murder",
        "theft",
        "fraud",
        "ipc",
        "bns",
    ],
    "consumer": [
        "consumer",
        "product",
        "defect",
        "refund",
        "company",
        "service",
        "complaint",
    ],
    "family": [
        "divorce",
        "marriage",
        "custody",
        "alimony",
        "maintenance",
        "wife",
        "husband",
        "child",
    ],
    "labour": [
        "job",
        "employment",
        "salary",
        "fired",
        "boss",
        "company",
        "labour",
        "worker",
        "wage",
    ],
    "legal": [
        "law",
        "court",
        "judge",
        "advocate",
        "lawyer",
        "justice",
        "legal",
        "section",
        "article",
        "constitution",
        "act",
        "rule",
    ],
}


def detect_domain(query: str) -> str:
    """Detect the legal domain from the user's query."""
    lower_q = query.lower()
    for domain, keywords in DOMAIN_KEYWORDS.items():
        if any(kw in lower_q for kw in keywords):
            return domain
    return "general"


def get_interim_messages(query: str, count: int = 3) -> list[str]:
    """
    Generate a list of context-aware interim avatar messages.
    These will be streamed every 2-3 seconds while research runs.
    """
    domain = detect_domain(query)
    domain_messages = INTERIM_TEMPLATES.get(domain, INTERIM_TEMPLATES["general"])
    general_messages = INTERIM_TEMPLATES["general"]

    # Mix domain-specific and general messages
    combined = domain_messages + general_messages
    random.shuffle(combined)

    # Deduplicate and cap
    seen = set()
    result = []
    for msg in combined:
        if msg not in seen and len(result) < count:
            seen.add(msg)
            result.append(msg)

    return result


HINGLISH_CONVERSION_PROMPT = """You are converting a formal English legal answer into a friendly,
conversational Hinglish dialogue spoken by an AI legal assistant avatar named "Nyay Saarthi".

TONE & REGISTER (most important):
Speak the way an educated, bilingual Indian would explain things to a friend over chai —
warm, simple and everyday. Do NOT sound like a government notice, a news anchor, or a
court order. Use the EASY, COLLOQUIAL word, not the heavy "shuddh"/Sanskritised one.

Use the common ENGLISH word whenever a normal Indian speaker would naturally say it in
English. Keep these in English: court, judge, police, FIR, bail, case, lawyer, advocate,
rights, complaint, refund, insurance, accident, property, rent, contract, notice, appeal,
compensation, hearing, evidence. Forcing a formal Hindi translation for these makes the
speech harder to understand, not easier.

AVOID these overly formal / Sanskritised words → USE the everyday word instead:
- "nyayalaya" → "court"
- "vidhik" / "vaidhanik" → "kanooni" or just "legal"
- "adhiniyam" → "Act" or "kanoon"
- "praavdhaan" → "niyam" or "rule"
- "prakriya" → "process"
- "kshatipoorti" → "compensation" or "muaavza"
- "abhiyukt" → "accused"
- "yachika" / "aavedan" → "application" or "petition"
- "vivaran" → "details"
- "upalabdh" → "available" or "mil sakta hai"
- "sambandhit" → "related" or "se juda hua"
- "tatpashchaat" → "uske baad"
- "kripya" → "please"
- "pradaan karna" → "dena", "prapt karna" → "lena/milna"
When in doubt, pick the word your auto-rickshaw driver would understand.

OTHER RULES:
- Mix Hindi and English naturally, the way bilingual Indians actually talk.
- Keep it to 4-6 short sentences for spoken delivery.
- Be warm, reassuring and professional — but never stiff or bookish.
- Mention key section numbers and law names accurately (e.g. "Section 138", "Motor
  Vehicles Act"), but explain what they mean in plain words.
- Use "aap" (respectful), never "tum".
- End with one short, encouraging line.
- Plain text only, no markdown, no bullet points — it will be read aloud by text-to-speech.

STYLE EXAMPLE (match this register, do not copy the content):
"Dekhiye, aapke case mein Motor Vehicles Act ka Section 166 lagta hai — iska matlab hai
ki aap accident ke liye compensation claim kar sakte hain. Pehle ek police complaint aur
FIR ki copy le lijiye, phir insurance company ko notice bhejna padega. Ghabraaiye mat,
process thoda lamba hai par kanoon aapke saath hai. Main aapko har step samjha dunga."

Original English Answer:
{markdown_answer}

Convert to Hinglish dialogue:"""


async def convert_to_hinglish(markdown_answer: str) -> str:
    """Convert the final markdown answer to spoken Hinglish for the avatar."""
    try:
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {
                    "role": "user",
                    "content": HINGLISH_CONVERSION_PROMPT.format(
                        markdown_answer=markdown_answer
                    ),
                }
            ],
            temperature=0.6,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[AvatarSpeech] Hinglish conversion error: {e}")
        # Fallback: extract first 3 sentences
        sentences = markdown_answer.replace("\n", " ").split(". ")
        return ". ".join(sentences[:3]) + "."
