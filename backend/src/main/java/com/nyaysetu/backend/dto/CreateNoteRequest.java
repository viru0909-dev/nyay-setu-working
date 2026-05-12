package com.nyaysetu.backend.dto;

import java.util.UUID;

public class CreateNoteRequest {
    private String content;
    private UUID authorId;

    public CreateNoteRequest() {}

    public CreateNoteRequest(String content, UUID authorId) {
        this.content = content;
        this.authorId = authorId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }
}