// scenes.js — the three hand-drawn scenes of "Odd Twin".
//
// Every picture is drawn by code on a canvas, so the two panels are always
// pixel-perfect twins except for the differences: paint(ctx, altered) draws
// the scene, and `altered` is the set of difference ids that should be drawn
// in their changed form. The left panel is painted with an empty set, the
// right panel with every difference id, so the right picture is the odd twin.
//
// Panel space is 560 x 420. Each level lists its differences with the centre
// and radius of the circle a click must land in, plus a plain-language hint
// label shown after the level is cleared.

export const PANEL_W = 560;
export const PANEL_H = 420;

// ---- small canvas helpers -------------------------------------------------

function circle(ctx, x, y, r, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth ?? 2; ctx.stroke(); }
}

function ellipse(ctx, x, y, rx, ry, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth ?? 2; ctx.stroke(); }
}

function rect(ctx, x, y, w, h, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth ?? 2; ctx.stroke(); }
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth ?? 2; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, stroke, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth ?? 2;
  ctx.stroke();
}

function poly(ctx, points, fill, stroke, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth ?? 2; ctx.stroke(); }
}

function text(ctx, str, x, y, font, fill, align) {
  ctx.font = font;
  ctx.textAlign = align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText(str, x, y);
}

// ---- Level 1: Sunny Breakfast Nook ----------------------------------------

