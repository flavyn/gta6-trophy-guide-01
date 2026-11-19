// The checklist view: a rail that searches and filters, the roster of all 55 trophies grouped by roadmap
// step, and the guide pane for one trophy — official data, our guide, its counters and its sources.

import { el, paint, countLabel, percent } from '../dom.js';
import { COPY, GRADES, KIND_CHIPS, STAGES } from '../config.js';
import {
  counterValue,
  isHidden,
  kindCounts,
  sourcesFor,
  visible,
} from '../filters.js';

export function renderBrowse(app) {
  return el(
    'div',
    { class: 'browse' },
    renderRail(app),
    renderGuidePane(app),
  );
}

function renderRail(app) {
  const counts = kindCounts(app.trophies);
  const shown = visible(app.trophies, app.filters).length;
  return el(
    'aside',
    { class: 'rail' },
    el(
      'div',
      { class: 'rail-controls' },
      el('label', { class: 'search' }, el('input', {
        id: 'search',
        type: 'search',
        value: app.filters.query,
        placeholder: 'Search trophies, steps, sources…',
        autocomplete: 'off',
        attrs: { 'aria-label': 'Search the trophy list' },
        dataset: { action: 'search' },
      })),
      el(
        'div',
        { class: 'chips', attrs: { role: 'group', 'aria-label': 'Filter by kind' } },
        KIND_CHIPS.map((chip) =>
          el('button', {
            class: 'chip',
            dataset: { action: 'chip', kind: chip.id },
            attrs: { 'aria-pressed': String(app.filters.kind === chip.id) },
          }, chip.label, el('b', {}, String(counts[chip.id] || 0))),
        ),
        el('span', { class: 'chip chip--empty', attrs: { title: COPY.online } }, 'Online', el('b', {}, '0')),
      ),
      el(
        'div',
        { class: 'rail-switches' },
        el('label', { class: 'switch' },
          el('input', {
            type: 'checkbox',
            checked: app.filters.missableOnly,
            dataset: { action: 'toggle-missable' },
          }),
          'Missable only'),
        el('label', { class: 'switch' },
          el('input', {
            type: 'checkbox',
            checked: Boolean(app.state.spoilerFree),
            dataset: { action: 'toggle-spoiler' },
          }),
          'Spoiler-free'),
      ),
      el(
        'div',
        { class: 'rail-sub' },
        el('select', {
          class: 'select',
          attrs: { 'aria-label': 'Filter by grade' },
          dataset: { action: 'grade' },
        },
          el('option', { value: 'all', selected: app.filters.grade === 'all' }, 'Every grade'),
          Object.keys(GRADES).map((grade) =>
            el('option', { value: grade, selected: app.filters.grade === grade }, GRADES[grade].label)),
        ),
        el('span', { id: 'rail-count' }, shown === app.trophies.length ? app.trophies.length + ' shown' : shown + ' of ' + app.trophies.length + ' shown'),
      ),
      el('p', { class: 'counter-note rail-note' }, COPY.online),
      el('div', { class: 'rail-actions' },
        el('button', { class: 'btn btn--quiet', dataset: { action: 'export' } }, 'Export progress'),
        el('label', { class: 'btn btn--quiet', style: { cursor: 'pointer' } }, 'Import…',
          el('input', {
            type: 'file',
            accept: '.json,application/json',
            class: 'file-input',
            style: { display: 'none' },
            dataset: { action: 'import-file' },
          })),
      ),
    ),
    renderRoster(app),
  );
}

export function renderRoster(app) {
  const list = visible(app.trophies, app.filters);
  const roster = el('ol', { class: 'roster', id: 'roster' });
  if (list.length === 0) {
    roster.appendChild(el('li', { class: 'empty' },
      el('strong', {}, 'Nothing matches'),
      el('span', {}, 'Clear the search or pick another chip.'),
    ));
    return roster;
  }
  let stage = null;
  for (const trophy of list) {
    if (trophy.stage !== stage) {
      stage = trophy.stage;
      const meta = STAGES.find((entry) => entry.id === stage);
      roster.appendChild(el('li', { class: 'roster-sep' }, 'Step ' + stage + ' · ' + (meta ? meta.title : 'Roadmap')));
    }
    roster.appendChild(renderRow(app, trophy));
  }
  return roster;
}

