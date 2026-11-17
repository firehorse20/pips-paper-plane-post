// The world: a paper plane, drifting letters and rings to collect, birds and
// storm clouds to dodge, and a final mailbox to fly into. Fixed-step, seeded.
import { BIRD, CLOUD, FIELD, LETTER, LETTERS_TO_WIN, LEVEL, LIVES, MAILBOX, PLANE, RING, TIME_LIMIT } from './config.js';

export const EVENT_COLLECT = 1;
export const EVENT_RING = 2;
export const EVENT_HIT = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;

export function createWorld(random) {
  const state = {
    plane: { x: PLANE.x, y: PLANE.y, vx: 0, vy: 0, invuln: 0, tilt: 0 },
    score: 0,
    letters: 0,
    lives: LIVES,
    elapsed: 0,
    timeLeft: TIME_LIMIT,
    level: 1,
    items: [],
    particles: [],
    bgClouds: [],
    over: false,
    won: false,
    reason: '',
    mailboxSpawned: false,
  };

  function reset() {
    state.plane.x = PLANE.x;
    state.plane.y = PLANE.y;
    state.plane.vx = 0;
    state.plane.vy = 0;
    state.plane.invuln = 0;
    state.plane.tilt = 0;
    state.score = 0;
    state.letters = 0;
    state.lives = LIVES;
    state.elapsed = 0;
    state.timeLeft = TIME_LIMIT;
    state.level = 1;
    state.items = [];
    state.particles = [];
    state.over = false;
    state.won = false;
    state.reason = '';
    state.mailboxSpawned = false;
    state.bgClouds = [];
    for (let i = 0; i < 7; i++) {
      state.bgClouds.push({ x: random.range(0, FIELD.width), y: random.range(40, 260), s: random.range(0.6, 1.4), v: random.range(8, 22) });
    }
    spawnTimers.letter = 0.4;
    spawnTimers.ring = 2.2;
    spawnTimers.bird = 1.4;
    spawnTimers.cloud = 2.6;
  }

  const spawnTimers = { letter: 0.4, ring: 2.2, bird: 1.4, cloud: 2.6 };

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = random.range(0, Math.PI * 2);
      const sp = random.range(40, 220);
      state.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: random.range(0.35, 0.8), max: 0.8, color, size: random.range(3, 7) });
    }
  }

  function spawn(kind) {
    const lvl = state.level;
    const y = kind === 'mailbox' ? FIELD.height / 2 : random.range(80, FIELD.height - 90);
    if (kind === 'letter') {
      state.items.push({ kind, x: FIELD.width + 40, y, r: LETTER.radius, speed: LETTER.speed + LETTER.speedPerLevel * (lvl - 1), bob: random.range(0, Math.PI * 2), bobAmp: random.range(8, 22) });
    } else if (kind === 'ring') {
      state.items.push({ kind, x: FIELD.width + 50, y, r: RING.radius, speed: RING.speed + RING.speedPerLevel * (lvl - 1), bob: 0, bobAmp: 0 });
    } else if (kind === 'bird') {
      state.items.push({ kind, x: FIELD.width + 50, y, r: BIRD.radius, speed: BIRD.speed + BIRD.speedPerLevel * (lvl - 1), bob: random.range(0, Math.PI * 2), bobAmp: random.range(18, 42), flap: random.range(0, Math.PI * 2) });
    } else if (kind === 'cloud') {
      state.items.push({ kind, x: FIELD.width + 70, y: random.range(90, FIELD.height - 160), r: CLOUD.radius, speed: CLOUD.speed + CLOUD.speedPerLevel * (lvl - 1), bob: 0, bobAmp: 0 });
    } else if (kind === 'mailbox') {
      state.items.push({ kind, x: FIELD.width + 80, y, r: MAILBOX.radius, speed: MAILBOX.speed, bob: 0, bobAmp: 0 });
      state.mailboxSpawned = true;
    }
  }

  /**
   * Advance one fixed step. `steer` is {x, y} in [-1, 1], `boost` is a speed
   * burst, `title` runs the ambient sky only (no scoring or danger).
   * Returns an EVENT_* bitmask.
   */
  function step(dt, steer, boost, title) {
    for (const c of state.bgClouds) {
      c.x -= c.v * dt;
      if (c.x < -120) {
        c.x = FIELD.width + 120;
        c.y = random.range(40, 260);
      }
    }
    if (title) {
      state.plane.y = FIELD.height / 2 + Math.sin(state.elapsed * 1.2) * 18;
      state.plane.tilt = Math.cos(state.elapsed * 1.2) * 0.08;
      state.elapsed += dt;
      return 0;
    }
    if (state.over) return 0;
    let events = 0;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, TIME_LIMIT - state.elapsed);
    state.level = Math.min(LEVEL.max, Math.floor(state.elapsed / LEVEL.seconds) + 1);

    // Plane movement: smooth acceleration toward the steering velocity.
    const speed = PLANE.speed * (boost ? PLANE.boost : 1);
    const tvx = steer.x * speed;
    const tvy = steer.y * speed;
    state.plane.vx += (tvx - state.plane.vx) * Math.min(1, dt * 8);
    state.plane.vy += (tvy - state.plane.vy) * Math.min(1, dt * 8);
    state.plane.x = Math.min(820, Math.max(50, state.plane.x + state.plane.vx * dt));
    state.plane.y = Math.min(FIELD.height - 56, Math.max(64, state.plane.y + state.plane.vy * dt));
    state.plane.tilt = Math.max(-0.45, Math.min(0.45, state.plane.vy / 900));
    if (state.plane.invuln > 0) state.plane.invuln -= dt;

    // Spawning, faster as levels rise.
    const lvl = state.level;
    spawnTimers.letter -= dt;
    if (spawnTimers.letter <= 0) {
      spawn('letter');
      spawnTimers.letter = LETTER.interval * (1 - 0.07 * (lvl - 1)) * random.range(0.8, 1.25);
    }
    spawnTimers.ring -= dt;
    if (spawnTimers.ring <= 0) {
      spawn('ring');
      spawnTimers.ring = RING.interval * random.range(0.85, 1.2);
    }
    spawnTimers.bird -= dt;
    if (spawnTimers.bird <= 0) {
      spawn('bird');
      spawnTimers.bird = Math.max(BIRD.minInterval, BIRD.interval * Math.pow(BIRD.intervalScale, lvl - 1)) * random.range(0.8, 1.25);
    }
    spawnTimers.cloud -= dt;
    if (spawnTimers.cloud <= 0) {
      spawn('cloud');
      spawnTimers.cloud = Math.max(CLOUD.minInterval, CLOUD.interval * Math.pow(CLOUD.intervalScale, lvl - 1)) * random.range(0.85, 1.2);
    }
    if (state.letters >= LETTERS_TO_WIN && !state.mailboxSpawned) spawn('mailbox');

    // Move items, bob the birds and letters.
    for (const it of state.items) {
      it.x -= it.speed * dt;
      it.bob += dt * 2.2;
      if (it.kind === 'bird') it.flap += dt * 10;
    }
    state.items = state.items.filter((it) => it.x > -110);

    // Particles.
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    // Collisions (circle vs circle, with a small forgiveness margin).
    const px = state.plane.x;
    const py = state.plane.y;
    for (const it of state.items) {
      const iy = it.y + (it.bobAmp ? Math.sin(it.bob) * it.bobAmp : 0);
      const dx = it.x - px;
      const dy = iy - py;
      const dist = Math.hypot(dx, dy);
      if (it.kind === 'letter' && dist < PLANE.radius + it.r - 4) {
        const cx = it.x;
        it.x = -9999;
        state.letters += 1;
        state.score += LETTER.points;
        burst(cx, iy, '#f2c94c', 12);
        events |= EVENT_COLLECT;
      } else if (it.kind === 'ring' && dist < PLANE.radius + it.r - 18) {
        const cx = it.x;
        it.x = -9999;
        state.score += RING.points;
        burst(cx, iy, '#ffd93b', 16);
        events |= EVENT_RING;
      } else if (it.kind === 'mailbox' && dist < PLANE.radius + it.r - 14) {
        state.over = true;
        state.won = true;
        state.reason = 'delivered';
        state.score += Math.round(state.timeLeft) * 5;
        burst(it.x, iy, '#e5534b', 24);
        events |= EVENT_WIN | EVENT_OVER;
      } else if ((it.kind === 'bird' || it.kind === 'cloud') && state.plane.invuln <= 0 && dist < PLANE.radius + it.r - 14) {
        state.lives -= 1;
        state.plane.invuln = PLANE.invulnerable;
        state.plane.vx = -260;
        burst(px, py, '#e5534b', 18);
        events |= EVENT_HIT;
        if (it.kind === 'bird') it.x = -9999;
        if (state.lives <= 0) {
          state.over = true;
          state.won = false;
          state.reason = 'crash';
          events |= EVENT_OVER;
        }
      }
    }
    state.items = state.items.filter((it) => it.x > -110);

    if (!state.over && state.timeLeft <= 0) {
      state.over = true;
      state.won = false;
      state.reason = state.letters >= LETTERS_TO_WIN ? 'mailbox' : 'time';
      events |= EVENT_OVER;
    }
    return events;
  }

  reset();
  return { state, reset, step };
}
