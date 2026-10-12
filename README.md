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

After editing ordinances during local development, run `npm run index:ordinances`
once Jekyll has rebuilt the pages to refresh the search index. For a custom Jekyll
destination, run `node scripts/index-ordinances.mjs path/to/site` after building.
