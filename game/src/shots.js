// The screenshot scenes behind ?shot=start|play|play2|end. Each one plays the
// real rules forward from a fresh world for a fixed number of steps, steered by
// an autopilot, so the frame is what a short game really looks like and the
// same seed always gives the same frame.
import { FIELD, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 28;
const PLAY2_SECONDS = 34;
const END_LIMIT_SECONDS = 600;

/**
 * A potential-field pilot: attraction to the target (mailbox first, then the
 * nearest letter / ring, penalised when a hazard sits on top of it) plus
 * repulsion from every bird and storm cloud ahead of the plane. It plays the
 * way a careful human would: it goes for the mail, but not through a bird.
 */
export function autopilot(state, reckless = false) {
  const p = state.plane;
  // Target: the mailbox when it is out, else the best letter / ring ahead.
  let target = null;
  let bestScore = Infinity;
  for (const it of state.items) {
    if (it.kind === 'mailbox') {
      target = it;
      break;
    }
    if ((it.kind === 'letter' || it.kind === 'ring') && it.x > p.x - 20) {
      const d = Math.hypot(it.x - p.x, it.y - p.y);
      let penalty = 0;
      for (const h of state.items) {
        if (h.kind !== 'bird' && h.kind !== 'cloud') continue;
        const hy = h.y + (h.bobAmp ? Math.sin(h.bob) * h.bobAmp : 0);
        if (Math.hypot(h.x - it.x, hy - it.y) < 100) penalty += 300;
      }
      const score = d + penalty;
      if (score < bestScore) {
        bestScore = score;
        target = it;
      }
    }
  }
  let vx = 0;
  let vy = 0;
  if (target) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    vx += dx / len;
    vy += dy / len;
  } else {
    vx += 0.6;
  }
  if (!reckless) {
    // Repulsion from hazards ahead: stronger the closer they are.
    for (const it of state.items) {
      if (it.kind !== 'bird' && it.kind !== 'cloud') continue;
      const iy = it.y + (it.bobAmp ? Math.sin(it.bob) * it.bobAmp : 0);
      const dx = it.x - p.x;
      const dy = iy - p.y;
      if (dx < -50 || dx > 360) continue;
      const dist = Math.hypot(dx, dy);
      if (dist > 340) continue;
      const w = (1 - dist / 340) * 2.4;
      const away = dy === 0 ? (p.y < FIELD.height / 2 ? -1 : 1) : -Math.sign(dy);
      vy += away * w;
      vx -= w * 0.25;
    }
  }
  const len = Math.hypot(vx, vy) || 1;
  return { x: vx / len, y: vy / len };
}

/** The reckless end-scene pilot flies straight at the nearest bird or storm
 *  cloud ahead, as a hurried player who never looks up would. */
function recklessPilot(state) {
  const p = state.plane;
  let target = null;
  let bestD = Infinity;
  for (const it of state.items) {
    if (it.kind !== 'bird' && it.kind !== 'cloud') continue;
    if (it.x < p.x) continue;
    const iy = it.y + (it.bobAmp ? Math.sin(it.bob) * it.bobAmp : 0);
    const d = Math.hypot(it.x - p.x, iy - p.y);
    if (d < bestD) {
      bestD = d;
      target = { x: it.x, y: iy };
    }
  }
  const tx = target ? target.x : p.x + 120;
  const ty = target ? target.y : FIELD.height / 2;
  const dx = tx - p.x;
  const dy = ty - p.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'play2' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i++) world.step(STEP, { x: 0, y: 0 }, false, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const seconds = name === 'play2' ? PLAY2_SECONDS : name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const pilot = name === 'end' ? recklessPilot : autopilot;
  for (let i = 0; i < seconds / STEP; i++) {
    // The end scene plays carefully for the first 18 seconds (so the game-over
    // screen shows a real score), then flies recklessly into the hazards.
    const p = name === 'end' && world.state.elapsed < 18 ? autopilot : pilot;
    const events = world.step(STEP, p(world.state), false, false);
    if (events & EVENT_OVER) break;
  }
  const s = world.state;
  if (s.over) return { screen: s.won ? SCREEN_WIN : SCREEN_OVER, best: s.score };
  return { screen: SCREEN_PLAY, best: s.score };
}
