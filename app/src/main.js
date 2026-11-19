// Boot, routing and the one click handler: the app keeps a single state object, re-renders the active view
// after every change, and writes progress to localStorage each time. No request leaves this page.

import { APP, COPY, SOURCE_CATALOGUE, VIEWS } from './config.js';
import { el, paint, percent } from './dom.js';
import { byId, loadTrophyData } from './data.js';
import {
  clearProgress,
  exportText,
  mergeInto,
  parseImport,
  readState,
  setCounter,
  setSpoilerFree,
  toggleEarned,
  writeState,
} from './store.js';
import { makeFilters, nextUp, progress as progressOf } from './filters.js';
import { paintRoster, renderBrowse } from './views/browse.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderMissables } from './views/missables.js';
import { renderLog } from './views/log.js';

const app = {
  trophies: [],
  state: readState(),
  filters: makeFilters(),
  view: 'browse',
  selectedId: null,
  storyTotal: 0,
  pendingImport: null,
  importError: '',
  confirmReset: false,
  toastTimer: 0,
  scrolls: { roster: 0, window: 0 },
};

boot();

async function boot() {
  paintColophon();
  try {
    app.trophies = await loadTrophyData(APP.dataUrl);
    app.storyTotal = app.trophies.filter((trophy) => trophy.kind === 'story').length;
    app.selectedId = pickOpeningTrophy();
    route();
    wireEvents();
    document.documentElement.dataset.ready = 'true';
  } catch (error) {
    showLoadError(error);
  }
}

function pickOpeningTrophy() {
  const next = nextUp(app.trophies, app.state);
  return next ? next.id : app.trophies[0].id;
}

function route() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts[0] === 'trophy' && parts[1]) {
    const trophy = byId(app.trophies, parts[1]);
    if (trophy) {
      app.view = 'browse';
      app.selectedId = trophy.id;
    }
  } else if (['browse', 'roadmap', 'missables', 'log'].includes(parts[0])) {
    app.view = parts[0];
  }
  if (app.selectedId === null) app.selectedId = pickOpeningTrophy();
  render();
}

function render(keepScroll = true) {
  if (keepScroll) app.scrolls = readScrolls();
  paintTabs();
  paintLedger();
  const stage = document.getElementById('stage');
  const node = app.view === 'roadmap' ? renderRoadmap(app)
    : app.view === 'missables' ? renderMissables(app)
      : app.view === 'log' ? renderLog(app)
        : renderBrowse(app);
  paint(stage, node);
  paintLedger();
  restoreScrolls();
}

function paintTabs() {
  paint(document.getElementById('tabs'), ...VIEWS.map((view) => el('a', {
    class: 'tab',
    href: '#/' + view.id,
    attrs: { 'aria-current': app.view === view.id ? 'page' : null },
  }, view.label)));
}

function paintLedger() {
  const progress = progressOf(app.trophies, app.state);
  const number = document.getElementById('ledger-num');
  const bar = document.getElementById('ledger-bar');
  if (number) number.textContent = String(progress.earned);
  if (bar) bar.style.width = percent(progress.earned, progress.total) + '%';
  const unit = document.querySelector('.ledger-of');
  if (unit) unit.textContent = 'of ' + progress.total + ' earned';
}

function paintColophon() {
  const holder = document.getElementById('colophon-src');
  if (!holder) return;
  paint(holder,
    'Sources: the official trophy list on ',
    el('a', { href: SOURCE_CATALOGUE.official.url, attrs: { target: '_blank', rel: 'noopener noreferrer' } }, 'Exophase'),
    ' for names, descriptions and grades, and ',
    el('a', { href: SOURCE_CATALOGUE.psnprofiles.url, attrs: { target: '_blank', rel: 'noopener noreferrer' } }, 'PSNProfiles'),
    ' for PSN progress targets. Guide text is ours, read from those descriptions — nothing here was checked in the game.',
  );
}

function showLoadError(error) {
  paint(document.getElementById('stage'), el('div', { class: 'empty' },
    el('strong', {}, 'The trophy file did not load'),
    el('span', {}, 'trophies.json answered: ' + error.message),
    el('span', {}, 'Serve this folder over HTTP — a static server with app/ at its root, such as node serve.ts — and reload. Browsers refuse to read a JSON file from a file:// page.'),
  ));
}

function readScrolls() {
  const roster = document.getElementById('roster');
  return { roster: roster ? roster.scrollTop : 0, window: window.scrollY };
}

function restoreScrolls() {
  const roster = document.getElementById('roster');
  if (roster) roster.scrollTop = app.scrolls.roster;
  window.scrollTo(0, app.scrolls.window);
}

function save(next) {
  app.state = next;
  if (!writeState(app.state)) toast('This browser refused the storage write: progress is live but not saved.');
}

function wireEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('hashchange', () => route());
}

