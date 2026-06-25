package com.nyaysetu.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PiiSanitizerTest {

    private PiiSanitizer sanitizer;

    @BeforeEach
    void setUp() {
        PiiEntityDetector entityDetector = (text, minorProtection) ->
            Stream.of(
                    personIfPresent(text, "Rahul Sharma"),
                    personIfPresent(text, "राहुल शर्मा"),
                    personIfPresent(text, "ரவிக்குமார்"),
                    personIfPresent(text, "రవి కుమార్"),
                    personIfPresent(text, "রাহুল শর্মা"),
                    personIfPresent(text, "Priya Sharma"),
                    personIfPresent(text, "Ravi Kumar"),
                    personIfPresent(text, "Raju"))
                    .filter(entity -> entity != null)
                    .toList();
        sanitizer = new PiiSanitizer(true, entityDetector);
    }

    @Test
    void masksAadhaarAndIndianPhoneFormats() {
        String result = sanitizer.sanitizeForGroq(
                "Aadhaar 1234-5678-9012, 1234 5678 9012 and phone +91-9876543210");

        assertThat(result)
                .doesNotContain("1234-5678-9012", "1234 5678 9012", "9876543210")
                .contains("[AADHAAR_1]", "[PHONE_1]");
    }

    @Test
    void masksPanAndGovernmentIdentityDocuments() {
        String result = sanitizer.sanitizeForGroq(
                "PAN ABCDE1234F voter ABC1234567 passport A1234567 DL MH-12-2011-1234567");

        assertThat(result)
                .doesNotContain("ABCDE1234F", "ABC1234567", "A1234567", "MH-12-2011-1234567")
                .contains("[PAN_1]", "[VOTER_ID_1]", "[PASSPORT_1]", "[DRIVING_LICENCE_1]");
    }

    @Test
    void pseudonymizesNamesAcrossSupportedIndianScripts() {
        String result = sanitizer.sanitizeForGroq(
                "Rahul Sharma, राहुल शर्मा, ரவிக்குமார், రవి కుమార్, রাহুল শর্মা");

        assertThat(result)
                .doesNotContain(
                        "Rahul Sharma", "राहुल शर्मा", "ரவிக்குமார்", "రవి కుమార్", "রাহুল শর্মা")
                .contains("PERSON_A", "PERSON_B", "PERSON_C", "PERSON_D", "PERSON_E");
    }

    @Test
    void pseudonymsAreStableWithinOnePayload() {
        String result = sanitizer.sanitizeForGroq(
                "Priya Sharma complained. Priya Sharma testified.");

        assertThat(result).isEqualTo("PERSON_A complained. PERSON_A testified.");
    }

    @Test
    void masksSingleWordAndJsonNamesInPocsoContext() {
        String result = sanitizer.sanitizeForGroq(
                "POCSO case: victim Raju, {\"victim\": \"Priya Sharma\", \"age\": 14}");

        assertThat(result).doesNotContain("Raju", "Priya Sharma");
        assertThat(result).contains("PERSON_");
    }

    @Test
    void masksCasteIdentifiers() {
        String result = sanitizer.sanitizeForGroq("Community: SC/ST, OBC and Scheduled Caste");

        assertThat(result).doesNotContain("SC/ST", "OBC", "Scheduled Caste")
                .contains("[CASTE_1]", "[CASTE_2]", "[CASTE_3]");
    }

    @Test
    void masksLabelledAddressAndMedicalFields() {
        String result = sanitizer.sanitizeForGroq(
                "address: 12 MG Road, diagnosis: post-traumatic stress disorder");

        assertThat(result)
                .doesNotContain("12 MG Road", "post-traumatic stress disorder")
                .contains("ADDRESS_A", "MEDICAL_A");
    }

    @Test
    void keepsPseudonymsStableAcrossConversationFields() {
        assertThat(sanitizer.sanitizeBatchForGroq(List.of(
                "Priya Sharma filed the complaint", "Priya Sharma testified")))
                .containsExactly("PERSON_A filed the complaint", "PERSON_A testified");
    }

    @Test
    void handlesNamesNextToJsonFieldsWithoutLosingRelationshipTokens() {
        String result = sanitizer.sanitizeForGroq(
                "{\"victim\": \"Priya Sharma\", \"accused\": \"Ravi Kumar\"}");

        assertThat(result).doesNotContain("Priya Sharma", "Ravi Kumar")
                .contains("PERSON_A", "PERSON_B");
    }

    @Test
    void blocksWhenLocalNerFailsInStrictMode() {
        PiiEntityDetector failingDetector = (text, minorProtection) -> {
            throw new IllegalStateException("NER unavailable");
        };

        assertThatThrownBy(() -> new PiiSanitizer(true, failingDetector)
                .sanitizeForGroq("Victim Priya Sharma"))
                .isInstanceOf(PiiSanitizationException.class)
                .hasMessageContaining("blocked");
    }

    @Test
    void permitsConfiguredFailOpenModeForLocalDevelopment() {
        PiiEntityDetector failingDetector = (text, minorProtection) -> {
            throw new IllegalStateException("NER unavailable");
        };

        String result = new PiiSanitizer(false, failingDetector)
                .sanitizeForGroq("Victim Priya Sharma");

        assertThat(result).isEqualTo("Victim Priya Sharma");
    }

    private static PiiEntityDetector.DetectedEntity personIfPresent(String text, String name) {
        return text.contains(name) ? new PiiEntityDetector.DetectedEntity(name, "PERSON") : null;
    }
}
