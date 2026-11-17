// Keyboard + mouse input. Arrow keys / WASD steer, Space (or mouse hold) boosts,
// Space / Enter / click confirms, P or Esc pauses, R restarts, M mutes.
// Mouse steering: the plane chases the pointer when no arrow key is held.
import { FIELD } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_RESTART = 4;
export const ACTION_MUTE = 8;

export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;
  const mouse = { x: FIELD.width / 2, y: FIELD.height / 2, active: false, down: false };

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const ox = rect.left + (rect.width - FIELD.width * scale) / 2;
    const oy = rect.top + (rect.height - FIELD.height * scale) / 2;
    return { x: (clientX - ox) / scale, y: (clientY - oy) / scale };
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (e.key === ' ' || e.key === 'Enter') actions |= ACTION_CONFIRM;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') actions |= ACTION_PAUSE;
    if (e.key === 'r' || e.key === 'R') actions |= ACTION_RESTART;
    if (e.key === 'm' || e.key === 'M') actions |= ACTION_MUTE;
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = toLogical(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.active = true;
  });
  canvas.addEventListener('pointerdown', (e) => {
    const p = toLogical(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.active = true;
    mouse.down = true;
    actions |= ACTION_CONFIRM;
  });
  window.addEventListener('pointerup', () => {
    mouse.down = false;
  });
  window.addEventListener('blur', () => {
    keys.clear();
    mouse.down = false;
  });

  return {
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    },
    boost() {
      return keys.has(' ') || mouse.down;
    },
    /** Steering vector {x, y} in [-1, 1], from keys first, then the mouse. */
    direction(plane) {
      let x = 0;
      let y = 0;
      if (keys.has('ArrowLeft') || keys.has('a')) x -= 1;
      if (keys.has('ArrowRight') || keys.has('d')) x += 1;
      if (keys.has('ArrowUp') || keys.has('w')) y -= 1;
      if (keys.has('ArrowDown') || keys.has('s')) y += 1;
      if (x !== 0 || y !== 0) {
        const len = Math.hypot(x, y);
        return { x: x / len, y: y / len };
      }
      if (mouse.active) {
        const dx = mouse.x - plane.x;
        const dy = mouse.y - plane.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 14) {
          const mag = Math.min(1, dist / 140);
          return { x: (dx / dist) * mag, y: (dy / dist) * mag };
        }
      }
      return { x: 0, y: 0 };
    },
  };
}
