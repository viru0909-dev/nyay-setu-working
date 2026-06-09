package com.nyaysetu.backend.event;

import com.nyaysetu.backend.entity.LegalCase;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CaseStatusChangedEvent extends ApplicationEvent {
    private final LegalCase legalCase;

    public CaseStatusChangedEvent(Object source, LegalCase legalCase) {
        super(source);
        this.legalCase = legalCase;
    }
}