function renderRow(app, trophy) {
  const earned = Boolean(app.state.earned[trophy.id]);
  const hidden = isHidden(trophy, app.state);
  const selected = app.selectedId === trophy.id;
  const note = [
    GRADES[trophy.grade].label,
    trophy.group,
    trophy.count ? countLabel(trophy.count) + ' target' : null,
    trophy.missable ? 'may be missed' : null,
  ].filter(Boolean).join(' · ');

  return el('li', {
    class: 'row-item' + (hidden ? ' is-locked' : ''),
    dataset: { earned: String(earned), id: String(trophy.id) },
    attrs: { 'aria-current': selected ? 'true' : 'false' },
  },
    el('button', {
      class: 'check',
      dataset: { action: 'toggle-earned', id: String(trophy.id) },
      attrs: {
        'aria-checked': String(earned),
        role: 'checkbox',
        'aria-label': (earned ? 'Mark unearned: ' : 'Mark earned: ') + trophy.name,
      },
    }, earned ? '✓' : ''),
    el('button', {
      class: 'row-main',
      dataset: { action: 'select', id: String(trophy.id) },
    },
      el('span', { class: 'row-name' }, hidden ? 'Story trophy, sealed' : trophy.name,
        el('span', { class: 'row-note' }, hidden ? 'Spoiler-free · Step ' + trophy.stage : note)),
    ),
    el('span', {
      class: 'grade-dot g-' + GRADES[trophy.grade].tone,
      attrs: { title: GRADES[trophy.grade].label + ' trophy' },
    }),
  );
}

export function renderGuidePane(app) {
  const trophy = app.trophies.find((entry) => entry.id === app.selectedId) || app.trophies[0];
  if (!trophy) return el('section', { class: 'guide empty' }, 'No trophies loaded.');
  if (isHidden(trophy, app.state)) return renderSealedGuide(app, trophy);
  return renderDetail(app, trophy);
}

function renderSealedGuide(app, trophy) {
  const sealed = app.trophies.filter((entry) => entry.spoiler && !app.state.earned[entry.id]).length;
  return el('section', { class: 'guide' },
    el('div', { class: 'locked' },
      el('p', { class: 'stamp', style: { letterSpacing: '.14em', textTransform: 'uppercase', fontSize: '11px', color: 'var(--ink-3)' } }, 'Spoiler-free · Step ' + trophy.stage),
      el('h1', {}, 'A story trophy, still sealed'),
      el('p', {}, 'Spoiler-free is on, so a story trophy keeps its name, its description and its guide to itself until you tick it earned. There are ' + app.storyTotal + ' story trophies on this list and ' + sealed + ' of them are still sealed; none of them can be missed by finishing the story.'),
      el('span', { class: 'locked-rule' }),
      el('div', { class: 'row-actions' },
        el('button', { class: 'btn btn--solid', dataset: { action: 'spoiler-off' } }, 'Turn spoiler-free off'),
        el('button', { class: 'btn btn--quiet', dataset: { action: 'toggle-earned', id: String(trophy.id) } }, 'I have earned it'),
      ),
      el('p', { class: 'counter-note' }, COPY.spoiler),
    ),
  );
}

