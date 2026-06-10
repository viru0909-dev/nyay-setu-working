# Seed Legal Corpus

This directory contains the initial corpus of legal documents that are embedded into the local vector store at deployment time. Once a document is in the store, retrieval works even when the Indian Kanoon API is rate-limited or unreachable.

## File Naming Conventions

```
<doc_id>__<title_with_underscores>.txt
```

- `doc_id`: short, stable identifier. Used as the primary key in the vector store. Pick something you can refer to in citations (e.g. `bns_103`, `constitution_art_21`, `sc_kesavananda_1973`).
- `__` — double underscore separator.
- `title_with_underscores`: human-readable title, underscores replaced with spaces when displayed.
- `.txt`: plain UTF-8 text. No HTML, no PDF.

## Recommended Starter Set

A reasonable seed corpus is 100–200 documents covering:

**Statutes & codes (Bare Acts)**
- Constitution of India: each part/article
  - `constitution_art_14__Article_14_Equality_before_Law.txt`
  - `constitution_art_19__Article_19_Six_Fundamental_Freedoms.txt`
  - `constitution_art_21__Article_21_Right_to_Life_and_Personal_Liberty.txt`
- BNS 2023 (Bharatiya Nyaya Sanhita): key sections
- BNSS 2023 (Bharatiya Nagarik Suraksha Sanhita): key sections
- IPC 1860: still enforced for ongoing cases, section-by-section
- CrPC 1973 / BNSS 2023 procedural sections
- CPC 1908: key orders and rules
- Motor Vehicles Act 1988: liability and compensation chapters
- Consumer Protection Act 2019
- Right to Information Act 2005
- Hindu Marriage Act, Indian Contract Act, Transfer of Property Act
- Bharatiya Sakshya Adhiniyam 2023 (especially Section 63 for digital evidence)

**Landmark Supreme Court judgments**
- `sc_kesavananda_bharati_1973__Kesavananda_Bharati_v_State_of_Kerala.txt`
- `sc_maneka_gandhi_1978__Maneka_Gandhi_v_Union_of_India.txt`
- `sc_minerva_mills_1980__Minerva_Mills_v_Union_of_India.txt`
- `sc_vishaka_1997__Vishaka_v_State_of_Rajasthan.txt`
- `sc_puttaswamy_2017__KS_Puttaswamy_v_Union_of_India_Right_to_Privacy.txt`
- `sc_navtej_johar_2018__Navtej_Singh_Johar_v_Union_of_India.txt`

**High Court judgments** relevant to the platform's primary use cases:
- Motor accident claims and Sections 166 / 168 MVA
- Tenant-landlord deposit disputes
- Consumer redressal procedure

## How to Populate

Bare Acts can be sourced from [indiacode.nic.in](https://www.indiacode.nic.in/). Supreme Court judgments are public-domain via the Supreme Court Reports and Indian Kanoon. Save each document as a plain `.txt` file in this directory using the naming convention above.

## How to Ingest

From the `nlp-orchestrator/` directory:

```bash
python -m services.retrieval.seed_ingest
```

The script is idempotent: re-running it after adding new files only embeds the new ones. To force a re-embedding of a specific document, delete its entry from Chroma, or change its `doc_id`.

## What Gets Stored

For each `.txt` file, the script:
1. Reads the text.
2. Chunks it into ~512-token windows with 64-token overlap.
3. Embeds each chunk with the model configured in `EMBEDDING_MODEL`.
4. Writes chunks + embeddings to the Chroma collection at `CHROMA_PATH` with `source: "seed"` in the metadata so they're distinguishable from the live Kanoon hits.

## Notes

- Do **not** commit large amounts of legal text into git unless the repo's contribution policy explicitly allows it. The conventional pattern is to `.gitignore` this directory's `.txt` contents and provide a separate download/ingest step in deployment.
- The chunker processes generic plain-text; if you have richly structured XML or HTML, pre-process to plain text first (the live Kanoon path already does HTML stripping functionalities).