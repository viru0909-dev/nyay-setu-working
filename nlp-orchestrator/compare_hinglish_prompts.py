"""
Manual verification harness for Issue #849 — colloquial Hinglish prompt.

Calls Groq with the OLD prompt and the NEW prompt on the same sample legal
answers, prints both outputs side by side, and counts formal/Sanskritised words
in each so you can SEE the register actually improved (not just that the prompt
text changed).

This is the layer that proves the fix. Unit tests guard the prompt contract;
this exercises the real model.

Usage (from nlp-orchestrator/, with your real key in the environment):
    export GROQ_API_KEY=sk-...
    python compare_hinglish_prompts.py            # real A/B against Groq
    python compare_hinglish_prompts.py --dry-run  # offline: just the word scan

The NEW prompt is imported from avatar_speech.py so this always tests what you
actually shipped. The OLD prompt is pinned below for comparison.
"""

import argparse
import asyncio
import os
import re
import sys

# ─── The OLD prompt (pre-#849), pinned here purely for A/B comparison ─────────
OLD_PROMPT = """You are converting a formal English legal answer into a friendly, \
conversational Hinglish dialogue spoken by an AI legal assistant avatar named "Nyay Saarthi".

Rules:
- Mix Hindi and English naturally, as a bilingual Indian would speak
- Shorten to 4-6 sentences maximum for spoken delivery
- Be warm, reassuring and professional
- Mention key section numbers and laws but explain them simply
- End with an encouraging statement
- Use "aap" (respectful) instead of "tum"
- Do NOT use markdown formatting. Plain text only, suitable for text-to-speech.

Original English Answer:
{markdown_answer}

Convert to Hinglish dialogue:"""

# Formal / Sanskritised words the issue is about. Lower-case, romanised.
FORMAL_WORDS = [
    "nyayalaya", "vidhik", "vaidhanik", "adhiniyam", "praavdhaan", "pravdhaan",
    "prakriya", "kshatipoorti", "abhiyukt", "yachika", "aavedan", "vivaran",
    "upalabdh", "sambandhit", "tatpashchaat", "kripya", "pradaan", "prapt",
    "anurodh", "shighra", "sandarbh", "vidhaan",
]

# Representative synthesized answers (one per legal domain).
SAMPLES = {
    "accident": (
        "Under Section 166 of the Motor Vehicles Act, 1988, a victim of a road "
        "accident may file a claim for compensation before the Motor Accident "
        "Claims Tribunal. The claimant should obtain a copy of the FIR and the "
        "insurance details of the offending vehicle. Negligence on the part of "
        "the driver must be established to succeed in the claim."
    ),
    "criminal": (
        "If you wish to report a cognizable offence, you may file an FIR under "
        "Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023. The police "
        "are obligated to register the FIR. If they refuse, you may approach the "
        "Superintendent of Police or file a complaint before the Magistrate."
    ),
    "consumer": (
        "Under the Consumer Protection Act, 2019, a consumer aggrieved by a "
        "defective product or deficient service may file a complaint before the "
        "District Consumer Disputes Redressal Commission. The complaint must be "
        "filed within two years of the cause of action and may seek a refund or "
        "compensation."
    ),
}


def count_formal_words(text: str) -> list[str]:
    """Return the formal words found in the text (word-boundary, case-insensitive)."""
    lowered = text.lower()
    hits = []
    for w in FORMAL_WORDS:
        if re.search(rf"\b{re.escape(w)}", lowered):
            hits.append(w)
    return hits


async def run_prompt(client, model: str, prompt_template: str, answer: str) -> str:
    resp = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt_template.format(markdown_answer=answer)}],
        temperature=0.6,
        max_tokens=512,
    )
    return resp.choices[0].message.content.strip()


async def main_async(new_prompt: str, model: str) -> int:
    from groq import AsyncGroq  # imported here so --dry-run needs no groq install

    client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    old_total, new_total = 0, 0

    for domain, answer in SAMPLES.items():
        old_out = await run_prompt(client, model, OLD_PROMPT, answer)
        new_out = await run_prompt(client, model, new_prompt, answer)
        old_hits = count_formal_words(old_out)
        new_hits = count_formal_words(new_out)
        old_total += len(old_hits)
        new_total += len(new_hits)

        print("=" * 72)
        print(f"DOMAIN: {domain}")
        print("-" * 72)
        print(f"[OLD]  formal words: {old_hits or 'none'}")
        print(old_out)
        print("-" * 72)
        print(f"[NEW]  formal words: {new_hits or 'none'}")
        print(new_out)
        print()

    print("=" * 72)
    print(f"TOTAL formal-word hits  ->  OLD: {old_total}   NEW: {new_total}")
    print("Expected: NEW <= OLD (fewer formal words). Also eyeball readability.")
    print("=" * 72)
    # Non-zero exit if the new prompt did not improve, so this can gate CI later.
    return 0 if new_total <= old_total else 1


def dry_run() -> int:
    """Offline sanity check: no network, no key, no groq install needed."""
    sample = (
        "Aapke case mein nyayalaya jaana padega. Vidhik prakriya ke anusaar "
        "kshatipoorti ke liye aavedan karein."
    )
    print("Dry run — scanning a sample formal sentence:")
    print(f"  text : {sample}")
    print(f"  hits : {count_formal_words(sample)}")
    print("\nNew prompt avoid-list mentions found in shipped prompt:")
    from avatar_speech import HINGLISH_CONVERSION_PROMPT
    present = [w for w in FORMAL_WORDS if w in HINGLISH_CONVERSION_PROMPT.lower()]
    print(f"  {present}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="offline word-scan only")
    parser.add_argument("--model", default="llama-3.3-70b-versatile")
    args = parser.parse_args()

    if args.dry_run:
        sys.exit(dry_run())

    if not os.environ.get("GROQ_API_KEY"):
        print("ERROR: set GROQ_API_KEY in your environment first.", file=sys.stderr)
        sys.exit(2)

    # Import the SHIPPED prompt so we always A/B against what's in the PR.
    os.environ.setdefault("GROQ_API_KEY", "x")  # let config.py import cleanly
    from avatar_speech import HINGLISH_CONVERSION_PROMPT

    sys.exit(asyncio.run(main_async(HINGLISH_CONVERSION_PROMPT, args.model)))
