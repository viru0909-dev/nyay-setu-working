// AddPartyRequest.java
package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddPartyRequest {
    @NotBlank(message = "Party name is required")
    @Size(max = 100)
    private String partyName;

    @NotBlank(message = "Party type is required")
    @Size(max = 50)
    private String partyType;

    @Email(message = "Party email must be valid")
    @Size(max = 150)
    private String partyEmail;
}