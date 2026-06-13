package com.nyaysetu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateNoteRequest {

    @NotBlank(message = "Note content cannot be empty")
    private String content;

    @NotNull(message = "Author ID is required")
    private UUID authorId;

    public CreateNoteRequest() {}

    public CreateNoteRequest(String content, UUID authorId) {
        this.content = content;
        this.authorId = authorId;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
}