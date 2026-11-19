// Platinum Ledger — the hand-in program for make.fun's gta6-trophy-guide-01 lane.
//
// The guide itself is this repository's app/ folder: plain static files a browser opens at app/index.html,
// no build step and no network at run time. This program copies app/ and screenshots/ beside it into
// /output (or MAKEFUN_OUTPUT_DIR outside the grader), checks the trophy file before it copies it, and
// writes /output/dossier.json with the kit's own buildDossier, so the dossier is byte for byte the one the
// gate rebuilds. vendor/makefun-frontend.ts is the kit's copy and is never edited here.
//
// Run locally:   node main.ts            (writes /output)
//                $env:MAKEFUN_OUTPUT_DIR = 'out'; node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps (reference/gate.json): the dossier text, the screenshots and the size of app/.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

const EXPECTED_TROPHIES = 55;

function fail(message) {
  console.error('main.ts: ' + message);
  process.exit(1);
}

function checkTrophyFile() {
  const file = join(repoRoot, 'app', 'data', 'trophies.json');
  if (!existsSync(file)) fail('app/data/trophies.json is missing');
  let document;
  try {
    document = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail('app/data/trophies.json is not JSON: ' + error.message);
  }
  const list = Array.isArray(document) ? document : document.trophies;
  if (!Array.isArray(list)) fail('app/data/trophies.json has no trophies array');
  const named = list.filter((item) => item && typeof item.name === 'string' && typeof item.guide === 'string' && item.guide.trim() !== '');
  if (named.length < EXPECTED_TROPHIES) {
    fail('only ' + named.length + ' of ' + EXPECTED_TROPHIES + ' trophies carry a name and a guide');
  }
  return named.length;
}

function resetDirectory(path) {
  mkdirSync(path, { recursive: true });
}

function copyIntoOutput() {
  const appSource = join(repoRoot, 'app');
  const shotsSource = join(repoRoot, 'screenshots');
  if (!existsSync(join(appSource, 'index.html'))) fail('app/index.html is missing');
  if (!existsSync(shotsSource)) fail('screenshots/ is missing');

  resetDirectory(outputRoot);
  cpSync(appSource, join(outputRoot, 'app'), { recursive: true, force: true });
  cpSync(shotsSource, join(outputRoot, 'screenshots'), { recursive: true, force: true });
}

function writeDossier() {
  const dossier = buildDossier(outputRoot, DOSSIER_CAPS);
  writeFileSync(join(outputRoot, 'dossier.json'), dossier);
  return statSync(join(outputRoot, 'dossier.json')).size;
}

function main() {
  const trophies = checkTrophyFile();
  copyIntoOutput();
  const bytes = writeDossier();
  const shots = readdirSync(join(outputRoot, 'screenshots')).length;
  console.log('Platinum Ledger handed in: ' + trophies + ' trophies, ' + shots +
    ' screenshots, dossier.json ' + bytes + ' bytes');
}

main();
