// Save & settings: the progress file out and back in, the spoiler setting, the ledger's own record, and the
// list of sources this guide cites. Everything on this page works with the network off.

import { el } from '../dom.js';
import { APP, COPY, GRADES, SOURCE_CATALOGUE } from '../config.js';
import { progress as progressOf } from '../filters.js';

export function renderLog(app) {
  const progress = progressOf(app.trophies, app.state);
  const hiddenStory = app.trophies.filter((trophy) => trophy.spoiler && !app.state.earned[trophy.id]).length;
  return el('div', { class: 'page' },
    el('header', { class: 'page-head' },
      el('p', { class: 'stamp' }, 'localStorage · export · import'),
      el('h1', {}, 'Save & settings'),
      el('p', {}, COPY.offline),
    ),
    el('div', { class: 'log-grid' },
      progressCard(app),
      spoilerCard(app, hiddenStory),
      statsCard(app, progress),
      sourcesCard(app),
    ),
  );
}

function progressCard(app) {
  return el('section', { class: 'card' },
    el('h2', {}, 'Your progress file'),
    el('p', {}, 'Export writes a small JSON file with every earned trophy and every counter. Import reads one back: merge it into what is here, or replace it. The file never leaves this browser.'),
    el('div', { class: 'row-actions' },
      el('button', { class: 'btn btn--solid', dataset: { action: 'export' } }, 'Download progress file'),
      el('label', { class: 'btn btn--quiet', style: { cursor: 'pointer' } }, 'Load a file…',
        el('input', {
          type: 'file',
          accept: '.json,application/json',
          class: 'file-input',
          style: { display: 'none' },
          dataset: { action: 'import-file' },
        })),
    ),
    el('div', { class: 'import-box' },
      el('label', { class: 'counter-note', attrs: { for: 'import-text' } }, 'Or paste the file here'),
      el('textarea', {
        id: 'import-text',
        placeholder: '{ "format": "platinum-ledger/progress-v1", "earned": [2, 3], "counters": {} }',
        attrs: { spellcheck: 'false' },
      }),
      el('div', { class: 'row-actions' },
        el('button', { class: 'btn', dataset: { action: 'import-text' } }, 'Read this text'),
      ),
    ),
    app.pendingImport ? pendingImportBlock(app) : null,
    app.importError ? el('p', { class: 'import-warn' }, app.importError) : null,
  );
}

function pendingImportBlock(app) {
  const pending = app.pendingImport;
  return el('div', { class: 'note' },
    el('strong', {}, pending.count + ' earned trophies read. '),
    'Choose how to add them: merging keeps what is here, replacing starts from the file.',
    el('div', { class: 'row-actions', style: { marginTop: '10px' } },
      el('button', { class: 'btn btn--solid', dataset: { action: 'import-merge' } }, 'Merge into my progress'),
      el('button', { class: 'btn', dataset: { action: 'import-replace' } }, 'Replace my progress'),
      el('button', { class: 'btn btn--quiet', dataset: { action: 'import-cancel' } }, 'Cancel'),
    ),
  );
}

function spoilerCard(app, hiddenStory) {
  return el('section', { class: 'card' },
    el('h2', {}, 'Spoiler setting'),
    el('label', { class: 'switch' },
      el('input', {
        type: 'checkbox',
        checked: Boolean(app.state.spoilerFree),
        dataset: { action: 'toggle-spoiler' },
      }),
      'Spoiler-free',
    ),
    el('p', {}, COPY.spoiler),
    el('p', { class: 'counter-note' }, hiddenStory + ' story ' + (hiddenStory === 1 ? 'trophy is' : 'trophies are') + ' sealed right now. Ticking one earned reveals it at once, and the setting never hides a non-story trophy.'),
    el('p', { class: 'counter-note' }, 'Filter chips also separate the list by story, collectibles, activities, the platinum and the unverified missable flags.'),
  );
}

function statsCard(app, progress) {
  const saved = app.state.updatedAt ? new Date(app.state.updatedAt) : null;
  const counters = Object.keys(app.state.counters).length;
  return el('section', { class: 'card' },
    el('h2', {}, 'The ledger'),
    el('ul', { class: 'stat-list' },
      el('li', {}, el('span', {}, 'Earned'), el('b', {}, progress.earned + ' of ' + progress.total)),
      Object.keys(GRADES).map((grade) =>
        el('li', {}, el('span', {}, el('span', { class: 'grade-dot g-' + GRADES[grade].tone, style: { marginRight: '8px' } }), GRADES[grade].label), el('b', {}, progress.byGrade[grade].earned + ' / ' + progress.byGrade[grade].total))),
      el('li', {}, el('span', {}, 'Counters in use'), el('b', {}, String(counters))),
      el('li', {}, el('span', {}, 'Last saved'), el('b', {}, saved ? saved.toLocaleString() : 'not yet')),
    ),
    el('p', { class: 'counter-note' }, 'Progress is written to this browser after every tick, counter or setting change. ' + COPY.counts),
    el('div', { class: 'row-actions' },
      app.confirmReset
        ? el('div', {},
          el('p', { class: 'import-warn' }, 'This clears every tick and counter on this browser. Export first if you want a copy.'),
          el('div', { class: 'row-actions' },
            el('button', { class: 'btn btn--danger', dataset: { action: 'reset-confirm' } }, 'Clear my progress'),
            el('button', { class: 'btn btn--quiet', dataset: { action: 'reset-cancel' } }, 'Keep it'),
          ))
        : el('button', { class: 'btn btn--quiet', dataset: { action: 'reset-ask' } }, 'Clear my progress…'),
    ),
  );
}

function sourcesCard(app) {
  const catalogue = Object.values(SOURCE_CATALOGUE);
  return el('section', { class: 'card' },
    el('h2', {}, 'Sources & method'),
    el('p', {}, COPY.citing),
    el('div', { class: 'src-list' },
      el('ul', {}, catalogue.map((source) =>
        el('li', {},
          el('b', {}, source.label),
          el('span', {}, source.note),
          source.url ? el('a', { href: source.url, attrs: { target: '_blank', rel: 'noopener noreferrer' } }, source.url) : null,
        )))),
    el('p', { class: 'counter-note' }, 'Every one of the ' + APP.trophyTotal + ' trophies carries its own source list in its guide pane; this page names the whole catalogue. No Rockstar logo, artwork or screenshot of the game is used anywhere in this app: the marks are drawn in CSS.'),
  );
}
