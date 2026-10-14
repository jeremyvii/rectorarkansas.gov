const container = document.querySelector('#ordinance-search');
const form = container.querySelector('form');
const input = form.querySelector('input');
const status = document.querySelector('#ordinance-search-status');
const results = document.querySelector('#ordinance-search-results');
const list = document.querySelector('#ordinance-list');
const more = document.querySelector('#ordinance-search-more');
const filterControls = document.querySelector('#ordinance-search-filters');
const clearFilters = document.querySelector('#ordinance-search-clear-filters');
// Reuse the collection items rendered by Liquid for both browsing and searching.
const itemsByUrl = new Map(
  Array.from(list.children, item => [item.querySelector('[data-ordinance-link]').href, item])
);
let pagefind;
let generation = 0;
let timer;
let matches = [];
let shown = 0;
const pageSize = 10;

container.hidden = false;

async function showMore(version) {
  more.disabled = true;
  try {
    const batch = await Promise.all(matches.slice(shown, shown + pageSize).map(result => result.data()));
    if (version !== generation) return;
    for (const result of batch) {
      const original = itemsByUrl.get(new URL(result.url, document.baseURI).href);
      if (!original) throw new Error(`Missing collection item for ${result.url}`);
      const item = original.cloneNode(true);
      const excerpt = item.querySelector('[data-search-excerpt]');
      // Pagefind escapes source HTML before adding its search-term marks.
      excerpt.innerHTML = result.excerpt || '';
      excerpt.hidden = !input.value.trim() || !result.excerpt;
      results.append(item);
    }
    shown += batch.length;
    status.textContent = `${matches.length} ordinance${matches.length === 1 ? '' : 's'} found. Showing ${shown}.`;
    more.hidden = shown >= matches.length;
  } finally {
    if (version === generation) more.disabled = false;
  }
}

function showError(version) {
  if (version !== generation) return;
  status.textContent = 'Search is temporarily unavailable. Please browse the ordinance list below.';
  list.hidden = false;
  results.hidden = true;
  more.hidden = true;
}

async function search(version) {
  const query = input.value.trim();
  const filters = {};
  for (const checkbox of filterControls.querySelectorAll('input:checked')) {
    filters[checkbox.dataset.filter] ||= { any: [] };
    filters[checkbox.dataset.filter].any.push(checkbox.value);
  }
  const hasFilters = Object.keys(filters).length > 0;
  clearFilters.hidden = !hasFilters;
  results.replaceChildren();
  more.hidden = true;
  if (!query && !hasFilters) {
    list.hidden = false;
    results.hidden = true;
    status.textContent = '';
    return;
  }
  status.textContent = 'Searching ordinances…';
  list.hidden = true;
  results.hidden = false;
  try {
    pagefind ||= import(container.dataset.bundleUrl).catch(error => {
      pagefind = undefined;
      throw error;
    });
    const engine = await pagefind;
    const response = await engine.search(query || null, { filters });
    if (version !== generation) return;
    matches = response.results;
    shown = 0;
    if (!matches.length) {
      status.textContent = 'No ordinances found. Try another search term or change the filters.';
      return;
    }
    await showMore(version);
  } catch {
    showError(version);
  }
}

input.addEventListener('input', () => {
  clearTimeout(timer);
  const version = ++generation;
  more.hidden = true;
  if (!input.value.trim()) search(version);
  else timer = setTimeout(() => search(version), 300);
});
form.addEventListener('submit', event => {
  event.preventDefault();
  clearTimeout(timer);
  search(++generation);
});
filterControls.addEventListener('change', () => {
  clearTimeout(timer);
  search(++generation);
});
clearFilters.addEventListener('click', () => {
  for (const checkbox of filterControls.querySelectorAll('input:checked')) checkbox.checked = false;
  clearTimeout(timer);
  search(++generation);
});
more.addEventListener('click', () => {
  const version = generation;
  showMore(version).catch(() => showError(version));
});
