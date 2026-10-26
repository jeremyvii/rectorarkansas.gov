---
name: transcribe-ordinance
description: Import Rector ordinance PDFs into the Jekyll ordinance collection using reliable text extraction or OCR. Create numbered Markdown and archived PDF files, populate front matter, preserve legal wording and numbering, and record unresolved verification. Use when importing, transcribing, or reviewing an ordinance PDF.
---

# Transcribe an ordinance

Create these files in the current Jekyll repository:

- `_ordinances/<ordinance-number>.md`
- `assets/documents/ordinances/<ordinance-number>.pdf`

Use only the ordinance identifier as the basename, such as `328.md`
and `328.pdf`. Preserve meaningful identifier suffixes. Preserve the
original PDF bytes, including signatures and appended material.

## Inspect the repository and PDF

1. Read applicable AGENTS.md instructions, the ordinance editorial
   conventions in `README.md`, `_config.yml`,
   `_layouts/ordinance.html`, and representative ordinance Markdown.
2. Follow the repository's collection, permalink, metadata, and
   category conventions.
3. Establish the ordinance number from the document rather than its
   filename alone.
4. Inspect every PDF page, including signature pages and attachments.
5. Distinguish incorporated exhibits from separately numbered
   ordinances or resolutions. Do not merge standalone instruments
   into the ordinance's operative sections.
6. Inspect existing destination files before writing. Preserve
   curated metadata and verified text. Do not silently replace a
   different source PDF.
7. Copy the PDF rather than deleting or moving the user's input.
   Confirm the archived copy matches the input using SHA-256.

Keep intermediate images, extraction results, and OCR files in a
temporary directory outside the Jekyll collection.

## Extract text or OCR

Check available tools first. Prefer Poppler and Tesseract, or
equivalent installed local tools.

Example commands:

```bash
pdfinfo "$input_pdf"
pdftotext -f 1 -l 1 -layout "$input_pdf" "$work_dir/page-001.txt"
pdftoppm -f 1 -l 1 -r 300 -png -singlefile \
  "$input_pdf" "$work_dir/page-001"
tesseract "$work_dir/page-001.png" "$work_dir/page-001-ocr" \
  -l eng --psm 3
```

Assess each page independently:

- Use native extraction when its text is complete and readable.
- OCR image-only pages and scanned regions missing from extraction.
- Re-OCR pages with corrupted or incomplete existing text layers.
- Reconcile extraction and OCR against the rendered page.
- Do not concatenate duplicate passages.
- Check handwriting and signatures visually; OCR is unreliable there.

Nonempty extracted text does not prove completeness. Check reading
order, missing regions, broken encoding, and stale OCR layers.

Rotate, deskew, or increase resolution on temporary images when
needed. Never modify the archived original.

Do not send documents to external OCR services without authorization.
If extraction or OCR cannot be completed, record the blocker and
identify the affected pages. Never invent missing text.

## Transcribe faithfully

Preserve all operative text, recitals, headings, amounts, dates,
references, section labels, exhibits, approval statements, and
attestation details.

- Correct OCR errors only when the image establishes the correction.
- Preserve actual source errors and numbering gaps.
- Join visual line wraps and remove purely typographic hyphenation.
- Do not modernize wording, repair substantive grammar, or supply
  missing provisions.
- Use `[illegible]` at unreadable locations and record a specific
  verification item.
- Transcribe signature names and roles when established. Do not
  infer a name from an ambiguous signature or contemporary officials.
- Include the passed-and-approved statement and signature/attestation
  text even when an existing Markdown sample omits them.
- Distinguish editorial descriptions from source text.
- Apply the README's sentence-case convention to all-capital text,
  preserving proper names, acronyms, defined terms, codes, and labels.

When original digital text or existing Markdown supplies the wording,
compare it against the executed PDF for adopted edits, handwritten
changes, and omissions. Do not inherit its verified status.

## Format for Jekyll

The ordinance layout supplies the page title and short title.

- Use `##` for source sections and deeper headings for articles.
- Preserve original heading wording and section numbers.
- Use semantic lists and preserve visible source labels.
- Inspect the layout's list styling before choosing markup.
- Use the README's `ordinance-list-*` classes to match source list
  markers independently of nesting depth.
- When Markdown and existing CSS reproduce the source numbering
  correctly, use Markdown lists.
- Otherwise use local semantic HTML lists with appropriate `type`,
  `start`, or `value` attributes. Preserve meaningful parentheses
  and numbering gaps.
- Do not add global CSS overrides to the ordinance body.
- Use accessible tables when required.
- Describe nontext exhibits and identify their PDF pages; record
  any content that cannot be represented fully.
- Escape source text resembling HTML.
- Protect literal Liquid syntax with narrowly scoped raw blocks.

## Front matter

Use this baseline, adapting it to established repository conventions.
Replace illustrative values with actual findings.