function renderDetail(app, trophy) {
  const earned = Boolean(app.state.earned[trophy.id]);
  const stageMeta = STAGES.find((entry) => entry.id === trophy.stage);
  const eyebrow = [
    GRADES[trophy.grade].label,
    trophy.group,
    'Step ' + trophy.stage + ' of ' + STAGES.length,
  ].filter(Boolean);

  return el('section', { class: 'guide', id: 'guide' },
    el('header', { class: 'guide-head' },
      el('div', { class: 'medal medal--' + GRADES[trophy.grade].tone, attrs: { 'aria-hidden': 'true' } }, GRADES[trophy.grade].letter),
      el('div', { class: 'guide-title' },
        el('p', { class: 'eyebrow' }, joinEyebrow(eyebrow)),
        el('h1', {}, trophy.name),
        el('p', { class: 'official' }, '“' + trophy.description + '” ',
          el('cite', {}, 'Official description · Exophase')),
      ),
      el('div', { class: 'earn' },
        el('button', {
          class: 'earn-btn',
          dataset: { action: 'toggle-earned', id: String(trophy.id) },
          attrs: { 'aria-pressed': String(earned) },
        }, earned ? 'Earned ✓' : 'Mark earned'),
        el('span', { class: 'earn-note' }, earned ? 'Saved in this browser' : 'Saved as you tick'),
      ),
    ),
    el('div', { class: 'flags' },
      el('span', { class: 'flag flag--story' }, trophy.kind === 'story' ? 'Story' : trophy.kind === 'collectibles' ? 'Collectible' : trophy.kind === 'meta' ? 'Platinum' : 'Activity'),
      trophy.missable ? el('span', { class: 'flag flag--risk' }, 'Missable · unverified') : null,
      trophy.count ? el('span', { class: 'flag flag--count' }, countLabel(trophy.count) + ' target') : null,
      trophy.spoiler ? el('span', { class: 'flag' }, 'Story · hidden by spoiler mode') : null,
      el('span', { class: 'flag' }, 'Step ' + trophy.stage + ' of ' + STAGES.length),
    ),
    el('div', { class: 'guide-body' },
      el('div', { class: 'detail-grid' },
        el('div', { class: 'detail-main' },
          el('section', {},
            el('h2', {}, 'How to earn it'),
            el('p', { class: 'lede' }, trophy.guide),
            trophy.steps.length
              ? el('ol', { class: 'steps' }, trophy.steps.map((step) => el('li', {}, step)))
              : null,
          ),
          el('div', { class: 'panel' },
            el('h2', {}, 'Can it be missed?'),
            trophy.missable
              ? el('p', { class: 'risk' }, trophy.missableWhy)
              : el('p', {}, 'The description names no single moment, partner or unique target, so there is no window to lose: the trophy stays available while the activity does.'),
            trophy.missable ? el('p', {}, 'Flagged from the description, not confirmed in the game: see the missables page for the other flags.') : null,
          ),
        ),
        el('aside', { class: 'detail-side' },
          trophy.count ? renderCounter(app, trophy) : null,
          renderSources(trophy),
          el('div', { class: 'panel' },
            el('h2', {}, 'Roadmap step'),
            el('p', {}, 'Step ' + trophy.stage + ' — ' + (stageMeta ? stageMeta.title : '') + '. ',
              el('a', { href: '#/roadmap' }, 'Open the roadmap')),
          ),
        ),
      ),
    ),
  );
}

function joinEyebrow(parts) {
  const nodes = [];
  parts.forEach((part, index) => {
    if (index > 0) nodes.push(el('span', { class: 'sep' }, '·'));
    nodes.push(el('span', {}, part));
  });
  return nodes;
}

function renderCounter(app, trophy) {
  const value = counterValue(app.state, trophy);
  const pct = percent(value, trophy.count);
  return el('section', { class: 'counter' },
    el('h2', {}, 'PSN progress target'),
    el('div', { class: 'counter-row' },
      el('span', { class: 'counter-val' }, countLabel(value), el('small', {}, ' / ' + countLabel(trophy.count))),
      el('button', { class: 'step-btn', dataset: { action: 'counter', id: String(trophy.id), delta: '-1' }, attrs: { 'aria-label': 'One fewer' } }, '−'),
      el('button', { class: 'step-btn', dataset: { action: 'counter', id: String(trophy.id), delta: '1' }, attrs: { 'aria-label': 'One more' } }, '+'),
      el('button', { class: 'btn btn--quiet', dataset: { action: 'counter-max', id: String(trophy.id) } }, 'Fill target'),
    ),
    el('div', { class: 'meter' }, el('i', { style: { width: pct + '%' } })),
    el('p', { class: 'counter-note' }, trophy.counterLabel
      ? trophy.counterLabel + ' — the target is PSN’s, from PSNProfiles; the counter is a helper.'
      : 'The target is PSN’s, from PSNProfiles; the counter is a helper and the trophy still pops in-game.'),
  );
}

function renderSources(trophy) {
  const sources = sourcesFor(trophy);
  return el('section', {},
    el('h2', {}, 'Sources'),
    el('ul', { class: 'sources' }, sources.map((source) =>
      el('li', {},
        el('b', {}, source.label),
        el('span', {}, source.note),
        source.url ? el('a', { href: source.url, attrs: { target: '_blank', rel: 'noopener noreferrer' } }, source.url) : null,
      ))),
    el('p', { class: 'counter-note', style: { marginTop: '8px' } }, 'Every guide names its sources here, beside it.'),
  );
}

export function paintRoster(app) {
  const holder = document.getElementById('roster');
  if (holder) paint(holder, ...renderRoster(app).childNodes);
}
