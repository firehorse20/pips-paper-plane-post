// Pip's Paper Plane Post — every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const PLANE = {
  x: 200,
  y: 360,
  radius: 26,
  speed: 430,
  boost: 1.55,
  invulnerable: 2.0,
};

export const LIVES = 3;
/** Letters to collect before the final mailbox appears. */
export const LETTERS_TO_WIN = 20;
/** Seconds to finish the whole delivery round. */
export const TIME_LIMIT = 90;

export const LETTER = { radius: 22, speed: 150, speedPerLevel: 18, interval: 1.2, points: 10 };
export const RING = { radius: 34, speed: 150, speedPerLevel: 18, interval: 3.6, points: 25 };
export const BIRD = { radius: 22, speed: 200, speedPerLevel: 28, interval: 2.8, intervalScale: 0.88, minInterval: 1.2 };
export const CLOUD = { radius: 40, speed: 115, speedPerLevel: 10, interval: 4.0, intervalScale: 0.9, minInterval: 2.0 };
export const MAILBOX = { radius: 58, speed: 120 };

/** Seconds of play per level, and the last level: speeds and spawn rates stop growing there. */
export const LEVEL = { seconds: 25, max: 4 };

export const PALETTE = {
  skyTop: '#5fb8f2',
  skyMid: '#9edcf7',
  skyLow: '#ffe9a8',
  sun: '#ffd93b',
  sunGlow: '#fff3b0',
  hillFar: '#7ec850',
  hillNear: '#4da63f',
  plane: '#ffffff',
  planeShade: '#d7e6f2',
  planeStripe: '#e5534b',
  letter: '#fff8e7',
  letterFlap: '#f2c94c',
  ring: '#f2c94c',
  ringGlow: '#ffe98a',
  bird: '#3a3f4d',
  birdBeak: '#ff9f1c',
  cloud: '#5b5470',
  cloudDark: '#453e5c',
  mailbox: '#e5534b',
  mailboxPost: '#7a4a2b',
  panel: 'rgba(16, 28, 48, 0.72)',
  text: '#ffffff',
  muted: '#cfe3f5',
  gold: '#ffd93b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'paper-plane-post.best';
