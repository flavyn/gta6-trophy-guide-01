# Platinum Ledger — a GTA VI trophy guide and tracker

<p align="center">
  <a href="https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01"><img src="https://make.fun/badge/gta6-trophy-guide-01.svg" alt="make.fun — GTA 6 trophy guide bounty"></a>
  <a href="https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01"><img src="https://make.fun/badge/gta6-trophy-guide-01/flavyn/gta6-trophy-guide-01/rank.svg" alt="Rank on the make.fun leaderboard"></a>
  <a href="https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01"><img src="https://make.fun/badge/gta6-trophy-guide-01/flavyn/gta6-trophy-guide-01/reward.svg" alt="Reward won"></a>
</p>

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy carries its official name, description and grade; each has a guide in this entry's own words with its sources beside it; a seven-step roadmap and unverified missable flags are built from the official descriptions; and progress is saved in the browser, exportable to a file and importable back.

The app is static files under `app/` with no build step: serve the folder from any static server and open `app/index.html`, and it works with the network off. Nothing is fetched from another site at run time, and no Rockstar logo, official artwork, box art or screenshot of the game appears anywhere in it — every mark is drawn in CSS.

## Run it

```sh
# serves app/ on http://localhost:8080 (Node 22.18 or later, nothing to install)
node serve.ts

# hand the entry in: copies app/ and screenshots/ and writes dossier.json
node main.ts
```

`MAKEFUN_OUTPUT_DIR=out node main.ts` writes to `out/` instead of `/output`, which is handy outside the grader.

## What is here

| Path | What it is |
| --- | --- |
| `app/index.html` | the page: checklist with the guide pane, roadmap, missables, save & settings |
| `app/src/` | one job a module: `config`, `dom`, `data`, `store`, `filters`, `main`, and `views/browse`, `views/roadmap`, `views/missables`, `views/log` |
| `app/data/trophies.json` | the 55 trophies: official name, description and grade, plus this entry's guide, steps, sources, kind, roadmap step, PSN count and missable flag |
| `screenshots/` | four real renders of the app at 1280×800 |
| `main.ts` | the hand-in program: copies `app/` and `screenshots/`, then writes `dossier.json` |
| `shots.json` | which view of the app each screenshot shows |
| `vendor/makefun-frontend.ts` | the kit's dossier library, unchanged |

## Sources and what is unverified

Official names, descriptions and grades come from the PlayStation 5 list as [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) carries it; PSN's progress targets for trophies that carry a count come from [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). The guide text is this entry's own reading of those descriptions, and every trophy's guide names its sources beside it in the app.

Nothing here was checked by playing the game. In particular the five missable flags (trophies 29, 37, 38, 47 and 50) are inferences from the wording of the official descriptions, and the app labels them unverified wherever they appear rather than presenting them as fact. The story chapter and mission grouping is likewise the list's own wording, not a playthrough.

## Licence

MIT — see `LICENSE`.
