// The roadmap: the seven steps the official descriptions imply, each with its trophies, its progress and
// the next trophy to take. Built only from the list's own chapters, missions, counts and order.

import { el, countLabel, percent } from '../dom.js';
import { COPY, GRADES, STAGES } from '../config.js';
import { displayName, progress as progressOf, nextUp } from '../filters.js';

export function renderRoadmap(app) {
  const progress = progressOf(app.trophies, app.state);
  const next = nextUp(app.trophies, app.state);
  const page = el('div', { class: 'page' },
    el('header', { class: 'page-head' },
      el('p', { class: 'stamp' }, STAGES.length + ' steps · built from the official descriptions'),
      el('h1', {}, 'The road to the platinum'),
      el('p', {}, COPY.roadmap),
    ),
    summaryCard(app, progress, next),
  );
  for (const stage of STAGES) {
    page.appendChild(stageCard(app, stage, progress));
  }
  return page;
}

function summaryCard(app, progress, next) {
  const pct = percent(progress.earned, progress.total);
  return el('section', { class: 'stagecard summary' },
    el('div', { class: 'stagecard-head' },
      el('span', { class: 'stagecard-num', attrs: { 'aria-hidden': 'true' } }, '★'),
      el('h2', {}, progress.earned + ' of ' + progress.total + ' earned'),
      el('span', { class: 'count-tag' }, pct + '% of the platinum'),
    ),
    el('div', { class: 'meter' }, el('i', { style: { width: pct + '%' } })),
    el('div', { class: 'panels summary-panels' },
      el('div', { class: 'panel' },
        el('h2', {}, 'By grade'),
        el('ul', { class: 'stat-list' }, Object.keys(GRADES).map((grade) => {
          const row = progress.byGrade[grade];
          return el('li', {},
            el('span', {}, el('span', { class: 'grade-dot g-' + GRADES[grade].tone, style: { marginRight: '8px' } }), GRADES[grade].label),
            el('b', {}, row.earned + ' / ' + row.total));
        })),
      ),
      el('div', { class: 'panel' },
        el('h2', {}, 'Next up'),
        next
          ? el('div', {},
            el('p', {}, el('a', { href: '#/trophy/' + next.id }, displayName(next, app.state)), ' — step ' + next.stage + '.'),
            el('p', { style: { marginTop: '6px' } }, el('a', { href: '#/trophy/' + next.id }, 'Open its guide')))
          : el('p', {}, 'Every trophy is ticked. The platinum is yours.'),
      ),
    ),
  );
}

function stageCard(app, stage, progress) {
  const rows = app.trophies.filter((trophy) => trophy.stage === stage.id);
  const counts = progress.byStage[stage.id] || { earned: 0, total: rows.length };
  const pct = percent(counts.earned, counts.total);
  const risks = rows.filter((trophy) => trophy.missable);
  const blurb = app.state.spoilerFree && stage.sealedBlurb ? stage.sealedBlurb : stage.blurb;
  return el('section', { class: 'stagecard', id: 'step-' + stage.id },
    el('div', { class: 'stagecard-head' },
      el('span', { class: 'stagecard-num', attrs: { 'aria-hidden': 'true' } }, String(stage.id)),
      el('h2', {}, stage.title),
      el('span', { class: 'count-tag' }, counts.earned + ' / ' + counts.total + ' earned'),
    ),
    el('p', {}, blurb),
    el('div', { class: 'meter' }, el('i', { style: { width: pct + '%' } })),
    el('div', { class: 'trophy-links' }, rows.map((trophy) => trophyLink(app, trophy))),
    risks.length
      ? el('p', { class: 'counter-note' }, 'Unverified missable flags in this step: ' +
        risks.map((trophy) => displayName(trophy, app.state)).join(', ') + '. ' + COPY.missable)
      : null,
  );
}

function trophyLink(app, trophy) {
  const earned = Boolean(app.state.earned[trophy.id]);
  return el('a', {
    class: 'tlink',
    href: '#/trophy/' + trophy.id,
    dataset: { earned: String(earned) },
    attrs: { title: GRADES[trophy.grade].label + ' · ' + trophy.group },
  },
    earned ? el('span', { class: 'tlink-tick' }, '✓') : el('span', { class: 'grade-dot g-' + GRADES[trophy.grade].tone }),
    displayName(trophy, app.state),
    trophy.count ? el('span', { class: 'count-tag' }, countLabel(trophy.count)) : null,
    trophy.missable ? el('span', { class: 'risk-dot', attrs: { title: 'Unverified missable flag' } }) : null,
  );
}
