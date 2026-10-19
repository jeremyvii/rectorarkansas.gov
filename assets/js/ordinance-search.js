const container = document.querySelector('#ordinance-search');
const form = container.querySelector('form');
const input = form.querySelector('input');
const status = document.querySelector('#ordinance-search-status');
const results = document.querySelector('#ordinance-search-results');
const list = document.querySelector('#ordinance-list');
const filterControls = document.querySelector('#ordinance-search-filters');
const clearFilters = document.querySelector('#ordinance-search-clear-filters');
// Reuse the collection items rendered by Liquid for both browsing and searching.
const itemsByUrl = new Map(
  Array.from(list.children, item => [item.querySelector('[data-ordinance-link]').href, item])
);
let pagefind;
let generation = 0;
let timer;

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

// Pagefind returns results in relevance order. Use that order to break date ties.
function compareResults(a, b, query) {
  const exact = item => item.dataset.ordinanceNumber.toLowerCase() === query.toLowerCase();
  return Number(exact(b)) - Number(exact(a))
    || b.dataset.adoptedDate.localeCompare(a.dataset.adoptedDate)
    || Number(a.dataset.searchRank) - Number(b.dataset.searchRank);
}

function renderResult(data, rank, query) {
  const url = new URL(data.url, document.baseURI).href;
  const original = itemsByUrl.get(url);
  if (!original) throw new Error(`Missing collection item for ${data.url}`);

  const item = original.cloneNode(true);
  item.dataset.searchRank = rank;
  const excerpt = item.querySelector('[data-search-excerpt]');
  // Pagefind escapes source HTML before adding its search-term marks.
  excerpt.innerHTML = data.excerpt || '';
  excerpt.hidden = !query || !data.excerpt;

  const next = Array.from(results.children).find(other => compareResults(item, other, query) < 0);
  results.insertBefore(item, next || null);
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
    const count = response.results.length;
    if (!count) {
      status.textContent = 'No ordinances found. Try another search term or change the filters.';
      return;
    }
    // Render each match as it loads; don't wait for every excerpt to be ready.
    await Promise.all(response.results.map(async (result, rank) => {
      const data = await result.data();
      if (version === generation) renderResult(data, rank, query);
    }));
    if (version !== generation) return;
    status.textContent = `${count} ordinance${count === 1 ? '' : 's'} found.`;
  } catch {
    if (version !== generation) return;
    // Invalidate any pending result loads before restoring the browse list.
    generation++;
    status.textContent = 'Search is temporarily unavailable. Please browse the ordinance list below.';
    list.hidden = false;
    results.hidden = true;
  }
}

input.addEventListener('input', () => {
  clearTimeout(timer);
  const version = ++generation;
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

window.addEventListener('popstate', () => {
  clearTimeout(timer);
  restoreSearchFromUrl();
  search(++generation, null);
});

restoreSearchFromUrl();
search(++generation, null);
