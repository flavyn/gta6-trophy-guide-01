// Static copy, grade marks, the seven-step roadmap and the source catalogue: everything the app says
// about itself lives here, so the views only lay data out.

export const APP = {
  name: 'Platinum Ledger',
  game: 'Grand Theft Auto VI',
  platform: 'PlayStation 5',
  trophyTotal: 55,
  storageKey: 'platinum-ledger/v1',
  dataUrl: 'data/trophies.json',
  exportName: 'platinum-ledger-progress.json',
};

export const VIEWS = [
  { id: 'browse', label: 'Checklist' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'missables', label: 'Missables' },
  { id: 'log', label: 'Save & settings' },
];

export const GRADES = {
  platinum: { label: 'Platinum', letter: 'P', tone: 'platinum' },
  gold: { label: 'Gold', letter: 'G', tone: 'gold' },
  silver: { label: 'Silver', letter: 'S', tone: 'silver' },
  bronze: { label: 'Bronze', letter: 'B', tone: 'bronze' },
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

// The judge's three kinds, plus the platinum, plus a cross-cutting "missable" chip that reads a flag
// instead of a kind: every trophy still has exactly one kind.
export const KIND_CHIPS = [
  { id: 'all', label: 'All', kind: null },
  { id: 'story', label: 'Story', kind: 'story' },
  { id: 'missable', label: 'Missable', kind: null, flag: 'missable' },
  { id: 'collectibles', label: 'Collectibles', kind: 'collectibles' },
  { id: 'activities', label: 'Activities', kind: 'activities' },
  { id: 'meta', label: 'Platinum', kind: 'meta' },
];

export const STAGES = [
  {
    id: 1,
    title: 'Opening & Chapter 1',
    blurb: 'The list names Gone Fishing as the opening mission and Chapter 1 as the next gate. Finish the mission, then the chapter: both trophies land on completion, with nothing to collect and nothing to time.',
    sealedBlurb: 'The opening mission and Chapter 1: finish both and their two trophies land on completion, with nothing to collect and nothing to time. Their names stay sealed while spoiler-free is on.',
  },
  {
    id: 2,
    title: 'The story, chapter by chapter',
    blurb: 'Chapters 2, 3 and 4 each close with a bronze trophy and the final mission with the gold. Six more story missions (Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm) are named without a chapter, so treat the whole main line as their window. Catch Me If You Can and Challenging Tank are event trophies the story will walk you into.',
    sealedBlurb: 'Chapters 2, 3 and 4 each close with a bronze trophy and the final mission with the gold. Six more story missions are named by the list without a chapter, so treat the whole main line as their window. Two event trophies — the airport moment and the tank — come with the story too; both are flagged on the missables page.',
  },
  {
    id: 3,
    title: 'Side strands & strangers',
    blurb: 'Five "final mission for" bronzes (Andy, Kenton, Billy, Randy, Tyrone), the silver for eight stranger strands, Cal\'s fishing challenge and Bret\'s unique-animal hunt. These hang off the story map, so sweep each area\'s strands as it opens instead of doubling back after the finale.',
    sealedBlurb: 'Five side strands that end in a "final mission" bronze, the silver for eight stranger strands, a fishing challenge and a unique-animal hunt. These hang off the story map, so sweep each area\'s strands as it opens instead of doubling back after the finale.',
  },
  {
    id: 4,
    title: 'Activities & events',
    blurb: 'Races, drone races, the shooting range, stunts, arcade, bowling, bank vaults, shops, gang operations and the showpiece moments. Several carry PSN counts; this app keeps a counter for every one of them, so the target is never a guess.',
  },
  {
    id: 5,
    title: 'Collectibles & the map',
    blurb: 'Collectible Card sets, WAiNK It spots, 100 discovered vehicles, 18 meditation spots and all 52 areas of Leonida. This is the long tail: the counters run past the trophy, so you can see a set complete before PSN does.',
  },
  {
    id: 6,
    title: 'Money, garages & the phone',
    blurb: 'Launder $250,000 of marked bills, spend $100,000 across shops, buy every garage property and register 10 vehicles in Scooter Bros. Money trophies come from doing the work the list already asks for, not from luck.',
  },
  {
    id: 7,
    title: '100% and the platinum',
    blurb: 'A Long Road (gold) is 100% completion, and it is the gate that keeps every other trophy honest. Vice Got a Price! is the platinum: it needs the other 54, so it is always the last one you earn.',
  },
];

export const SOURCE_CATALOGUE = {
  official: {
    label: 'The official trophy list on Exophase',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
    note: 'the official name, description and grade shown above, as PlayStation publishes them',
  },
  psnprofiles: {
    label: 'PSNProfiles — Grand Theft Auto VI',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
    note: "PSN's progress target for a trophy that carries a count",
  },
  reading: {
    label: 'Our reading of the official description',
    url: '',
    note: 'the guide text is ours: what the description asks for, in what order, and what to watch. No location or step is copied from another guide, and nothing here was checked in the game',
  },
};

export const COPY = {
  offline: 'Every file this page loads is in this folder: no font, image or script comes from the network, and progress never leaves the browser.',
  spoiler: 'Spoiler-free hides the name, the description and the guide of every story trophy until you tick it earned. The story grouping is ours, read from the official descriptions.',
  missable:
    'Missable flags are unverified readings of the official descriptions: a flag marks a trophy whose description names one moment, one partner or one unique target. The list gives no deadline of its own, each flag says so in its own words, and none has been confirmed in the game.',
  counts:
    "Where a description names a count, the target below it is PSN's own progress target, as PSNProfiles lists it. A counter is a helper: the trophy itself still pops in-game.",
  citing:
    'Each guide names where its facts come from, beside it: the official list for the name, description and grade; PSNProfiles for a count; and our own reading of the description for the advice. A link opens only if you follow it — the page itself fetches nothing.',
  roadmap:
    'The roadmap is built from the official descriptions alone: which chapters and missions the list names, which collectibles and counts it states, and the one order it implies (100% last but for the platinum). Nothing in it was checked in the game.',
  online:
    'No online trophies: all 55 in this list are earned in the single-player story and the free roam around it.',
};

export const FILTER_DEFAULTS = { kind: 'all', grade: 'all', query: '', missableOnly: false };