function paintBreakfastNook(ctx, altered) {
  // Wall and floor.
  rect(ctx, 0, 0, 560, 330, '#f6e3bd');
  rect(ctx, 0, 330, 560, 90, '#a9713f');
  for (let x = 0; x < 560; x += 56) line(ctx, x, 330, x, 420, '#96622f', 2);
  line(ctx, 0, 330, 560, 330, '#7c4f22', 4);
  // A few wall speckles so the eye has texture to search.
  ctx.fillStyle = '#ecd9a8';
  for (let i = 0; i < 40; i++) circle(ctx, (i * 137) % 560, (i * 89) % 320 + 5, 2);

  // Window with sky, sun and curtains.
  rect(ctx, 36, 36, 160, 160, '#ffffff');
  const sky = ctx.createLinearGradient(0, 44, 0, 188);
  sky.addColorStop(0, '#8ec8ee');
  sky.addColorStop(1, '#d8eefc');
  rect(ctx, 44, 44, 144, 144, sky);
  // Sun: in the odd twin it wears sunglasses.
  circle(ctx, 150, 78, 24, '#ffd93b', '#e8a91c', 3);
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    line(ctx, 150 + Math.cos(ang) * 30, 78 + Math.sin(ang) * 30,
      150 + Math.cos(ang) * 38, 78 + Math.sin(ang) * 38, '#f5b81e', 3);
  }
  if (altered.has('sun-glasses')) {
    circle(ctx, 141, 76, 7, '#22242e');
    circle(ctx, 159, 76, 7, '#22242e');
    line(ctx, 148, 76, 152, 76, '#22242e', 3);
    line(ctx, 134, 74, 128, 70, '#22242e', 3);
    line(ctx, 166, 74, 172, 70, '#22242e', 3);
  }
  line(ctx, 116, 44, 116, 188, '#ffffff', 5);
  line(ctx, 44, 116, 188, 116, '#ffffff', 5);
  // Curtains.
  poly(ctx, [[28, 28], [52, 28], [58, 200], [30, 200]], '#e86a4a');
  poly(ctx, [[204, 28], [180, 28], [174, 200], [202, 200]], '#e86a4a');
  line(ctx, 28, 28, 204, 28, '#c94f33', 5);

  // Framed picture: a fish in one twin, a bird in the other.
  rect(ctx, 252, 52, 76, 60, '#8a5a2b');
  rect(ctx, 258, 58, 64, 48, '#bfe3f0');
  if (!altered.has('picture-fish')) {
    ellipse(ctx, 290, 82, 16, 9, '#ff8c42');
    poly(ctx, [[304, 82], [314, 73], [314, 91]], '#ff8c42');
    circle(ctx, 280, 80, 2, '#22242e');
  } else {
    circle(ctx, 290, 84, 11, '#5b8dd9');
    ellipse(ctx, 290, 76, 8, 5, '#7fb0e8');
    poly(ctx, [[300, 84], [308, 87], [300, 89]], '#f5b81e');
    circle(ctx, 293, 80, 2, '#22242e');
    line(ctx, 284, 94, 280, 100, '#f5b81e', 2);
    line(ctx, 292, 94, 292, 100, '#f5b81e', 2);
  }

  // Wall clock: 3:00 in one twin, 4:30 in the other.
  circle(ctx, 420, 88, 38, '#ffffff', '#3a2e22', 5);
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    line(ctx, 420 + Math.cos(ang) * 32, 88 + Math.sin(ang) * 32,
      420 + Math.cos(ang) * 35, 88 + Math.sin(ang) * 35, '#3a2e22', 2);
  }
  if (!altered.has('clock-hands')) {
    line(ctx, 420, 88, 420, 62, '#3a2e22', 3); // minute hand up
    line(ctx, 420, 88, 440, 88, '#3a2e22', 4); // hour hand right
  } else {
    line(ctx, 420, 88, 420, 114, '#3a2e22', 3); // minute hand down
    line(ctx, 420, 88, 434, 100, '#3a2e22', 4); // hour hand near 4-5
  }
  circle(ctx, 420, 88, 4, '#3a2e22');

  // Shelf with three jars.
  rect(ctx, 300, 206, 240, 10, '#8a5a2b');
  roundRect(ctx, 320, 168, 34, 38, 6, '#cfe8b8', '#5b7a45', 2);
  roundRect(ctx, 380, 160, 34, 46, 6, '#f2c94c', '#a07d1e', 2);
  roundRect(ctx, 440, 172, 34, 34, 6, '#e8a0a0', '#8a4a4a', 2);
  rect(ctx, 320, 160, 34, 8, '#5b7a45');
  rect(ctx, 380, 152, 34, 8, '#a07d1e');
  rect(ctx, 440, 164, 34, 8, '#8a4a4a');

  // Rug under the table.
  ellipse(ctx, 280, 388, 215, 26, '#c94f4f');
  ellipse(ctx, 280, 388, 185, 20, '#e8d9a8');
  ellipse(ctx, 280, 388, 140, 14, '#c94f4f');

  // Table.
  rect(ctx, 50, 302, 460, 16, '#8a5a2b');
  rect(ctx, 70, 318, 16, 102, '#6e4520');
  rect(ctx, 474, 318, 16, 102, '#6e4520');

  // Potted plant on the left end of the table.
  poly(ctx, [[96, 282], [128, 282], [122, 302], [102, 302]], '#c96a3b');
  ctx.strokeStyle = '#3f7a3a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(112, 282); ctx.quadraticCurveTo(96, 258, 88, 246); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(112, 282); ctx.quadraticCurveTo(112, 252, 112, 240); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(112, 282); ctx.quadraticCurveTo(128, 258, 136, 248); ctx.stroke();
  circle(ctx, 88, 244, 7, '#4c8a44');
  circle(ctx, 112, 238, 7, '#5da254');
  circle(ctx, 136, 246, 7, '#4c8a44');

  // Teapot: its lid knob changes colour in the odd twin.
  ellipse(ctx, 270, 288, 42, 26, '#2f8f83', '#1e5f57', 3);
  poly(ctx, [[230, 280], [208, 268], [214, 292], [230, 292]], '#2f8f83', '#1e5f57', 2);
  ctx.beginPath(); ctx.arc(312, 288, 16, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = '#1e5f57'; ctx.lineWidth = 5; ctx.stroke();
  ellipse(ctx, 270, 264, 26, 8, '#2f8f83', '#1e5f57', 2);
  circle(ctx, 270, 253, 7, altered.has('teapot-knob') ? '#d23c2e' : '#d4a017', '#7a5a10', 2);

  // Two mugs: the second mug changes colour in the odd twin.
  roundRect(ctx, 345, 272, 40, 36, 5, '#3b7dd8', '#23507f', 2);
  ctx.beginPath(); ctx.arc(387, 290, 10, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = '#23507f'; ctx.lineWidth = 4; ctx.stroke();
  roundRect(ctx, 415, 272, 40, 36, 5, altered.has('mug-color') ? '#4caf50' : '#d23c2e', '#6e1f16', 2);
  ctx.beginPath(); ctx.arc(457, 290, 10, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = '#6e1f16'; ctx.lineWidth = 4; ctx.stroke();

  // Fruit bowl: one apple goes missing in the odd twin.
  ellipse(ctx, 492, 300, 30, 10, '#7a4a8a');
  circle(ctx, 476, 284, 9, '#e03a2f', '#8a1f16', 2);
  if (!altered.has('apple-count')) circle(ctx, 492, 276, 9, '#e03a2f', '#8a1f16', 2);
  circle(ctx, 508, 284, 9, '#e03a2f', '#8a1f16', 2);
  line(ctx, 476, 276, 476, 270, '#3f7a3a', 2);
  line(ctx, 508, 276, 508, 270, '#3f7a3a', 2);

  // Cat asleep on the rug: its tail curls up in one twin, lies flat in the other.
  ellipse(ctx, 140, 378, 46, 16, '#8a8f98');
  circle(ctx, 102, 370, 14, '#8a8f98');
  poly(ctx, [[92, 360], [96, 348], [102, 358]], '#8a8f98');
  poly(ctx, [[108, 358], [114, 348], [116, 360]], '#8a8f98');
  line(ctx, 96, 368, 104, 368, '#22242e', 2);
  ctx.strokeStyle = '#8a8f98';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (!altered.has('cat-tail')) {
    ctx.moveTo(184, 376); ctx.quadraticCurveTo(200, 372, 198, 352);
  } else {
    ctx.moveTo(184, 378); ctx.quadraticCurveTo(200, 382, 212, 380);
  }
  ctx.stroke();
  ctx.lineCap = 'butt';
}

// ---- Level 2: Pip's Garden Shed -------------------------------------------

function paintGardenShed(ctx, altered) {
  // Plank wall and wooden floor.
  rect(ctx, 0, 0, 560, 350, '#c89b6a');
  for (let x = 0; x < 560; x += 56) line(ctx, x, 0, x, 350, '#a97e4e', 2);
  rect(ctx, 0, 350, 560, 70, '#8a5a2b');
  for (let y = 350; y < 420; y += 18) line(ctx, 0, y, 560, y, '#6e4520', 2);

  // Window with sky: a cloud drifts away in the odd twin.
  rect(ctx, 200, 40, 120, 110, '#ffffff');
  const sky = ctx.createLinearGradient(0, 48, 0, 142);
  sky.addColorStop(0, '#7ec3ee');
  sky.addColorStop(1, '#d8eefc');
  rect(ctx, 208, 48, 104, 94, sky);
  circle(ctx, 292, 66, 14, '#ffd93b');
  if (!altered.has('cloud-missing')) {
    ellipse(ctx, 244, 76, 22, 10, '#ffffff');
    ellipse(ctx, 258, 70, 16, 10, '#ffffff');
    ellipse(ctx, 232, 72, 12, 8, '#ffffff');
  }
  line(ctx, 260, 48, 260, 142, '#ffffff', 5);
  line(ctx, 208, 95, 312, 95, '#ffffff', 5);

  // Birdhouse on a post: round hole in one twin, square in the other.
  rect(ctx, 84, 150, 10, 200, '#7a4a22');
  poly(ctx, [[62, 108], [90, 84], [118, 108]], '#a03a2e');
  rect(ctx, 66, 108, 48, 42, '#e8b96a', '#7a4a22', 2);
  if (!altered.has('birdhouse-hole')) {
    circle(ctx, 90, 128, 8, '#3a2e22');
  } else {
    rect(ctx, 82, 120, 16, 16, '#3a2e22');
  }
  line(ctx, 78, 146, 102, 146, '#7a4a22', 4);

  // Pegboard with tools: hammer in one twin, wrench in the other.
  rect(ctx, 370, 60, 170, 140, '#d9b380', '#8a6a3a', 2);
  ctx.fillStyle = '#8a6a3a';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) circle(ctx, 386 + c * 20, 76 + r * 26, 2);
  if (!altered.has('tool-swap')) {
    // Hammer.
    rect(ctx, 402, 108, 8, 52, '#7a4a22');
    rect(ctx, 388, 96, 36, 16, '#9aa0a8', '#5a6068', 2);
  } else {
    // Wrench.
    line(ctx, 406, 160, 406, 104, '#9aa0a8', 8);
    ctx.beginPath(); ctx.arc(406, 100, 10, Math.PI * 0.15, Math.PI * 1.5); ctx.strokeStyle = '#9aa0a8'; ctx.lineWidth = 6; ctx.stroke();
  }
  // Hand saw.
  poly(ctx, [[452, 120], [500, 120], [500, 140], [452, 140]], '#c8ccd2', '#5a6068', 2);
  rect(ctx, 500, 116, 14, 28, '#7a4a22');
  // Trowel.
  poly(ctx, [[520, 150], [536, 128], [544, 150]], '#c8ccd2', '#5a6068', 2);
  line(ctx, 532, 150, 532, 172, '#7a4a22', 6);

  // Shelf with two terracotta pots: one cracks in the odd twin.
  rect(ctx, 40, 212, 150, 10, '#8a5a2b');
  poly(ctx, [[76, 182], [108, 182], [102, 212], [82, 212]], '#c96a3b');
  poly(ctx, [[136, 182], [168, 182], [162, 212], [142, 212]], '#c96a3b');
  if (altered.has('pot-crack')) {
    line(ctx, 148, 184, 154, 194, '#5a2e16', 2);
    line(ctx, 154, 194, 148, 204, '#5a2e16', 2);
  }
  ctx.strokeStyle = '#3f7a3a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(92, 182); ctx.quadraticCurveTo(86, 164, 80, 158); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(92, 182); ctx.quadraticCurveTo(98, 162, 104, 156); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(152, 182); ctx.quadraticCurveTo(146, 166, 142, 158); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(152, 182); ctx.quadraticCurveTo(160, 164, 166, 158); ctx.stroke();

  // Hanging lantern: glowing in one twin, dark in the other.
  line(ctx, 480, 0, 480, 62, '#3a2e22', 3);
  circle(ctx, 480, 66, 5, '#3a2e22');
  roundRect(ctx, 462, 70, 36, 44, 8, altered.has('lantern-glow') ? '#5a5a66' : '#ffd93b', '#3a2e22', 3);
  line(ctx, 462, 82, 498, 82, '#3a2e22', 2);
  line(ctx, 462, 100, 498, 100, '#3a2e22', 2);
  if (!altered.has('lantern-glow')) {
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      line(ctx, 480 + Math.cos(ang) * 26, 92 + Math.sin(ang) * 26,
        480 + Math.cos(ang) * 34, 92 + Math.sin(ang) * 34, '#f5b81e', 2);
    }
  }

  // Watering can (decoration).
  ellipse(ctx, 300, 330, 34, 22, '#4c8a44', '#2e5a28', 2);
  poly(ctx, [[268, 322], [238, 306], [244, 322], [268, 330]], '#4c8a44', '#2e5a28', 2);
  ctx.beginPath(); ctx.arc(334, 322, 14, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = '#2e5a28'; ctx.lineWidth = 5; ctx.stroke();
  ellipse(ctx, 300, 310, 16, 6, '#4c8a44', '#2e5a28', 2);

  // Garden boots: a pair in one twin, a single boot in the other.
  poly(ctx, [[118, 330], [142, 330], [142, 372], [118, 372]], '#3f7a3a');
  poly(ctx, [[118, 372], [142, 372], [150, 386], [118, 386]], '#3f7a3a');
  if (!altered.has('boot-missing')) {
    poly(ctx, [[152, 330], [176, 330], [176, 372], [152, 372]], '#3f7a3a');
    poly(ctx, [[152, 372], [176, 372], [184, 386], [152, 386]], '#3f7a3a');
  }

  // Sunflower in a pot: yellow petals in one twin, orange in the other.
  poly(ctx, [[282, 340], [318, 340], [312, 372], [288, 372]], '#c96a3b');
  line(ctx, 300, 340, 300, 306, '#3f7a3a', 5);
  ellipse(ctx, 288, 326, 10, 5, '#4c8a44');
  const petal = altered.has('flower-color') ? '#ff8c42' : '#ffd93b';
  for (let a = 0; a < 10; a++) {
    const ang = (a / 10) * Math.PI * 2;
    ellipse(ctx, 300 + Math.cos(ang) * 22, 288 + Math.sin(ang) * 22, 12, 7, petal);
  }
  circle(ctx, 300, 288, 14, '#7a4a22');

  // Wheelbarrow: its handles point down in one twin, up in the other.
  poly(ctx, [[400, 330], [470, 330], [458, 366], [412, 366]], '#7fb0e8', '#3a5a8a', 2);
  circle(ctx, 452, 372, 15, '#3a2e22');
  circle(ctx, 452, 372, 6, '#9aa0a8');
  line(ctx, 400, 336, 378, altered.has('barrow-handle') ? 312 : 352, '#7a4a22', 5);
  line(ctx, 404, 360, 386, altered.has('barrow-handle') ? 338 : 374, '#7a4a22', 5);

  // Hose coil: three loops in one twin, two in the other.
  ctx.strokeStyle = '#2f7a3a';
  ctx.lineWidth = 7;
  circle(ctx, 60, 300, 26, null, '#2f7a3a', 7);
  circle(ctx, 60, 300, 16, null, '#2f7a3a', 7);
  if (!altered.has('hose-coils')) circle(ctx, 60, 300, 6, null, '#2f7a3a', 7);
}

// ---- Level 3: The Lantern Library -----------------------------------------

function paintLanternLibrary(ctx, altered) {
  // Deep teal wall and wooden floor.
  rect(ctx, 0, 0, 560, 340, '#2e4a4a');
  rect(ctx, 0, 340, 560, 80, '#6e4520');
  for (let y = 340; y < 420; y += 20) line(ctx, 0, y, 560, y, '#54341a', 2);
  // Faint wallpaper diamonds.
  ctx.strokeStyle = '#3a5c5c';
  ctx.lineWidth = 1;
  for (let x = 0; x < 560; x += 40) for (let y = 0; y < 340; y += 40) {
    ctx.beginPath(); ctx.moveTo(x + 20, y + 8); ctx.lineTo(x + 32, y + 20); ctx.lineTo(x + 20, y + 32); ctx.lineTo(x + 8, y + 20); ctx.closePath(); ctx.stroke();
  }

  // Bookshelves left and right, packed with colourful spines.
  function bookshelf(x, y, w, h) {
    rect(ctx, x, y, w, h, '#5a3a1e', '#3a2410', 3);
    const rows = [y + 8, y + 62, y + 116];
    for (const ry of rows) {
      let bx = x + 8;
      let i = 0;
      while (bx < x + w - 14) {
        const bw = 10 + ((i * 7) % 9);
        const bh = 44 + ((i * 5) % 8);
        const colors = ['#b03a2e', '#2e6db0', '#3f8a4c', '#d4a017', '#7a4a8a', '#c96a3b'];
        rect(ctx, bx, ry + (52 - bh), bw, bh, colors[i % colors.length]);
        bx += bw + 2;
        i++;
      }
      rect(ctx, x + 4, ry + 52, w - 8, 6, '#7a4a22');
    }
  }
  bookshelf(16, 24, 160, 240);
  bookshelf(384, 24, 160, 240);

  // One spine in the left shelf changes colour in the odd twin.
  rect(ctx, 118, 96, 12, 46, altered.has('book-spine') ? '#3f8a4c' : '#b03a2e');
  line(ctx, 118, 106, 130, 106, '#f2e6c8', 2);
  line(ctx, 118, 132, 130, 132, '#f2e6c8', 2);

  // Owl figurine on the left shelf: eyes open in one twin, closed in the other.
  ellipse(ctx, 95, 52, 16, 20, '#8a6a3a');
  poly(ctx, [[82, 36], [86, 26], [92, 34]], '#8a6a3a');
  poly(ctx, [[98, 34], [104, 26], [108, 36]], '#8a6a3a');
  if (!altered.has('owl-eyes')) {
    circle(ctx, 89, 48, 5, '#ffffff');
    circle(ctx, 101, 48, 5, '#ffffff');
    circle(ctx, 89, 48, 2, '#22242e');
    circle(ctx, 101, 48, 2, '#22242e');
  } else {
    ctx.beginPath(); ctx.arc(89, 48, 5, Math.PI, 0); ctx.strokeStyle = '#22242e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(101, 48, 5, Math.PI, 0); ctx.stroke();
  }
  poly(ctx, [[95, 54], [91, 60], [99, 60]], '#f5b81e');

  // Night window in the middle: moon phase and star count change.
  rect(ctx, 220, 40, 120, 120, '#5a3a1e');
  rect(ctx, 228, 48, 104, 104, '#1a2a4a');
  const stars = altered.has('star-count')
    ? [[246, 66], [268, 58], [318, 120]]
    : [[246, 66], [268, 58], [240, 108], [318, 120], [312, 66]];
  ctx.fillStyle = '#ffffff';
  for (const [sx, sy] of stars) {
    ctx.beginPath();
    ctx.moveTo(sx, sy - 4); ctx.lineTo(sx + 1.5, sy - 1.5); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx + 1.5, sy + 1.5);
    ctx.lineTo(sx, sy + 4); ctx.lineTo(sx - 1.5, sy + 1.5); ctx.lineTo(sx - 4, sy); ctx.lineTo(sx - 1.5, sy - 1.5);
    ctx.closePath(); ctx.fill();
  }
  if (!altered.has('moon-phase')) {
    circle(ctx, 300, 82, 18, '#f2e6c8', '#d4c89a', 2);
    circle(ctx, 294, 76, 4, '#d4c89a');
    circle(ctx, 306, 88, 3, '#d4c89a');
  } else {
    ctx.beginPath(); ctx.arc(300, 82, 18, -Math.PI / 2.4, Math.PI / 2.4); ctx.closePath();
    ctx.fillStyle = '#f2e6c8'; ctx.fill();
    ctx.beginPath(); ctx.arc(306, 82, 15, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
    ctx.fillStyle = '#1a2a4a'; ctx.fill();
  }
  line(ctx, 280, 48, 280, 152, '#5a3a1e', 5);
  line(ctx, 228, 100, 332, 100, '#5a3a1e', 5);

  // Cobweb in the top-right corner, only in the odd twin.
  if (altered.has('cobweb')) {
    ctx.strokeStyle = '#d8d8e0';
    ctx.lineWidth = 1.5;
    for (let a = 0; a <= 4; a++) {
      const ang = Math.PI / 2 + (a / 4) * (Math.PI / 2);
      line(ctx, 556, 4, 556 + Math.cos(ang) * 44, 4 + Math.sin(ang) * 44);
    }
    for (let r = 12; r <= 40; r += 14) {
      ctx.beginPath();
      ctx.arc(556, 4, r, Math.PI / 2, Math.PI);
      ctx.stroke();
    }
  }

  // Pinned map on the wall: its pin is red in one twin, gone in the other.
  rect(ctx, 176, 176, 64, 46, '#e8d9a8', '#8a6a3a', 2);
  line(ctx, 184, 190, 196, 200, '#7a4a22', 2);
  line(ctx, 196, 200, 208, 186, '#7a4a22', 2);
  line(ctx, 208, 186, 224, 196, '#7a4a22', 2);
  line(ctx, 224, 196, 232, 188, '#7a4a22', 2);
  circle(ctx, 208, 208, 4, '#2e6db0');
  if (!altered.has('map-pin')) circle(ctx, 232, 182, 5, '#d23c2e', '#8a1f16', 2);

  // Ladder leaning on the right shelf: five rungs in one twin, four in the other.
  line(ctx, 392, 270, 420, 150, '#8a5a2b', 6);
  line(ctx, 424, 270, 452, 150, '#8a5a2b', 6);
  const rungs = altered.has('ladder-rung') ? [246, 216, 186, 156] : [246, 222, 198, 174, 150];
  for (const ry of rungs) {
    const t = (270 - ry) / 120;
    const x1 = 392 + (420 - 392) * t;
    const x2 = 424 + (452 - 424) * t;
    line(ctx, x1, ry, x2, ry, '#8a5a2b', 5);
  }

  // Rug: stripes in one twin, diamonds in the other.
  ellipse(ctx, 280, 392, 185, 24, '#7a4a8a');
  if (!altered.has('rug-pattern')) {
    for (let i = -2; i <= 2; i++) ellipse(ctx, 280 + i * 52, 392, 10, 24, '#e8d9a8');
  } else {
    for (let i = -2; i <= 2; i++) {
      const cx = 280 + i * 52;
      poly(ctx, [[cx, 372], [cx + 12, 392], [cx, 412], [cx - 12, 392]], '#e8d9a8');
    }
  }

  // Desk.
  rect(ctx, 60, 300, 440, 14, '#5a3a1e');
  rect(ctx, 80, 314, 14, 96, '#3a2410');
  rect(ctx, 466, 314, 14, 96, '#3a2410');

  // Globe: the land sits differently in the odd twin.
  circle(ctx, 280, 258, 30, '#4a90d9', '#2e5a8a', 3);
  if (!altered.has('globe-land')) {
    ellipse(ctx, 270, 250, 12, 8, '#3f8a4c');
    ellipse(ctx, 290, 268, 10, 6, '#3f8a4c');
  } else {
    ellipse(ctx, 292, 248, 10, 9, '#3f8a4c');
    ellipse(ctx, 268, 270, 9, 6, '#3f8a4c');
  }
  line(ctx, 280, 288, 280, 300, '#8a6a3a', 4);
  ellipse(ctx, 280, 300, 14, 3, '#8a6a3a');

  // Stack of books on the desk (decoration).
  rect(ctx, 330, 284, 54, 8, '#b03a2e');
  rect(ctx, 334, 276, 46, 8, '#2e6db0');
  rect(ctx, 338, 268, 38, 8, '#3f8a4c');

  // Teacup: handle on the right in one twin, on the left in the other.
  ellipse(ctx, 150, 306, 26, 5, '#ffffff', '#8a8f98', 2);
  roundRect(ctx, 134, 282, 32, 22, 4, '#ffffff', '#8a8f98', 2);
  ctx.beginPath();
  if (!altered.has('teacup-handle')) {
    ctx.arc(168, 293, 8, -Math.PI / 2, Math.PI / 2);
  } else {
    ctx.arc(132, 293, 8, Math.PI / 2, Math.PI * 1.5);
  }
  ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 3; ctx.stroke();
  ellipse(ctx, 150, 284, 12, 3, '#c98a4a');

  // Candle: lit in one twin, blown out in the other.
  rect(ctx, 446, 282, 8, 20, '#f2e6c8', '#8a8f98', 2);
  ellipse(ctx, 450, 302, 12, 4, '#d4a017');
  if (!altered.has('candle-flame')) {
    ctx.beginPath();
    ctx.moveTo(450, 258);
    ctx.quadraticCurveTo(458, 268, 450, 276);
    ctx.quadraticCurveTo(442, 268, 450, 258);
    ctx.fillStyle = '#ffb81e'; ctx.fill();
    circle(ctx, 450, 270, 3, '#fff3b0');
  } else {
    ctx.strokeStyle = '#b8b8c0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(450, 280); ctx.quadraticCurveTo(454, 270, 450, 262); ctx.stroke();
  }

  // Desk lamp: green shade in one twin, purple in the other.
  line(ctx, 500, 302, 500, 268, '#3a2e22', 4);
  ellipse(ctx, 500, 302, 12, 3, '#3a2e22');
  poly(ctx, [[484, 268], [516, 268], [508, 246], [492, 246]],
    altered.has('lamp-shade') ? '#7a4a8a' : '#3f8a4c', '#2e2a22', 2);
  if (!altered.has('lamp-shade')) circle(ctx, 500, 272, 5, '#ffe9a8');
}

// ---- Level catalogue -------------------------------------------------------

export const LEVELS = [
  {
    id: 'breakfast-nook',
    name: 'Sunny Breakfast Nook',
    subtitle: 'Morning tea, a sleepy cat, and seven sneaky changes.',
    timeLimit: 150,
    paint: paintBreakfastNook,
    differences: [
      { id: 'sun-glasses', x: 150, y: 78, r: 30, label: 'The sun put on sunglasses' },
      { id: 'clock-hands', x: 420, y: 88, r: 38, label: 'The clock shows a different time' },
      { id: 'teapot-knob', x: 270, y: 253, r: 14, label: 'The teapot knob changed colour' },
      { id: 'mug-color', x: 435, y: 290, r: 20, label: 'The second mug changed colour' },
      { id: 'cat-tail', x: 196, y: 356, r: 16, label: "The cat's tail moved" },
      { id: 'apple-count', x: 492, y: 278, r: 16, label: 'An apple went missing from the bowl' },
      { id: 'picture-fish', x: 290, y: 82, r: 24, label: 'The picture on the wall changed' },
    ],
  },
  {
    id: 'garden-shed',
    name: "Pip's Garden Shed",
    subtitle: 'Tools, boots and one sunflower — nine changes hiding in the shed.',
    timeLimit: 180,
    paint: paintGardenShed,
    differences: [
      { id: 'lantern-glow', x: 480, y: 92, r: 22, label: 'The lantern went dark' },
      { id: 'birdhouse-hole', x: 90, y: 128, r: 18, label: 'The birdhouse hole changed shape' },
      { id: 'boot-missing', x: 164, y: 358, r: 22, label: 'One garden boot went missing' },
      { id: 'flower-color', x: 300, y: 288, r: 26, label: 'The sunflower changed colour' },
      { id: 'tool-swap', x: 406, y: 126, r: 24, label: 'The hammer became a wrench' },
      { id: 'cloud-missing', x: 246, y: 72, r: 22, label: 'The cloud drifted away' },
      { id: 'barrow-handle', x: 398, y: 336, r: 20, label: 'The wheelbarrow handles moved' },
      { id: 'hose-coils', x: 60, y: 300, r: 24, label: 'The hose lost a coil' },
      { id: 'pot-crack', x: 152, y: 196, r: 18, label: 'A pot cracked' },
    ],
  },
  {
    id: 'lantern-library',
    name: 'The Lantern Library',
    subtitle: 'Twelve changes among the shelves — the hardest hunt of all.',
    timeLimit: 240,
    paint: paintLanternLibrary,
    differences: [
      { id: 'owl-eyes', x: 95, y: 48, r: 16, label: 'The owl closed its eyes' },
      { id: 'globe-land', x: 280, y: 258, r: 30, label: 'The globe turned' },
      { id: 'candle-flame', x: 450, y: 268, r: 16, label: 'The candle went out' },
      { id: 'ladder-rung', x: 418, y: 204, r: 24, label: 'The ladder lost a rung' },
      { id: 'moon-phase', x: 300, y: 82, r: 22, label: 'The moon changed phase' },
      { id: 'teacup-handle', x: 150, y: 293, r: 18, label: 'The teacup handle switched sides' },
      { id: 'map-pin', x: 232, y: 182, r: 14, label: 'The map lost its pin' },
      { id: 'book-spine', x: 124, y: 118, r: 14, label: 'A book spine changed colour' },
      { id: 'rug-pattern', x: 280, y: 392, r: 26, label: 'The rug pattern changed' },
      { id: 'lamp-shade', x: 500, y: 258, r: 20, label: 'The lamp shade changed colour' },
      { id: 'cobweb', x: 534, y: 32, r: 20, label: 'A cobweb appeared in the corner' },
      { id: 'star-count', x: 246, y: 66, r: 18, label: 'Two stars vanished from the sky' },
    ],
  },
];
