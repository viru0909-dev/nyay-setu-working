package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Body of {@code PUT /profile/language}.
 *
 * <p>The pattern is the authoritative list of languages the interface is
 * translated into. It must stay in step with {@code UI_LANGUAGES} in
 * {@code frontend/src/config/languages.js} — adding a language means shipping
 * its locale bundle and widening this pattern together.
 */
@Data
public class LanguagePreferenceRequest {

    @NotBlank(message = "Language is required")
    @Pattern(
            regexp = "^(en|hi|mr|ta|te)$",
            message = "Unsupported language. Supported languages are: en, hi, mr, ta, te"
    )
    private String language;
}