```yaml
---
layout: ordinance
ordinance_number: "328"
title: "Ordinance No. 328"
short_title: "Building Permit Ordinance"

adopted_date: null

source:
  type: signed_scan
  file: /assets/documents/ordinances/328.pdf

transcription:
  source: signed_scan
  method: ocr
  status: unverified
  verified_against: null
  source_page_count: 6
  pages_checked: []
  human_review: pending
  verification_needed:
    - field: adopted_date
      page: null
      section: null
      issue: "Adoption date has not been established."
      action: "Check the passage and approval statement."
  notes: []

legislative_history:
  history: []
  action: "Check subsequent ordinances and official records."

officials:
  mayor: null
  city_clerk: null

categories:
  - "building and construction"
---
```

### Metadata rules

- Quote ordinance identifiers and ISO dates.
- Set `title` to `Ordinance No. <number>`.
- Use the source short title when available; otherwise supply a
  concise editorial topic description.
- Distinguish adoption, effective, publication, and recording dates.
  Never infer adoption solely from an effective-date clause.
- Use null or omit unknown scalar fields.
- Omit unknown `amends` and `repeals` lists. Empty arrays can produce
  blank detail rows in Liquid.
- Use historical officials supported by evidence, never names copied
  from another ordinance.
- Reuse existing lowercase categories where possible.
- Preserve supported existing metadata instead of replacing it with
  unknown solely because this PDF does not establish it.

Do not assign ordinance legal-status labels or publish legal-status
filters or badges. Record amendment and repeal evidence under
`legislative_history.history` and follow-up actions under
`legislative_history.action`, separately from transcription review status.
Follow the README's metadata formatting, group order, and category list.

`source.type` describes the archived PDF, such as `signed_scan`,
`scan`, or `digital_pdf`.

`transcription.source` describes the text origin. It can differ from
the PDF type: for example, `original_digital_text` when an original
authoring document supplies the wording.

`transcription.method` is `text_extraction`, `ocr`, `mixed`, or
`manual`. Record page-specific methods when useful.

Do not call an unsigned PDF a signed scan merely because the layout
labels its PDF link “signed ordinance.”

### Amendment and repeal relationships

Read operative provisions rather than relying only on titles,
recitals, or existing front matter.

Use lists of ordinance identifiers:

```yaml
amends:
  - "359"
repeals:
  - "328"
  - "573"
```

Ordinance 599 illustrates the distinction:

- Replacement of Section 7 of 359 is an amendment to 359.
- Section 3 explicitly repeals 328 in its entirety.
- Section 4 explicitly repeals 573 in its entirety.
- A generic conflict repealer establishes no additional numbered
  repeal relationships.

Mere citations are not amendments or repeals.

Later ordinances can establish legislative history for earlier ordinances.
Record the supporting ordinance, section, PDF page, and source path.
Verify adoption and commencement before treating a repeal as effective.

When maintaining related records is within the requested scope,
update their metadata without rewriting historical bodies. Follow
existing reciprocal-field conventions, for example:

```yaml
repealed_by:
  - "599"
```

For partial amendments, record the amendment scope and supporting evidence.

Do not create missing referenced ordinances from citations alone.
Report supported related updates when they fall outside task scope.

## Verification

Compare the entire transcription against every rendered PDF page.
Give particular attention to:

- Negations and shall/may distinctions.
- Amounts, decimal points, percentages, and measurements.
- Dates, deadlines, and ordinance references.
- Section and subsection numbering.
- Signatures, handwritten changes, and attachments.

Use transcription statuses consistently:

- `unverified`: no complete visual comparison.
- `needs_review`: comparison found unresolved reading or completeness
  issues.
- `verified`: every page was compared and transcription/source-reading
  issues were resolved.

Set `verified_against` only after complete comparison.
Record actual 1-based PDF indexes in `pages_checked`.

Transcription verification does not certify current legal status.
Human review is separate; never claim it occurred unless documented.

Record unresolved verification in front matter, not only in chat.
Each item should identify:

- Affected field or body text.
- PDF page and section, when applicable.
- The specific uncertainty.
- A concrete action needed to resolve it.

Also record incomplete page comparison, missing source pages,
unrepresented exhibits, uncertain dates/names, missing cross-reference
targets, and unavailable build checks.

Put resolved findings and source anomalies requiring no action in
`notes`. Keep legislative evidence separate under
`legislative_history.history`, with follow-up actions under
`legislative_history.action`.

The supplied ordinance layout does not display verification fields.
Do not promise that these notes appear publicly or modify the layout
unless requested.

## Validate and finish

1. Parse front matter as YAML and check field types.
2. Confirm the ordinance identifier, both basenames, and PDF URL agree.
3. Confirm every page and attachment is accounted for.
4. Confirm archived PDF bytes match the original.
5. Check cross-reference targets.
6. Run the repository's usual Jekyll build when dependencies are
   available.
7. Inspect generated HTML for headings, list numbering, tables,
   dates, and PDF links.
8. If a check cannot run, record it as pending verification.
9. Briefly report paths, extraction method, and remaining issues.

Do not deploy, publish, or commit website changes unless authorized.

