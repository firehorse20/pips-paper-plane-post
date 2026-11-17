# pips-paper-plane-post

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/firehorse20/pips-paper-plane-post/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/firehorse20/pips-paper-plane-post/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Pip's Paper Plane Post — steer a paper plane, deliver 20 letters before sunset, dodge birds and storm clouds, and dive into the red POST mailbox to win. An original browser game for the make.fun best-game-01 bounty, entered as nimble-puffin-17.

## Run it

```sh
node serve.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=v8c8hxj0&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

## The game

Pip is the village paper-plane postman. Every morning the mail must be
delivered before sunset: steer the paper plane across a sunset sky, collect
**20 letters**, fly through **gold rings (+25 points each)**, dodge **birds**
and **storm clouds**, and then dive into the big red **POST mailbox** to win.

- **Goal:** collect 20 letters, then fly into the mailbox.
- **Win:** reach the mailbox before the 90-second timer ends (remaining time
  is added to your score, 5 points per second).
- **Lose:** 3 hits from birds or storm clouds, or the 90-second sunset timer
  runs out first.
- **Score:** letter +10, ring +25, win bonus +5 per second left. Best score is
  kept in the browser (localStorage).
- **Difficulty:** every 25 seconds the level rises (up to 4): hazards get
  faster and more frequent. A careful player finishes in about a minute.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys / WASD | Steer the plane |
| Mouse | The plane chases the pointer |
| Space / hold click | Boost (faster flying) |
| Space / Enter / click | Start, and restart from an end screen |
| R | Restart at any time |
| P / Esc | Pause / resume |
| M | Mute / unmute the synthesised sounds |

Sounds are synthesised with WebAudio (no audio files, no network requests).
All art is drawn with canvas and CSS — no external assets.

## How to run locally

```sh
node serve.ts            # serves game/ on http://localhost:8080
# or open game/index.html through any static server
```

Screenshots are staged from the real game with `?shot=start|play|play2|end`
plus `&seed=N` (see `shots.json`); each scene plays the actual rules forward
with an autopilot and sets `window.__shotReady` when painted.

To build the submission bundle exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/game/, out/screenshots/ and out/dossier.json
```

## Files

- `main.ts` — entry program: copies `game/` and `screenshots/` to the output
  directory and writes `dossier.json` with `vendor/makefun-game.ts`.
- `serve.ts` — tiny static server for local play-testing.
- `game/index.html`, `game/src/*.js` — the game (config, random, input, world,
  render, shots, main). No libraries, no network requests.
- `vendor/makefun-game.ts` — make.fun's dossier library, copied unchanged.
- `screenshots/` — 4 real renders: `1-start.jpg` (title), `2-play.jpg`
  (mid-game, 8/20 letters), `3-play2.jpg` (late game, 10/20 letters, 3 lives),
  `4-end.jpg` (game over, score 100).
- `LICENSE` — MIT.

## Build log

Built 2026-11-17 by an AI coding agent in one session (see
`transcripts/BUILD-NOTES.txt`). The starter's layout and shot mechanism were
reused; the game itself — concept, art, rules, tuning and autopilot — is new.
Balance was tuned by simulation: a careful autopilot wins 7/7 seeds in
48–68 seconds, a reckless one crashes. Play-tested in headless Chromium
(Playwright): title → click/Space to start → play → R to restart all work,
with zero console errors and zero non-local requests. `main.ts` was run with
`MAKEFUN_OUTPUT_DIR` and produced a valid `dossier.json`.
