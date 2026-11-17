// Canvas renderer: a sunset sky, green hills, the paper plane, letters, rings,
// birds, storm clouds and the mailbox, plus HUD and title / pause / end screens.
import { FIELD, FONT, LETTERS_TO_WIN, PALETTE, TIME_LIMIT } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function draw(state, screen, best, muted) {
    const w = canvas.clientWidth || FIELD.width;
    const h = canvas.clientHeight || FIELD.height;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const scale = Math.min(w / FIELD.width, h / FIELD.height);
    const ox = (w - FIELD.width * scale) / 2;
    const oy = (h - FIELD.height * scale) / 2;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    drawSky(state);
    drawHills();
    for (const c of state.bgClouds) drawSoftCloud(c.x, c.y, c.s, 'rgba(255,255,255,0.85)');
    for (const it of state.items) drawItem(it, state.elapsed);
    drawParticles(state);
    drawPlane(state);
    drawHud(state, best, muted);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPanel('PAUSED', 'Press P or click to keep flying.', `Score ${state.score}  ·  Letters ${state.letters}/${LETTERS_TO_WIN}`);
    else if (screen === SCREEN_WIN) drawEnd(state, best, true);
    else if (screen === SCREEN_OVER) drawEnd(state, best, false);
    ctx.restore();
  }

  function drawSky(state) {
    const g = ctx.createLinearGradient(0, 0, 0, FIELD.height);
    g.addColorStop(0, PALETTE.skyTop);
    g.addColorStop(0.55, PALETTE.skyMid);
    g.addColorStop(1, PALETTE.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    // Sun with glow.
    const sx = 1080;
    const sy = 110;
    const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 150);
    glow.addColorStop(0, PALETTE.sunGlow);
    glow.addColorStop(1, 'rgba(255,243,176,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.sun;
    ctx.beginPath();
    ctx.arc(sx, sy, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + state.elapsed * 0.05;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 66, sy + Math.sin(a) * 66);
      ctx.lineTo(sx + Math.cos(a) * 84, sy + Math.sin(a) * 84);
      ctx.stroke();
    }
  }

  function drawHills() {
    ctx.fillStyle = PALETTE.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, 640);
    ctx.quadraticCurveTo(320, 560, 640, 630);
    ctx.quadraticCurveTo(960, 690, 1280, 620);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, 680);
    ctx.quadraticCurveTo(400, 620, 800, 675);
    ctx.quadraticCurveTo(1080, 705, 1280, 665);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();
    // Little houses on the far hill.
    ctx.fillStyle = '#fff8e7';
    for (const [x, y] of [[180, 618], [520, 612], [900, 640]]) {
      ctx.fillRect(x, y, 34, 26);
      ctx.fillStyle = '#e5534b';
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 17, y - 16);
      ctx.lineTo(x + 38, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff8e7';
    }
  }

  function drawSoftCloud(x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 28 * s, y + 4 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x - 28 * s, y + 6 * s, 18 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawItem(it, t) {
    const y = it.y + (it.bobAmp ? Math.sin(it.bob) * it.bobAmp : 0);
    if (it.kind === 'letter') {
      ctx.save();
      ctx.translate(it.x, y);
      ctx.rotate(Math.sin(it.bob) * 0.12);
      ctx.fillStyle = PALETTE.letter;
      ctx.strokeStyle = '#d8b25a';
      ctx.lineWidth = 2;
      ctx.fillRect(-24, -16, 48, 32);
      ctx.strokeRect(-24, -16, 48, 32);
      ctx.fillStyle = PALETTE.letterFlap;
      ctx.beginPath();
      ctx.moveTo(-24, -16);
      ctx.lineTo(0, 2);
      ctx.lineTo(24, -16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e5534b';
      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (it.kind === 'ring') {
      ctx.save();
      ctx.translate(it.x, y);
      ctx.strokeStyle = PALETTE.ringGlow;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, it.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.ring;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, it.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fff8e7';
      ctx.font = 'bold 20px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+25', 0, 1);
      ctx.restore();
    } else if (it.kind === 'bird') {
      const flap = Math.sin(it.flap) * 0.5;
      ctx.save();
      ctx.translate(it.x, y);
      ctx.fillStyle = PALETTE.bird;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(24, -6, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.birdBeak;
      ctx.beginPath();
      ctx.moveTo(32, -8);
      ctx.lineTo(44, -4);
      ctx.lineTo(32, -1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PALETTE.bird;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.quadraticCurveTo(-14, -26 - flap * 22, -30, -30 - flap * 26);
      ctx.stroke();
      ctx.restore();
    } else if (it.kind === 'cloud') {
      ctx.save();
      ctx.translate(it.x, y);
      ctx.fillStyle = PALETTE.cloud;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.arc(30, 6, 26, 0, Math.PI * 2);
      ctx.arc(-30, 8, 24, 0, Math.PI * 2);
      ctx.arc(0, 18, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.cloudDark;
      ctx.beginPath();
      ctx.arc(0, 16, 30, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.moveTo(-2, 22);
      ctx.lineTo(-12, 48);
      ctx.lineTo(-3, 48);
      ctx.lineTo(-10, 68);
      ctx.lineTo(8, 40);
      ctx.lineTo(-1, 40);
      ctx.lineTo(6, 22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (it.kind === 'mailbox') {
      ctx.save();
      ctx.translate(it.x, y);
      ctx.fillStyle = PALETTE.mailboxPost;
      ctx.fillRect(-6, 10, 12, 90);
      ctx.fillStyle = PALETTE.mailbox;
      ctx.beginPath();
      ctx.moveTo(-52, 10);
      ctx.lineTo(-52, -34);
      ctx.arc(0, -34, 52, Math.PI, 0);
      ctx.lineTo(52, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('POST', 0, -12);
      ctx.fillStyle = '#ffd93b';
      ctx.fillRect(38, -58, 8, 30);
      ctx.beginPath();
      ctx.moveTo(46, -58);
      ctx.lineTo(78, -48);
      ctx.lineTo(46, -38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawParticles(state) {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlane(state) {
    const p = state.plane;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt);
    if (p.invuln > 0 && Math.floor(p.invuln * 10) % 2 === 0) ctx.globalAlpha = 0.35;
    // Paper plane: white dart with a red stripe and a fold line.
    ctx.fillStyle = PALETTE.plane;
    ctx.strokeStyle = '#9db8cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(-28, -20);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-28, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.planeShade;
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-28, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.planeStripe;
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7a9ab5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, -4);
    ctx.lineTo(-20, -16);
    ctx.stroke();
    ctx.restore();
  }

  function drawHud(state, best, muted) {
    ctx.fillStyle = PALETTE.panel;
    ctx.fillRect(0, 0, FIELD.width, 64);
    ctx.fillStyle = PALETTE.text;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = 'bold 30px ' + FONT;
    ctx.fillText(`SCORE ${state.score}`, 20, 34);
    ctx.font = 'bold 22px ' + FONT;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(`BEST ${best}`, 230, 35);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 26px ' + FONT;
    ctx.fillText(`✉ ${state.letters}/${LETTERS_TO_WIN}`, 640, 24);
    const timeColor = state.timeLeft <= 15 ? '#ff8a80' : PALETTE.text;
    ctx.fillStyle = timeColor;
    ctx.font = 'bold 24px ' + FONT;
    ctx.fillText(`⏱ ${Math.ceil(state.timeLeft)}s  ·  LEVEL ${state.level}`, 640, 50);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 26px ' + FONT;
    const hearts = '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives));
    ctx.fillText(hearts, 1250, 34);
    if (muted) {
      ctx.font = '16px ' + FONT;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText('MUTED (M)', 1250, 56);
    }
  }

  function drawPanel(title, line1, line2) {
    ctx.fillStyle = 'rgba(10, 20, 40, 0.55)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = 'rgba(16, 28, 48, 0.88)';
    roundRect(340, 190, 600, 300, 18);
    ctx.fill();
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 3;
    roundRect(340, 190, 600, 300, 18);
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 56px ' + FONT;
    ctx.fillText(title, 640, 260);
    ctx.font = '24px ' + FONT;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(line1, 640, 330);
    if (line2) ctx.fillText(line2, 640, 372);
    ctx.font = 'bold 24px ' + FONT;
    ctx.fillStyle = '#ffd93b';
    ctx.fillText('Press R or click to restart', 640, 440);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(10, 20, 40, 0.45)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px ' + FONT;
    ctx.fillText("Pip's Paper Plane Post", 640, 150);
    ctx.font = 'bold 28px ' + FONT;
    ctx.fillStyle = '#ffd93b';
    ctx.fillText('Deliver the mail before sunset!', 640, 205);
    ctx.fillStyle = 'rgba(16, 28, 48, 0.88)';
    roundRect(300, 250, 680, 190, 16);
    ctx.fill();
    ctx.fillStyle = PALETTE.text;
    ctx.font = '22px ' + FONT;
    ctx.fillText('GOAL  Collect 20 letters, fly through gold rings (+25),', 640, 290);
    ctx.fillText('then dive into the red POST mailbox to win.', 640, 322);
    ctx.fillText('Dodge birds and storm clouds — 3 hits and the round ends.', 640, 354);
    ctx.fillText('You have 90 seconds. Rings and fast flying build your score.', 640, 386);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px ' + FONT;
    ctx.fillText('Steer:  Arrow keys / WASD / mouse    •    Boost:  Space / hold click', 640, 480);
    ctx.fillText('Pause:  P      •      Mute:  M', 640, 514);
    ctx.fillStyle = '#ffd93b';
    ctx.font = 'bold 30px ' + FONT;
    ctx.fillText('▶  Press SPACE or click to start', 640, 580);
    if (best > 0) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = '20px ' + FONT;
      ctx.fillText(`Best score: ${best}`, 640, 624);
    }
  }

  function drawEnd(state, best, won) {
    const title = won ? 'DELIVERED! ✉' : 'GAME OVER';
    const reason =
      state.reason === 'delivered'
        ? 'Every letter is in the mailbox — the town cheers!'
        : state.reason === 'crash'
          ? 'The plane came down after 3 hits.'
          : state.reason === 'mailbox'
            ? 'Time ran out just short of the mailbox.'
            : 'Sunset came before the mail was done.';
    ctx.fillStyle = 'rgba(10, 20, 40, 0.55)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = 'rgba(16, 28, 48, 0.9)';
    roundRect(330, 180, 620, 330, 18);
    ctx.fill();
    ctx.strokeStyle = won ? '#ffd93b' : '#e5534b';
    ctx.lineWidth = 3;
    roundRect(330, 180, 620, 330, 18);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = won ? '#ffd93b' : '#ff8a80';
    ctx.font = 'bold 58px ' + FONT;
    ctx.fillText(title, 640, 250);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '22px ' + FONT;
    ctx.fillText(reason, 640, 310);
    ctx.fillStyle = PALETTE.text;
    ctx.font = 'bold 30px ' + FONT;
    ctx.fillText(`SCORE ${state.score}    ✉ ${state.letters}/${LETTERS_TO_WIN}    BEST ${best}`, 640, 370);
    ctx.fillStyle = '#ffd93b';
    ctx.font = 'bold 26px ' + FONT;
    ctx.fillText('Press R or click to fly again', 640, 440);
  }

  return { draw };
}
