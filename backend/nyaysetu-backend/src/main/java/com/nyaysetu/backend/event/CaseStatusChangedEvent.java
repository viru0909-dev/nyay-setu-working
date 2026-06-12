package com.nyaysetu.backend.event;

import org.springframework.context.ApplicationEvent;

import com.nyaysetu.backend.entity.CaseEntity;

import lombok.Getter;

@Getter
public class CaseStatusChangedEvent extends ApplicationEvent {
    private final CaseEntity CaseEntity;

    public CaseStatusChangedEvent(Object source, CaseEntity CaseEntity) {
        super(source);
        this.CaseEntity = CaseEntity;
    }
}