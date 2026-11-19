// Progress: one small object in localStorage, written on every change, plus a plain JSON file the reader
// can download and load back. Nothing here talks to anything but this browser's own storage.

import { APP } from './config.js';

export function emptyState() {
  return { version: 1, earned: {}, counters: {}, spoilerFree: true, updatedAt: null };
}

export function readState() {
  try {
    const raw = window.localStorage.getItem(APP.storageKey);
    if (!raw) return emptyState();
    return sanitize(JSON.parse(raw));
  } catch (error) {
    return emptyState();
  }
}

export function writeState(state) {
  try {
    window.localStorage.setItem(APP.storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    return false;
  }
}

export function sanitize(raw) {
  const state = emptyState();
  if (!raw || typeof raw !== 'object') return state;
  const earned = raw.earned;
  if (Array.isArray(earned)) {
    for (const value of earned) {
      const id = Number(value);
      if (Number.isInteger(id)) state.earned[id] = true;
    }
  } else if (earned && typeof earned === 'object') {
    for (const [key, value] of Object.entries(earned)) {
      const id = Number(key);
      if (Number.isInteger(id) && value === true) state.earned[id] = true;
    }
  }
  const counters = raw.counters;
  if (counters && typeof counters === 'object') {
    for (const [key, value] of Object.entries(counters)) {
      const id = Number(key);
      if (Number.isInteger(id) && Number.isFinite(Number(value)) && Number(value) > 0) {
        state.counters[id] = Math.round(Number(value));
      }
    }
  }
  state.spoilerFree = raw.spoilerFree !== false;
  state.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null;
  return state;
}

export function toggleEarned(state, id) {
  const next = clone(state);
  if (next.earned[id]) delete next.earned[id];
  else next.earned[id] = true;
  return touch(next);
}

export function setEarned(state, id, earned) {
  const next = clone(state);
  if (earned) next.earned[id] = true;
  else delete next.earned[id];
  return touch(next);
}

export function setCounter(state, id, value, target) {
  const next = clone(state);
  const whole = Math.max(0, Math.round(value));
  if (whole === 0) delete next.counters[id];
  else next.counters[id] = whole;
  if (whole > 0 && (whole >= target || next.earned[id])) {
    if (whole >= target) next.earned[id] = true;
  }
  return touch(next);
}

export function setSpoilerFree(state, spoilerFree) {
  const next = clone(state);
  next.spoilerFree = Boolean(spoilerFree);
  return touch(next);
}

export function clearProgress(state) {
  const next = emptyState();
  next.spoilerFree = state.spoilerFree;
  return touch(next);
}

export function exportText(state) {
  const payload = {
    format: 'platinum-ledger/progress-v1',
    game: APP.game,
    platform: APP.platform,
    trophies: APP.trophyTotal,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b),
    counters: state.counters,
    spoilerFree: state.spoilerFree,
  };
  return JSON.stringify(payload, null, 2);
}

// Accepts this app's export, a bare array of trophy ids, or any object with an earned list or map: a
// reader who kept an older file still gets their ticks back.
export function parseImport(text) {
  let raw;
  try {
    raw = JSON.parse(String(text || '').trim());
  } catch (error) {
    return { ok: false, error: 'That file is not JSON. Pick the file this app exported.' };
  }
  const source = Array.isArray(raw) ? { earned: raw } : raw;
  const foreign = source && typeof source === 'object' && source.format && source.format !== 'platinum-ledger/progress-v1';
  if (!source || typeof source !== 'object' || foreign) {
    return { ok: false, error: 'That JSON is not a Platinum Ledger progress file.' };
  }
  const parsed = sanitize(source);
  const earned = Object.keys(parsed.earned).length;
  if (earned === 0 && Object.keys(parsed.counters).length === 0 && !Array.isArray(source.earned)) {
    return { ok: false, error: 'The file holds no earned trophies and no counters.' };
  }
  return { ok: true, state: parsed, earned };
}

export function mergeInto(current, incoming, mode) {
  if (mode === 'replace') {
    const next = emptyState();
    next.earned = { ...incoming.earned };
    next.counters = { ...incoming.counters };
    next.spoilerFree = current.spoilerFree;
    return touch(next);
  }
  const next = clone(current);
  for (const id of Object.keys(incoming.earned)) next.earned[id] = true;
  for (const [id, value] of Object.entries(incoming.counters)) {
    next.counters[id] = Math.max(next.counters[id] || 0, value);
  }
  return touch(next);
}

function clone(state) {
  return {
    version: 1,
    earned: { ...state.earned },
    counters: { ...state.counters },
    spoilerFree: state.spoilerFree,
    updatedAt: state.updatedAt,
  };
}

function touch(state) {
  state.updatedAt = new Date().toISOString();
  return state;
}
