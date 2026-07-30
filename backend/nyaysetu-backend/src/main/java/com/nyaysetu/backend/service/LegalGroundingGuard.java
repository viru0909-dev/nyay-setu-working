package com.nyaysetu.backend.service;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Keeps Vakil-Friend from inventing legal citations when it has nothing to cite.
 *
 * <p>When the LawGPT RAG service is unreachable the assistant answers purely
 * from the LLM's memory, and Llama will confidently produce IPC/BNS section
 * numbers and case citations that do not exist. On a judiciary platform a
 * citizen may act on those, so this class guards both directions:
 *
 * <ul>
 *   <li><b>Input</b> — {@link #buildGroundingInstruction} appends either the
 *       retrieved legal context or an explicit "you have no verified sources"
 *       instruction to the system prompt.</li>
 *   <li><b>Output</b> — {@link #sanitizeUngroundedResponse} scrubs citations the
 *       model emitted anyway. A prompt is guidance, not a guarantee.</li>
 * </ul>
 */
@Slf4j
public final class LegalGroundingGuard {

    /** Heading for the retrieved-context block, kept as it was before this guard existed. */
    static final String GROUNDED_CONTEXT_HEADING =
            "\n\n### CRITICAL INDIAN LEGAL CONTEXT RELEVANT TO THIS USER ###\n";

    static final String GROUNDED_CONTEXT_FOOTER = "\n\nUse this law to guide the user accurately.";

    /**
     * Appended to the system prompt when no verified legal corpus backed this turn.
     *
     * <p>Deliberately scoped to legal questions: the case-filing flow spends most
     * of its turns collecting names, dates and evidence, and those must not be
     * buried under a disclaimer.
     */
    static final String UNGROUNDED_SYSTEM_INSTRUCTION = """


            ### VERIFIED LEGAL RETRIEVAL IS UNAVAILABLE ###
            The verified Indian legal corpus could not be reached for this reply. You have NO
            grounded source for any legal provision, so you must not present one as fact.

            Whenever the user asks about the law itself — a section, an act, an offence, a
            punishment, a penalty, a limitation period, or a precedent — you MUST:
            1. Begin your reply with exactly: "I'm unable to retrieve verified legal references right now."
            2. NEVER state or guess a section number, act number, case name or law-report citation
               (for example "IPC 302", "BNS Section 103", "AIR 1973 SC 1461"). Do not offer them as
               examples, as approximations, or as what "typically" applies.
            3. NEVER state the specific punishment, fine, or limitation period attached to an offence.
            4. Give only general, non-citation procedural guidance.
            5. End by advising the user to confirm the exact provisions with an official source
               (India Code, eCourts) or a qualified advocate.

            For every other part of the conversation, continue the case-filing flow described above
            exactly as normal, including the "### CASE SUMMARY START ###" block. Do NOT add this
            disclaimer to messages that simply collect names, dates, or evidence details.
            """;

    /** Shown in place of a citation the assistant could not have verified. */
    static final String REDACTION = "[reference removed - could not be verified]";

    /** Opening line the assistant is required to lead with when retrieval failed. */
    static final String UNVERIFIED_NOTICE =
            "⚠️ **I'm unable to retrieve verified legal references right now.** "
            + "The guidance below is general only, and specific section numbers and case "
            + "citations have been removed because they could not be verified.";

    /** Closing advice pointing the user at sources that can be trusted. */
    static final String CONSULT_ADVICE =
            "_Please confirm the exact provisions with an official source "
            + "([India Code](https://www.indiacode.nic.in), eCourts) or a qualified advocate "
            + "before acting on this._";

    private static final List<Pattern> CITATION_PATTERNS = List.of(
            // "Section 302", "Sec. 138", "u/s 420", "sections 302, 420 and 34"
            Pattern.compile(
                    "\\b(?:sections?|secs?\\.?|u/s)[\\s.\\-]*\\d+[A-Za-z]{0,2}"
                            + "(?:\\s*(?:,|and|&)\\s*\\d+[A-Za-z]{0,2})*",
                    Pattern.CASE_INSENSITIVE),
            // "Article 21", "Art. 14"
            Pattern.compile(
                    "\\b(?:articles?|arts?\\.)[\\s.\\-]*\\d+[A-Za-z]{0,2}"
                            + "(?:\\s*(?:,|and|&)\\s*\\d+[A-Za-z]{0,2})*",
                    Pattern.CASE_INSENSITIVE),
            // Bare statute references: "IPC 302", "BNSS 173", "CrPC 154". Longest
            // alternatives first so "BNSS 173" is not partially matched as "BNS".
            Pattern.compile(
                    "\\b(?:BNSS|CrPC|BNS|IPC|CPC|BSA|NI\\s*Act|MV\\s*Act)[\\s.\\-]*\\d+[A-Za-z]{0,2}"
                            + "(?:\\s*(?:,|and|&)\\s*\\d+[A-Za-z]{0,2})*",
                    Pattern.CASE_INSENSITIVE),
            // Law report citations: "AIR 1973 SC 1461"
            Pattern.compile("\\bAIR\\s*\\d{4}\\s*[A-Z]{2,4}\\s*\\d+\\b"),
            // "(2017) 10 SCC 1", "2019 SCC OnLine SC 1234"
            Pattern.compile("\\(?\\b\\d{4}\\)?\\s*\\d*\\s*SCC(?:\\s+OnLine)?\\s*(?:[A-Z]{2,4}\\s*)?\\d+\\b")
    );

    private LegalGroundingGuard() {
    }

    /**
     * Build the system-prompt suffix describing what the model may rely on.
     *
     * @param ragContext      retrieval outcome, or {@code null} for internal utility
     *                        completions (chat titles, JSON extraction) that are not
     *                        legal answers and need neither block
     * @param sanitizedContext PII-sanitized retrieved context, used only when grounded
     * @return text to append to the system prompt, empty when nothing applies
     */
    public static String buildGroundingInstruction(RagService.RagContext ragContext, String sanitizedContext) {
        if (ragContext == null) {
            return "";
        }
        if (ragContext.isGrounded() && sanitizedContext != null && !sanitizedContext.isBlank()) {
            return GROUNDED_CONTEXT_HEADING + sanitizedContext + GROUNDED_CONTEXT_FOOTER;
        }
        return UNGROUNDED_SYSTEM_INSTRUCTION;
    }

    /**
     * @param text assistant response to inspect
     * @return true when the text names a statutory provision or law report citation
     */
    public static boolean containsCitation(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return CITATION_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(text).find());
    }

    /**
     * Make an ungrounded assistant response safe to show.
     *
     * <p>Responses without citations are returned untouched — most turns of the
     * case-filing flow ask for names and dates and need no disclaimer. Only when
     * the model ignored the system instruction and cited something is the text
     * scrubbed and wrapped in the unverified notice.
     *
     * @param aiResponse raw assistant text produced without verified legal context
     * @return the response, redacted and annotated if it contained citations
     */
    public static String sanitizeUngroundedResponse(String aiResponse) {
        if (!containsCitation(aiResponse)) {
            return aiResponse;
        }

        log.warn("⚠️ Ungrounded Vakil-Friend response contained legal citations; redacting before delivery");

        String redacted = aiResponse;
        for (Pattern pattern : CITATION_PATTERNS) {
            redacted = pattern.matcher(redacted).replaceAll(Matcher.quoteReplacement(REDACTION));
        }

        return UNVERIFIED_NOTICE + "\n\n" + redacted.trim() + "\n\n" + CONSULT_ADVICE;
    }
}
