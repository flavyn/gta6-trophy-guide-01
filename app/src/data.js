// Reading app/data/trophies.json at run time and normalising every item once, so the views never have to
// guard against a missing key: the file is data, and this module is its contract.

import { GRADES, STAGES } from './config.js';

const STAGE_IDS = new Set(STAGES.map((stage) => stage.id));

export async function loadTrophyData(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('trophies.json answered ' + response.status);
  const document = await response.json();
  const list = Array.isArray(document) ? document : document.trophies;
  if (!Array.isArray(list) || list.length === 0) throw new Error('trophies.json carries no trophies array');
  return normalizeTrophies(list);
}

export function normalizeTrophies(list) {
  const seen = new Set();
  const trophies = [];
  for (const raw of list) {
    if (!raw || typeof raw.name !== 'string' || typeof raw.guide !== 'string') continue;
    if (seen.has(raw.name)) continue;
    seen.add(raw.name);
    const grade = Object.keys(GRADES).includes(raw.grade) ? raw.grade : 'bronze';
    const count = Number.isFinite(raw.count) && raw.count > 0 ? Math.round(raw.count) : null;
    trophies.push({
      id: Number.isFinite(raw.id) ? Math.round(raw.id) : trophies.length + 1,
      name: raw.name,
      description: typeof raw.description === 'string' ? raw.description : '',
      grade,
      kind: ['story', 'collectibles', 'activities', 'meta'].includes(raw.kind) ? raw.kind : 'activities',
      group: typeof raw.group === 'string' ? raw.group : kindLabel(raw.kind),
      stage: STAGE_IDS.has(raw.stage) ? raw.stage : 4,
      spoiler: raw.kind === 'story',
      count,
      counterLabel: typeof raw.counterLabel === 'string' ? raw.counterLabel : null,
      missable: raw.missable === true,
      missableWhy: typeof raw.missableWhy === 'string' ? raw.missableWhy : '',
      missableWatch: typeof raw.missableWatch === 'string' ? raw.missableWatch : '',
      guide: raw.guide.trim(),
      steps: Array.isArray(raw.steps) ? raw.steps.filter((step) => typeof step === 'string' && step.trim()) : [],
      sources: Array.isArray(raw.sources) ? raw.sources.filter((s) => s && s.label) : [],
    });
  }
  // The list is read in roadmap order, not trophy-id order: the platinum (step 7) sits last, where a reader
  // earns it, and every stage's trophies keep their official order inside it.
  return trophies.sort((a, b) => a.stage - b.stage || a.id - b.id);
}

function kindLabel(kind) {
  if (kind === 'story') return 'Story';
  if (kind === 'collectibles') return 'Collectible';
  if (kind === 'meta') return 'Platinum';
  return 'Activity';
}

export function byId(trophies, id) {
  return trophies.find((trophy) => trophy.id === Number(id)) || null;
}
