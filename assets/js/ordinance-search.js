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

function restoreSearchFromUrl() {
  const params = new URL(location.href).searchParams;
  input.value = params.get('query') || '';
  for (const checkbox of filterControls.querySelectorAll('input')) {
    checkbox.checked = params.getAll(checkbox.dataset.filter).includes(checkbox.value);
  }
  if (filterControls.querySelector('input:checked')) {
    filterControls.closest('details').open = true;
  }
}

function updateSearchUrl(mode) {
  const url = new URL(location.href);
  for (const key of ['query', 'category', 'status']) url.searchParams.delete(key);
  if (input.value.trim()) url.searchParams.set('query', input.value.trim());
  for (const checkbox of filterControls.querySelectorAll('input:checked')) {
    url.searchParams.append(checkbox.dataset.filter, checkbox.value);
  }
  if (url.href !== location.href) {
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  }
}

async function showMore(version, focusNewResults = false) {
  more.disabled = true;
  try {
    const batch = matches.slice(shown, shown + pageSize);
    if (version !== generation) return;
    let firstNewLink;
    for (const result of batch) {
      const original = itemsByUrl.get(new URL(result.url, document.baseURI).href);
      if (!original) throw new Error(`Missing collection item for ${result.url}`);
      const item = original.cloneNode(true);
      const excerpt = item.querySelector('[data-search-excerpt]');
      // Pagefind escapes source HTML before adding its search-term marks.
      excerpt.innerHTML = result.excerpt || '';
      excerpt.hidden = !input.value.trim() || !result.excerpt;
      results.append(item);
      firstNewLink ||= item.querySelector('[data-ordinance-link]');
    }
    shown += batch.length;
    status.textContent = `${matches.length} ordinance${matches.length === 1 ? '' : 's'} found. Showing ${shown}.`;
    more.hidden = shown >= matches.length;
    if (focusNewResults) firstNewLink?.focus();
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

async function search(version, historyMode = 'replace') {
  const query = input.value.trim();
  if (historyMode) updateSearchUrl(historyMode);
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
    // Prioritize exact ordinance numbers, then order by adoption date.
    const ordered = await Promise.all(response.results.map(async result => {
      const data = await result.data();
      const original = itemsByUrl.get(new URL(data.url, document.baseURI).href);
      if (!original) throw new Error(`Missing collection item for ${data.url}`);
      return {
        data,
        exactNumber: original.dataset.ordinanceNumber.toLowerCase() === query.toLowerCase(),
        adoptedDate: original.dataset.adoptedDate || '',
      };
    }));
    if (version !== generation) return;
    ordered.sort((a, b) => Number(b.exactNumber) - Number(a.exactNumber)
      || b.adoptedDate.localeCompare(a.adoptedDate));
    matches = ordered.map(result => result.data);
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
  search(++generation, 'push');
});
filterControls.addEventListener('change', () => {
  clearTimeout(timer);
  search(++generation, 'push');
});
clearFilters.addEventListener('click', () => {
  for (const checkbox of filterControls.querySelectorAll('input:checked')) checkbox.checked = false;
  clearTimeout(timer);
  input.focus();
  search(++generation, 'push');
});
more.addEventListener('click', () => {
  const version = generation;
  showMore(version, true).catch(() => showError(version));
});

window.addEventListener('popstate', () => {
  clearTimeout(timer);
  restoreSearchFromUrl();
  search(++generation, null);
});

restoreSearchFromUrl();
search(++generation, null);
