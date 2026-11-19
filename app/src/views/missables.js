// The missables page: every unverified flag with the sentence of the official description that earns it,
// and the story-locked trophies that cannot be missed at all. Two lists, never mixed.

import { el } from '../dom.js';
import { COPY, GRADES, STAGES } from '../config.js';
import { displayName, isHidden } from '../filters.js';

export function renderMissables(app) {
  const flagged = app.trophies.filter((trophy) => trophy.missable);
  const story = app.trophies.filter((trophy) => trophy.kind === 'story');
  const page = el('div', { class: 'page' },
    el('header', { class: 'page-head' },
      el('p', { class: 'stamp' }, flagged.length + ' unverified flags · ' + story.length + ' story trophies'),
      el('h1', {}, 'What can be missed'),
      el('p', {}, COPY.missable),
    ),
    el('p', { class: 'note' },
      el('strong', {}, 'A flag is not a countdown. '),
      'It marks a condition you do not get to schedule — one story moment, one partner, one unique target. Finish the story in order and each one still comes to you.'),
    flagTable(app, flagged),
    el('header', { class: 'page-head' },
      el('p', { class: 'stamp' }, 'Story-locked, not missable'),
      el('h2', {}, 'The story trophies'),
      el('p', {}, 'These ' + story.length + ' trophies are the story itself: each is awarded for finishing a chapter, the final mission or a named mission. Nothing in the official list puts a deadline on them, so the only way to miss one is not to finish the story.'),
    ),
    storyTable(app, story),
    el('header', { class: 'page-head' },
      el('p', { class: 'stamp' }, 'Counts and collectibles'),
      el('h2', {}, 'What the list does not time'),
      el('p', {}, 'Every count target (42 shooting-range challenges, 250 stunts, 100 WAiNK It spots, the rest) is checked by the tracker, and none of them carries a window in the official description. They are flagged as counts, never as missables. ' + COPY.counts),
    ),
  );
  return page;
}

function flagTable(app, flagged) {
  const table = el('table', { class: 'miss-table' },
    el('caption', { class: 'counter-note', style: { textAlign: 'left', padding: '0 0 10px' } }, 'Unverified: read from the official descriptions, not confirmed in the game.'),
    el('thead', {}, el('tr', {},
      el('th', {}, 'Trophy'),
      el('th', {}, 'Step'),
      el('th', {}, 'Why the description flags it'),
      el('th', {}, 'What to watch'),
    )),
    el('tbody', {}, flagged.map((trophy) => {
      const stage = STAGES.find((entry) => entry.id === trophy.stage);
      return el('tr', {},
        el('td', { class: 'name' },
          el('a', { href: '#/trophy/' + trophy.id }, displayName(trophy, app.state)),
          el('div', { class: 'counter-note' }, GRADES[trophy.grade].label + ' · ' + trophy.group)),
        el('td', { class: 'when' }, String(trophy.stage) + (stage ? ' · ' + stage.title : '')),
        el('td', { class: 'why' }, trophy.missableWhy),
        el('td', { class: 'why' }, trophy.missableWatch || 'Do it the first time the condition appears.'),
      );
    })),
  );
  return el('div', {}, table);
}

function storyTable(app, story) {
  const table = el('table', { class: 'miss-table' },
    el('thead', {}, el('tr', {},
      el('th', {}, 'Trophy'),
      el('th', {}, 'Awarded for'),
      el('th', {}, 'Step'),
      el('th', {}, 'Status'),
    )),
    el('tbody', {}, story.map((trophy) =>
      el('tr', {},
        el('td', { class: 'name' }, el('a', { href: '#/trophy/' + trophy.id }, displayName(trophy, app.state)),
          el('div', { class: 'counter-note' }, GRADES[trophy.grade].label + ' · ' + trophy.group)),
        el('td', { class: 'why' }, isHidden(trophy, app.state) ? 'Sealed by spoiler-free until you earn it.' : trophy.description),
        el('td', { class: 'when' }, String(trophy.stage)),
        el('td', {}, app.state.earned[trophy.id] ? el('span', { class: 'flag flag--story' }, 'Earned') : el('span', { class: 'flag' }, 'Not yet')),
      ))),
  );
  return el('div', {}, table);
}
