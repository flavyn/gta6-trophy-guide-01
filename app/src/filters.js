// The filter rules, the spoiler rule and the progress arithmetic: the places the checklist, the roadmap
// and the missables page agree on. Kept out of the views so a rule is stated once.

import { GRADES, SOURCE_CATALOGUE } from './config.js';

export function makeFilters() {
  return { kind: 'all', grade: 'all', query: '', missableOnly: false };
}

export function kindCounts(trophies) {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, meta: 0 };
  for (const trophy of trophies) {
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
    if (trophy.missable) counts.missable += 1;
  }
  return counts;
}

export function matches(trophy, filters) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  const query = filters.query.trim().toLowerCase();
  if (!query) return true;
  return searchText(trophy).includes(query);
}

export function visible(trophies, filters) {
  return trophies.filter((trophy) => matches(trophy, filters));
}

export function searchText(trophy) {
  return [
    trophy.name,
    trophy.description,
    trophy.guide,
    trophy.group,
    GRADES[trophy.grade] ? GRADES[trophy.grade].label : trophy.grade,
    trophy.counterLabel || '',
    ...(trophy.steps || []),
  ]
    .join(' ')
    .toLowerCase();
}

// The spoiler setting hides a story trophy's name, description and guide until it is earned. It never
// hides a trophy from the list: a reader still sees that a story trophy is there and counted.
export function isHidden(trophy, state) {
  return Boolean(state.spoilerFree) && trophy.spoiler && !state.earned[trophy.id];
}

// Every view that prints a trophy's name goes through this: with spoiler-free on, an unearned story
// trophy has no name to print, wherever it is listed.
export function displayName(trophy, state) {
  return isHidden(trophy, state) ? 'Story trophy, sealed' : trophy.name;
}

export function counterValue(state, trophy) {
  return Math.min(state.counters[trophy.id] || 0, trophy.count || 0);
}

export function progress(trophies, state) {
  const byGrade = {};
  const byStage = {};
  let earned = 0;
  for (const grade of Object.keys(GRADES)) byGrade[grade] = { earned: 0, total: 0 };
  for (const trophy of trophies) {
    const done = Boolean(state.earned[trophy.id]);
    if (done) earned += 1;
    byGrade[trophy.grade].total += 1;
    if (done) byGrade[trophy.grade].earned += 1;
    if (!byStage[trophy.stage]) byStage[trophy.stage] = { earned: 0, total: 0 };
    byStage[trophy.stage].total += 1;
    if (done) byStage[trophy.stage].earned += 1;
  }
  return { earned, total: trophies.length, byGrade, byStage };
}

// The roadmap's "next up": the earliest stage that still has an unearned, non-platinum trophy, and inside
// it the unearned trophy nearest the top of the list. No guesswork about the game: only list order.
export function nextUp(trophies, state) {
  for (const trophy of trophies) {
    if (trophy.kind === 'meta') continue;
    if (!state.earned[trophy.id]) return trophy;
  }
  return trophies.find((trophy) => !state.earned[trophy.id]) || null;
}

export function sourcesFor(trophy) {
  const sources = [];
  sources.push(SOURCE_CATALOGUE.official);
  if (trophy.count) sources.push(SOURCE_CATALOGUE.psnprofiles);
  sources.push(SOURCE_CATALOGUE.reading);
  for (const extra of trophy.sources || []) {
    if (!sources.some((known) => known.label === extra.label)) sources.push(extra);
  }
  return sources;
}
