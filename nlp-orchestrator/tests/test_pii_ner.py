"""Tests for the local multilingual PII NER boundary."""

import pytest

import pii_ner


@pytest.mark.parametrize(
    "name",
    ["Rahul Sharma", "राहुल शर्मा", "ரவிக்குமார்", "రవి కుమార్", "রাহুল শর্মা"],
)
def test_detects_person_names_in_indian_scripts(monkeypatch, name):
    monkeypatch.setattr(
        pii_ner,
        "_get_ner_pipeline",
        lambda: lambda text: [
            {
                "entity_group": "PER",
                "score": 0.99,
                "start": text.index(name),
                "end": text.index(name) + len(name),
            }
        ],
    )

    entities = pii_ner.detect_sensitive_entities(f"Victim: {name}")

    assert entities == [pii_ner.DetectedEntity(value=name, type="PERSON")]


def test_minor_mode_uses_lower_threshold(monkeypatch):
    monkeypatch.setattr(
        pii_ner,
        "_get_ner_pipeline",
        lambda: lambda text: [
            {
                "entity_group": "PER",
                "score": 0.40,
                "start": text.index("Raju"),
                "end": text.index("Raju") + len("Raju"),
            }
        ],
    )

    assert pii_ner.detect_sensitive_entities("Victim Raju") == []
    assert pii_ner.detect_sensitive_entities("Victim Raju", minor_protection=True)


def test_maps_organizations_and_locations(monkeypatch):
    text = "Priya visited Apollo Hospital in Chennai"
    monkeypatch.setattr(
        pii_ner,
        "_get_ner_pipeline",
        lambda: lambda _: [
            {"entity_group": "ORG", "score": 0.9, "start": 14, "end": 29},
            {"entity_group": "LOC", "score": 0.9, "start": 33, "end": 40},
        ],
    )

    entities = pii_ner.detect_sensitive_entities(text)

    assert entities == [
        pii_ner.DetectedEntity(value="Apollo Hospital", type="ORGANIZATION"),
        pii_ner.DetectedEntity(value="Chennai", type="ADDRESS"),
    ]