function onClick(event) {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const name = control.dataset.action;
  const id = Number(control.dataset.id);

  if (name === 'select') {
    app.selectedId = id;
    history.replaceState(null, '', '#/trophy/' + id);
    rerenderBrowse();
    return;
  }
  if (name === 'toggle-earned') {
    event.preventDefault();
    save(toggleEarned(app.state, id));
    const trophy = byId(app.trophies, id);
    toast(app.state.earned[id] ? 'Marked earned: ' + trophy.name : 'Marked unearned: ' + trophy.name);
    rerenderBrowse();
    return;
  }
  if (name === 'counter') {
    const trophy = byId(app.trophies, id);
    const delta = Number(control.dataset.delta || 0);
    const current = app.state.counters[id] || 0;
    save(setCounter(app.state, id, current + delta, trophy.count));
    rerenderBrowse();
    return;
  }
  if (name === 'counter-max') {
    const trophy = byId(app.trophies, id);
    save(setCounter(app.state, id, trophy.count, trophy.count));
    toast('Counter filled: ' + trophy.name);
    rerenderBrowse();
    return;
  }
  if (name === 'chip') {
    app.filters.kind = control.dataset.kind;
    markChips();
    paintRoster(app);
    paintRailCount();
    return;
  }
  if (name === 'spoiler-off') {
    save(setSpoilerFree(app.state, false));
    toast('Spoiler-free is off: story trophies are readable');
    render(false);
    return;
  }
  if (name === 'export') return downloadProgress();
  if (name === 'import-text') return readPastedImport();
  if (name === 'import-merge' || name === 'import-replace') {
    return applyImport(name === 'import-merge' ? 'merge' : 'replace');
  }
  if (name === 'import-cancel') {
    app.pendingImport = null;
    app.importError = '';
    render(false);
    return;
  }
  if (name === 'reset-ask') {
    app.confirmReset = true;
    render(false);
    return;
  }
  if (name === 'reset-cancel') {
    app.confirmReset = false;
    render(false);
    return;
  }
  if (name === 'reset-confirm') {
    save(clearProgress(app.state));
    app.confirmReset = false;
    toast('Progress cleared');
    render(false);
  }
}

function onChange(event) {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const name = control.dataset.action;
  if (name === 'grade') {
    app.filters.grade = control.value;
    paintRoster(app);
    paintRailCount();
    return;
  }
  if (name === 'toggle-missable') {
    app.filters.missableOnly = control.checked;
    paintRoster(app);
    paintRailCount();
    return;
  }
  if (name === 'toggle-spoiler') {
    save(setSpoilerFree(app.state, control.checked));
    render(false);
    return;
  }
  if (name === 'import-file') {
    const file = control.files && control.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => readImportText(String(reader.result || ''));
    reader.onerror = () => {
      app.importError = 'That file could not be read.';
      render(false);
    };
    reader.readAsText(file);
  }
}

function onInput(event) {
  const control = event.target.closest('[data-action="search"]');
  if (!control) return;
  app.filters.query = control.value;
  paintRoster(app);
  paintRailCount();
}

function onKeydown(event) {
  if (event.key !== 'Escape') return;
  if (app.pendingImport || app.confirmReset) {
    app.pendingImport = null;
    app.confirmReset = false;
    app.importError = '';
    render(false);
    return;
  }
  const search = document.getElementById('search');
  if (search && document.activeElement === search) {
    search.value = '';
    app.filters.query = '';
    paintRoster(app);
    paintRailCount();
  }
}

function rerenderBrowse() {
  if (app.view !== 'browse') return render(false);
  const scrolls = readScrolls();
  paint(document.getElementById('stage'), renderBrowse(app));
  const roster = document.getElementById('roster');
  if (roster) roster.scrollTop = scrolls.roster;
  window.scrollTo(0, scrolls.window);
  paintLedger();
}

function markChips() {
  for (const chip of document.querySelectorAll('.chip')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.kind === app.filters.kind));
  }
}

function paintRailCount() {
  const holder = document.getElementById('rail-count');
  if (!holder) return;
  const shown = document.querySelectorAll('#roster .row-item').length;
  holder.textContent = shown === app.trophies.length
    ? app.trophies.length + ' shown'
    : shown + ' of ' + app.trophies.length + ' shown';
}

function downloadProgress() {
  const blob = new Blob([exportText(app.state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: APP.exportName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Progress file written: ' + APP.exportName);
}

function readPastedImport() {
  const box = document.getElementById('import-text');
  readImportText(box ? box.value : '');
}

function readImportText(text) {
  const result = parseImport(text);
  app.importError = '';
  if (!result.ok) {
    app.pendingImport = null;
    app.importError = result.error;
    showLogView();
    return;
  }
  app.pendingImport = { state: result.state, count: countKnown(result.state) };
  showLogView();
}

// An import can start from the checklist rail: the confirm panel lives on the save page, so the app
// moves there rather than leaving a reader with a file they cannot see.
function showLogView() {
  app.view = 'log';
  if (window.location.hash !== '#/log') history.replaceState(null, '', '#/log');
  render(false);
}

function countKnown(state) {
  let known = 0;
  for (const id of Object.keys(state.earned)) if (byId(app.trophies, id)) known += 1;
  return known;
}

function applyImport(mode) {
  if (!app.pendingImport) return;
  save(mergeInto(app.state, app.pendingImport.state, mode));
  app.pendingImport = null;
  app.importError = '';
  toast('Progress ' + (mode === 'merge' ? 'merged from' : 'replaced by') + ' the file');
  render(false);
}

function toast(message) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(app.toastTimer);
  app.toastTimer = window.setTimeout(() => { node.hidden = true; }, 2600);
}
