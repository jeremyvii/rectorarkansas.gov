# Rector City Website

This is the open-source codebase for the City of Rector, Arkansas website. It was built and is maintained by [Jeremy Jackson](https://github.com/jeremyvii) as a **volunteer civic project** with a focus on accessibility, simplicity, and long-term maintainability.

This website was built with the [U.S. Web Design System (USWDS)](https://designsystem.digital.gov/), and is generated using [Jekyll](https://jekyllrb.com/), a static site generator.

> This repository is **not an official government publication.** For legally binding ordinances, forms, or records, please contact City Hall directly.

## Development

### Prerequisites

- Ruby (>= 2.7 recommended)
- Bundler (`gem install bundler`)
- Node.js (for Pagefind ordinance search and USWDS tooling)

### Install dependencies

```
bundle install
npm ci
```

### Run locally

```
npm run build
bundle exec jekyll serve --skip-initial-build
```

Then open `http://localhost:4000` in your browser.

`npm run build` builds Jekyll and then generates the Pagefind index from
`site.ordinances`, including ordinance titles, details, and full text. Use this
command for production builds and deploy the complete `_site` directory,
including `_site/pagefind`. Pagefind is loaded only by the ordinance listing page,
when a visitor searches.

Netlify uses `netlify.toml` to run `npm run build` and publish `_site`. Running
only `bundle exec jekyll build` skips the Pagefind index and leaves deployed
ordinance search unavailable. The deploy log should include
`Indexed … ordinances from site.ordinances.` before publishing.

The ordinance search supports category and legal-status checkboxes using
[Pagefind filters](https://pagefind.app/docs/js-api-filtering/). Values come from
ordinance `categories` and `status` front matter. Selections match any value within
each group and both groups when used together, with or without a search term.

After editing ordinances during local development, run `npm run index:ordinances`
once Jekyll has rebuilt the pages to refresh the search index. For a custom Jekyll
destination, run `node scripts/index-ordinances.mjs path/to/site` after building.

## Ordinance editorial conventions

Website transcriptions use sentence case for text printed in all capitals in the
source, including headings, recitals, and approval statements. Preserve proper
names, acronyms, defined terms, zoning codes, and section or subsection labels.
Capitalization changes do not change source wording, punctuation, or numbering.
Keep archived PDFs unchanged so readers can compare the original documents.

Ordinance front matter uses quoted strings for ordinance identifiers (including
amendment and repeal references) and ISO dates. Page numbers, counts, and
spreadsheet row numbers remain integers; unknown values remain `null`. Use two
spaces for each indentation level, indented block lists, double-quoted strings,
and blank lines between metadata groups. Keep the same group order: layout and
instrument type; titles and identifier; dates; status; source; transcription;
verification; officials; ordinance relationships; categories. Preserve existing
metadata values and verification findings when making formatting changes.

### Ordinance categories

Use the following subject categories in ordinance front matter. The listing,
category badges, and search filters all use these values directly. Keep values
lowercase and alphabetize each ordinance's category list. Assign more than one
category when the ordinance substantively covers more than one subject.

| Category | Scope |
| --- | --- |
| animal control | Dangerous animals, livestock, and animal keeping. |
| building and construction | Building permits, construction standards, energy codes, and floodplain construction. |
| business and franchises | Business licenses and cable, internet, and electric franchises, including franchise amendments. |
| cemeteries | Cemetery operation and oversight. |
| city government | Boards and commissions, authorized city business, officials' compensation, and retirement. |
| courts and public safety | Court fines and their collection, prisoner costs, and juvenile curfews. |
| elections | Election calls, ballot measures, referendum petitions, and elected terms. |
| fire protection | Fire codes, burning restrictions, fireworks, fire equipment, and fire-service rates. |
| housing | The housing authority and public housing. |
| library | Public library operation and oversight. |
| parks and recreation | Park management, recreation commissions, and recreation facilities. |
| planning and zoning | Planning bodies, subdivision rules, zoning, rezoning, land use, and floodplain development. |
| property maintenance and nuisances | Noise, abandoned or inoperable vehicles, overgrown lots, refuse, smoke, and unsafe-structure cleanup. |
| public health and sanitation | Mosquito control, sanitary conditions, and waste collection. |
| streets and traffic | Street naming and addressing, dedications, street and alley vacations, driving rules, and roadway obstructions. |
| taxes and finance | Budgets, loans, bonds, taxes, franchise revenue, and officials' salaries. |
| water and sewer | Municipal water and sewer services, rates, deposits, and related financing. |

These groups consolidate the former planning/zoning, streets/traffic,
water/sewer, budget/finance/taxes, business/franchise/utilities, and
health/public-health/sanitation labels. Housing and library remain distinct
because they identify separate city services, even with few records.

Choose categories from the operative subject, rather than a generic safety
statement, penalty, fee, or property reference. Service charges belong with the
service: water rates under water and sewer, permit fees under building and
construction, and mosquito fees under public health and sanitation. Reserve
taxes and finance for measures substantively about city revenue, expenditure,
budgets, or borrowing; do not add it merely because a service has a fee.

Use property maintenance and nuisances for junk-vehicle storage, rather than
streets and traffic. Use planning and zoning for residential RV use, rather than
parks and recreation. Cross-list governing boards under city government and
their service, and election ordinances under elections and their substantive
topic. Apply the same subject categories to amendments when they address the
same topic as the original ordinance. Categories are editorial navigation aids
and do not establish an ordinance's legal status.
