// render.js — draws the two panels, the found-difference markers, and all
// the moment-to-moment feedback: the expanding ring on a find, the floating
// score text, the pulsing hint ring, and the red flash on a wrong click.
import { PANEL_W, PANEL_H } from './scenes.js';

export const PANEL_GAP = 24;

// A found difference gets a hand-drawn style ring, slightly wobbly so it
// reads as circled by the player, in a warm gold that pops on every scene.
function drawMarkerRing(ctx, cx, cy, r, progress, color) {
  const wobble = 3;
  ctx.beginPath();
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 * progress;
    const rr = r + Math.sin(angle * 3) * wobble * (1 - progress * 0.4);
    const px = cx + Math.cos(angle) * rr;
    const py = cy + Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  // A small check mark inside the ring.
  if (progress > 0.7) {
    const t = (progress - 0.7) / 0.3;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.35, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.28);
    ctx.lineTo(cx + r * 0.4, cy - r * 0.3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = t;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export class PanelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = PANEL_W * 2 + PANEL_GAP;
    this.canvas.height = PANEL_H;
    this.foundAnimations = new Map(); // difference id -> start time
    this.floatingTexts = []; // {x, y, text, startedAt, color}
    this.wrongFlashes = []; // {panel, x, y, startedAt}
    this.shakeUntil = 0;
    this.shakeStrength = 0;
  }

  // Where panel 0 (left) or 1 (right) starts on the canvas.
  panelOrigin(panelIndex) {
    return { x: panelIndex * (PANEL_W + PANEL_GAP), y: 0 };
  }

  // Converts a click in canvas pixels into {panel, x, y} in panel space,
  // or null when the click lands in the gap or outside the canvas.
  pickPanel(canvasX, canvasY) {
    if (canvasY < 0 || canvasY > PANEL_H) return null;
    if (canvasX < PANEL_W) return { panel: 0, x: canvasX, y: canvasY };
    if (canvasX >= PANEL_W + PANEL_GAP) {
      return { panel: 1, x: canvasX - PANEL_W - PANEL_GAP, y: canvasY };
    }
    return null;
  }

  onFound(difference, now) {
    this.foundAnimations.set(difference.id, now);
    this.floatingTexts.push({
      x: difference.x,
      y: difference.y - difference.r - 8,
      text: '+100',
      startedAt: now,
      color: '#ffd93b',
    });
  }

  onWrongClick(panel, x, y, now) {
    this.wrongFlashes.push({ panel, x, y, startedAt: now });
    this.shakeUntil = now + 220;
    this.shakeStrength = 5;
  }

  onStreakBonus(difference, bonus, now) {
    this.floatingTexts.push({
      x: difference.x,
      y: difference.y + difference.r + 18,
      text: `Streak +${bonus}`,
      startedAt: now,
      color: '#7fe08a',
    });
  }

  draw(level, tracker, now, frozen) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // A gentle screen shake while the wrong-click feedback is active.
    let dx = 0;
    let dy = 0;
    if (now < this.shakeUntil) {
      const t = (this.shakeUntil - now) / 220;
      dx = (Math.random() - 0.5) * this.shakeStrength * t;
      dy = (Math.random() - 0.5) * this.shakeStrength * t;
    }
    ctx.save();
    ctx.translate(dx, dy);

    const allIds = new Set(level.differences.map((d) => d.id));

    for (let panel = 0; panel < 2; panel++) {
      const origin = this.panelOrigin(panel);
      ctx.save();
      ctx.beginPath();
      ctx.rect(origin.x, origin.y, PANEL_W, PANEL_H);
      ctx.clip();
      ctx.translate(origin.x, origin.y);
      level.paint(ctx, panel === 1 ? allIds : new Set());
      ctx.restore();
      // Panel frame and label.
      ctx.strokeStyle = '#3a2e22';
      ctx.lineWidth = 4;
      ctx.strokeRect(origin.x + 2, origin.y + 2, PANEL_W - 4, PANEL_H - 4);
      ctx.fillStyle = 'rgba(58, 46, 34, 0.85)';
      ctx.beginPath();
      ctx.roundRect(origin.x + 10, origin.y + 10, 74, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#f2e6c8';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(panel === 0 ? 'PICTURE A' : 'PICTURE B', origin.x + 47, origin.y + 24);
    }

    // Found markers on both panels, drawn in lockstep.
    for (const difference of level.differences) {
      if (!tracker.isFound(difference)) continue;
      const startedAt = this.foundAnimations.get(difference.id) ?? now;
      const age = frozen ? 1000 : now - startedAt;
      const progress = Math.min(1, age / 350);
      for (let panel = 0; panel < 2; panel++) {
        const origin = this.panelOrigin(panel);
        drawMarkerRing(ctx, origin.x + difference.x, origin.y + difference.y,
          difference.r + 4, progress, '#ffb81e');
      }
    }

    // Hint: a pulsing dashed ring around one unfound difference, both panels.
    if (tracker.hintIsActive(now)) {
      const hinted = tracker.hintedDifference();
      if (hinted) {
        const pulse = 1 + Math.sin(now / 180) * 0.12;
        for (let panel = 0; panel < 2; panel++) {
          const origin = this.panelOrigin(panel);
          ctx.beginPath();
          ctx.arc(origin.x + hinted.x, origin.y + hinted.y, (hinted.r + 10) * pulse, 0, Math.PI * 2);
          ctx.setLineDash([10, 8]);
          ctx.strokeStyle = '#7fe08a';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // Wrong-click flashes: a red X that fades quickly.
    this.wrongFlashes = this.wrongFlashes.filter((f) => now - f.startedAt < 500);
    for (const flash of this.wrongFlashes) {
      const age = now - flash.startedAt;
      const alpha = 1 - age / 500;
      const origin = this.panelOrigin(flash.panel);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#e03a2f';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(origin.x + flash.x - s, origin.y + flash.y - s);
      ctx.lineTo(origin.x + flash.x + s, origin.y + flash.y + s);
      ctx.moveTo(origin.x + flash.x + s, origin.y + flash.y - s);
      ctx.lineTo(origin.x + flash.x - s, origin.y + flash.y + s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineCap = 'butt';
    }

    // Floating score texts, rising and fading.
    this.floatingTexts = this.floatingTexts.filter((t) => now - t.startedAt < 1100);
    for (const ft of this.floatingTexts) {
      const age = now - ft.startedAt;
      const rise = (age / 1100) * 34;
      ctx.globalAlpha = 1 - age / 1100;
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 4;
      const origin = this.panelOrigin(0);
      // Float above the left panel's copy of the spot.
      ctx.strokeText(ft.text, origin.x + ft.x, ft.y - rise);
      ctx.fillText(ft.text, origin.x + ft.x, ft.y - rise);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
