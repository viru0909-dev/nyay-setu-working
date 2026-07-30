package com.nyaysetu.backend.service;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class LegalGroundingGuardTest {

    @Nested
    class CitationDetection {

        @ParameterizedTest
        @ValueSource(strings = {
                "Theft is punishable under Section 303 of the BNS.",
                "You may be charged under sections 302, 420 and 34.",
                "This falls under sec. 138 of the Negotiable Instruments Act.",
                "The police booked him u/s 420.",
                "This is protected by Article 21 of the Constitution.",
                "The relevant provision is IPC 302.",
                "See BNSS 173 for the procedure.",
                "Refer to CrPC 154 for FIR registration.",
                "As held in AIR 1973 SC 1461.",
                "See (2017) 10 SCC 1 for the settled position.",
                "Reported at 2019 SCC OnLine SC 1234."
        })
        void detectsStatutoryAndLawReportCitations(String response) {
            assertThat(LegalGroundingGuard.containsCitation(response)).isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "Could you tell me your full name so I can record it as the petitioner?",
                "I understand this has been difficult. When did the incident happen?",
                "Please upload any receipts or messages you still have as evidence.",
                "You can approach your nearest police station to register a complaint.",
                "### CASE SUMMARY START ###"
        })
        void leavesOrdinaryCaseFilingTurnsAlone(String response) {
            assertThat(LegalGroundingGuard.containsCitation(response)).isFalse();
        }

        @Test
        void handlesNullAndBlankInput() {
            assertThat(LegalGroundingGuard.containsCitation(null)).isFalse();
            assertThat(LegalGroundingGuard.containsCitation("   ")).isFalse();
        }
    }

    @Nested
    class UngroundedResponseSanitization {

        @Test
        void redactsCitationsAndWrapsResponseInUnverifiedNotice() {
            String hallucinated = "Theft is punishable under Section 303 of the BNS with "
                    + "imprisonment, as held in AIR 1973 SC 1461.";

            String sanitized = LegalGroundingGuard.sanitizeUngroundedResponse(hallucinated);

            assertThat(sanitized)
                    .startsWith(LegalGroundingGuard.UNVERIFIED_NOTICE)
                    .endsWith(LegalGroundingGuard.CONSULT_ADVICE)
                    .contains(LegalGroundingGuard.REDACTION)
                    .doesNotContain("Section 303", "AIR 1973 SC 1461");
        }

        @Test
        void redactsEveryNumberInAnEnumeratedSectionList() {
            String sanitized = LegalGroundingGuard.sanitizeUngroundedResponse(
                    "You may be charged under sections 302, 420 and 34 of the IPC.");

            assertThat(sanitized).doesNotContain("302", "420", "34");
        }

        @Test
        void leavesCitationFreeResponsesCompletelyUntouched() {
            String ordinary = "Thanks for sharing that. Who are you filing this case against?";

            assertThat(LegalGroundingGuard.sanitizeUngroundedResponse(ordinary)).isEqualTo(ordinary);
        }

        @Test
        void preservesTheCaseSummaryBlockSoFilingStillWorks() {
            String withSummary = """
                    Here is what I have so far. The offence appears to fall under Section 303.

                    ### CASE SUMMARY START ###
                    - **Target**: POLICE
                    - **Case Type**: CRIMINAL
                    ### CASE SUMMARY END ###
                    """;

            String sanitized = LegalGroundingGuard.sanitizeUngroundedResponse(withSummary);

            assertThat(sanitized)
                    .contains("### CASE SUMMARY START ###", "### CASE SUMMARY END ###", "**Target**: POLICE")
                    .doesNotContain("Section 303");
        }

        @Test
        void handlesNullResponse() {
            assertThat(LegalGroundingGuard.sanitizeUngroundedResponse(null)).isNull();
        }
    }

    @Nested
    class GroundingInstruction {

        @Test
        void appendsRetrievedLawWhenGrounded() {
            String instruction = LegalGroundingGuard.buildGroundingInstruction(
                    RagService.RagContext.grounded("BNS Section 303 defines theft."),
                    "BNS Section 303 defines theft.");

            assertThat(instruction)
                    .contains(LegalGroundingGuard.GROUNDED_CONTEXT_HEADING)
                    .contains("BNS Section 303 defines theft.")
                    .doesNotContain("VERIFIED LEGAL RETRIEVAL IS UNAVAILABLE");
        }

        @Test
        void warnsTheModelWhenTheRagServiceIsUnavailable() {
            String instruction = LegalGroundingGuard.buildGroundingInstruction(
                    RagService.RagContext.unavailable(), null);

            assertThat(instruction)
                    .contains("VERIFIED LEGAL RETRIEVAL IS UNAVAILABLE")
                    .contains("I'm unable to retrieve verified legal references right now.")
                    .contains("### CASE SUMMARY START ###");
        }

        @Test
        void warnsTheModelWhenRetrievalFoundNothing() {
            String instruction = LegalGroundingGuard.buildGroundingInstruction(
                    RagService.RagContext.noMatch(), null);

            assertThat(instruction).contains("VERIFIED LEGAL RETRIEVAL IS UNAVAILABLE");
        }

        @Test
        void addsNothingForInternalUtilityCompletions() {
            assertThat(LegalGroundingGuard.buildGroundingInstruction(null, null)).isEmpty();
        }

        @Test
        void fallsBackToTheWarningIfGroundedContextIsSomehowBlank() {
            String instruction = LegalGroundingGuard.buildGroundingInstruction(
                    RagService.RagContext.grounded("something"), "   ");

            assertThat(instruction).contains("VERIFIED LEGAL RETRIEVAL IS UNAVAILABLE");
        }
    }
}
