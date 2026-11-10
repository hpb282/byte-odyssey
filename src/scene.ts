import { mapById } from './catalog';
import { drawSprite } from './sprites';
import type { MapTheme } from './catalog';
import type { CharacterId, GameId, Phase } from './types';

export const SCENE_WIDTH = 960,
  SCENE_HEIGHT = 360;
const navy = '#15314e';
type C = CanvasRenderingContext2D;
function rect(c: C, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
function poly(c: C, points: number[][], color: string) {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
}
function pixelCircle(c: C, x: number, y: number, r: number, color: string) {
  for (let dy = -r; dy < r; dy += 4) {
    const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) / 4) * 4;
    rect(c, x - dx, y + dy, dx * 2, 4, color);
  }
}
function cloud(c: C, x: number, y: number, s = 1) {
  rect(c, x, y + 12 * s, 95 * s, 15 * s, '#fff9ef');
  rect(c, x + 18 * s, y, 36 * s, 25 * s, '#fff9ef');
  rect(c, x + 50 * s, y + 7 * s, 28 * s, 20 * s, '#fff9ef');
}
function tree(c: C, x: number, y: number, s = 1, snow = false) {
  rect(c, x - 6 * s, y - 65 * s, 12 * s, 70 * s, '#9b7458');
  rect(c, x - 32 * s, y - 94 * s, 64 * s, 38 * s, snow ? '#e9f3fd' : '#69b96b');
  rect(c, x - 24 * s, y - 111 * s, 46 * s, 35 * s, snow ? '#f8fcff' : '#83cc6b');
  rect(c, x - 38 * s, y - 75 * s, 72 * s, 23 * s, snow ? '#dae9f7' : '#58a56a');
}
function palm(c: C, x: number, y: number) {
  poly(
    c,
    [
      [x, y],
      [x + 9, y],
      [x + 16, y - 104],
      [x + 10, y - 107],
    ],
    '#ae8056',
  );
  for (const d of [-1, 1]) {
    poly(
      c,
      [
        [x + 13, y - 104],
        [x + 13 + d * 24, y - 122],
        [x + 13 + d * 63, y - 103],
        [x + 13 + d * 32, y - 110],
      ],
      '#72b16b',
    );
    poly(
      c,
      [
        [x + 13, y - 104],
        [x + 13 + d * 33, y - 83],
        [x + 13 + d * 48, y - 73],
        [x + 13 + d * 33, y - 103],
      ],
      '#5aa36b',
    );
  }
}
function star(c: C, x: number, y: number, size: number, color = '#ffe077') {
  poly(
    c,
    [
      [x, y - size],
      [x + size * 0.28, y - size * 0.28],
      [x + size, y - size * 0.2],
      [x + size * 0.48, y + size * 0.3],
      [x + size * 0.6, y + size],
      [x, y + size * 0.6],
      [x - size * 0.6, y + size],
      [x - size * 0.48, y + size * 0.3],
      [x - size, y - size * 0.2],
      [x - size * 0.28, y - size * 0.28],
    ],
    color,
  );
}
function candy(c: C, x: number, y: number, color: string) {
  rect(c, x - 3, y - 85, 6, 85, '#f6e7cc');
  pixelCircle(c, x, y - 85, 27, color);
  pixelCircle(c, x, y - 85, 16, '#fff0dc');
  pixelCircle(c, x, y - 85, 8, color);
}
function mountain(c: C, x: number, y: number, w: number, h: number, color: string, snow = false) {
  poly(
    c,
    [
      [x, y],
      [x + w * 0.5, y - h],
      [x + w, y],
    ],
    color,
  );
  if (snow)
    poly(
      c,
      [
        [x + w * 0.33, y - h * 0.66],
        [x + w * 0.5, y - h],
        [x + w * 0.67, y - h * 0.66],
        [x + w * 0.55, y - h * 0.74],
        [x + w * 0.49, y - h * 0.64],
        [x + w * 0.43, y - h * 0.76],
      ],
      '#f4f8ff',
    );
}

function landscape(c: C, m: MapTheme, game: GameId) {
  rect(c, 0, 0, 960, 360, m.sky);
  if (m.theme === 'crystal') {
    rect(c, 0, 0, 960, 360, '#302743');
    for (let i = 0; i < 8; i++)
      poly(
        c,
        [
          [i * 140, 0],
          [i * 140 + 55, 0],
          [i * 140 + 32, 90],
        ],
        m.distant,
      );
    for (const [x, y] of [
      [75, 280],
      [870, 120],
      [790, 305],
    ])
      poly(
        c,
        [
          [x, y],
          [x - 18, y - 55],
          [x, y - 80],
          [x + 20, y - 45],
          [x + 15, y],
        ],
        m.accent,
      );
    return;
  }
  cloud(c, 88, 47, 0.8);
  cloud(c, 620, 31, 0.66);
  cloud(c, 810, 87, 0.55);
  if (m.theme === 'cloud') {
    for (let i = 0; i < 6; i++) cloud(c, i * 185 - 50, 210 + (i % 2) * 28, 1.7);
    for (let i = 0; i < 3; i++) {
      const x = 140 + i * 270;
      poly(
        c,
        [
          [x, 155],
          [x + 65, 155],
          [x + 45, 195],
          [x + 20, 183],
        ],
        m.ground,
      );
      rect(c, x - 3, 147, 74, 12, m.top);
    }
  } else if (m.theme === 'desert') {
    mountain(c, -60, 290, 620, 150, m.distant);
    mountain(c, 400, 285, 680, 130, '#efc57d');
    palm(c, 800, 280);
    rect(c, 810, 279, 120, 12, '#6ccfce');
  } else if (m.theme === 'coast') {
    rect(c, 0, 160, 960, 130, '#6bc9d9');
    for (let i = 0; i < 12; i++) rect(c, i * 100, 200 + (i % 3) * 18, 44, 3, '#d0f2ed');
    palm(c, 65, 270);
    palm(c, 835, 265);
    poly(
      c,
      [
        [740, 180],
        [770, 180],
        [752, 138],
      ],
      '#fff8e8',
    );
    rect(c, 739, 184, 40, 4, m.accent);
  } else if (m.theme === 'town') {
    for (let i = 0; i < 8; i++) {
      const x = i * 142 - 40,
        y = 135 + (i % 2) * 35;
      rect(c, x, y, 110, 145, ['#e5acc8', '#ffd39a', '#b6c6ee'][i % 3]);
      rect(c, x - 5, y - 10, 120, 14, m.accent);
      for (let j = 0; j < 2; j++) {
        rect(c, x + 18 + j * 47, y + 20, 25, 30, '#629fc3');
        rect(c, x + 18 + j * 47, y + 58, 25, 30, '#fff5d8');
      }
    }
  } else if (m.theme === 'village') {
    mountain(c, 10, 235, 460, 135, m.distant);
    mountain(c, 550, 240, 480, 100, m.distant);
    rect(c, 0, 220, 960, 100, '#e5d265');
    for (let i = 0; i < 55; i++) {
      const x = i * 29 - 30;
      rect(c, x, 265 + (i % 4) * 12, 3, 18, '#b3a24f');
      rect(c, x - 3, 262 + (i % 4) * 12, 9, 7, '#f4df7e');
    }
    rect(c, 90, 165, 110, 65, '#f6dfac');
    poly(
      c,
      [
        [73, 167],
        [140, 118],
        [212, 167],
      ],
      '#b77259',
    );
    rect(c, 130, 190, 22, 40, '#987752');
    for (let i = 0; i < 5; i++) {
      rect(c, 850 + i * 12, 140 - i * 3, 5, 160, '#79ae63');
      rect(c, 846 + i * 12, 155 - i * 3, 12, 4, '#a3d57a');
    }
  } else if (m.theme === 'candy') {
    mountain(c, 80, 275, 520, 140, '#f3bdd3');
    mountain(c, 510, 275, 550, 150, '#ecc3db');
    candy(c, 90, 280, '#f38fba');
    candy(c, 810, 270, '#b797dc');
    candy(c, 915, 245, '#f4bc79');
  } else {
    const snow = m.theme === 'snow';
    mountain(c, -40, 275, 580, 200, m.distant, snow);
    mountain(c, 430, 270, 580, 180, m.distant, snow);
    for (const [x, y, s] of [
      [35, 305, 1.6],
      [810, 290, 1.0],
      [900, 300, 1.25],
    ])
      tree(c, x, y, s, snow);
  }
  if (game === 'runner') {
    rect(c, 0, 302, 960, 58, m.ground);
    rect(c, 0, 300, 960, 13, m.top);
    for (let i = 0; i < 25; i++) {
      rect(c, i * 43 + 7, 326 + (i % 3) * 7, 20, 5, m.distant);
      if (m.theme !== 'snow') rect(c, i * 43, 297, 5, 8, m.top);
    }
    if (m.theme === 'forest')
      for (let i = 0; i < 8; i++) {
        const x = 80 + i * 119;
        rect(c, x, 285, 3, 15, '#5f9a57');
        rect(c, x - 4, 285, 11, 4, '#fff8d7');
        rect(c, x, 282, 4, 10, '#fff8d7');
      }
  }
}
function obstacle(c: C, m: MapTheme, x: number) {
  // Một kích thước duy nhất cho tất cả map của đường chạy.
  rect(c, x, 256, 72, 46, navy);
  rect(c, x + 3, 260, 66, 39, m.ground);
  rect(c, x + 3, 260, 66, 9, m.accent);
  if (m.theme === 'forest') {
    rect(c, x + 9, 270, 8, 20, '#edc18a');
    rect(c, x + 23, 275, 39, 4, '#966841');
  } else if (m.theme === 'candy') {
    rect(c, x + 11, 272, 12, 7, '#ffe9cf');
    rect(c, x + 42, 284, 11, 6, '#ffbfdb');
  } else if (m.theme === 'desert') {
    rect(c, x + 3, 280, 66, 3, '#f1cb86');
    rect(c, x + 35, 263, 3, 17, '#f1cb86');
  } else if (m.theme === 'snow') rect(c, x + 3, 260, 66, 12, '#f6faff');
}
function runner(c: C, m: MapTheme, character: CharacterId, u: number, wrong: number) {
  landscape(c, m, 'runner');
  const obstacleX = 430 - u * 280;
  obstacle(c, m, obstacleX);
  star(c, obstacleX + 36, 199, 13);
  const jump = Math.sin(Math.PI * u) * 115;
  drawSprite(c, character, 174 + wrong, 223 - jump, 78);
  if (u > 0.65)
    for (let i = 0; i < 5; i++) star(c, 210 + (i - 2) * 23, 190 - jump + (i % 2) * 15, 4, '#ffe596');
}
function asteroid(c: C, x: number, y: number, r: number, m: MapTheme) {
  pixelCircle(c, x, y, r, navy);
  pixelCircle(c, x, y, r - 4, m.ground);
  pixelCircle(c, x - 12, y - 8, 8, m.distant);
  pixelCircle(c, x + 14, y + 12, 10, m.distant);
  rect(c, x + 7, y - 23, 9, 6, m.top);
}
function space(c: C, m: MapTheme, character: CharacterId, u: number, wrong: number) {
  rect(c, 0, 0, 960, 360, m.sky);
  for (let i = 0; i < 53; i++) {
    const x = (i * 173 + 53) % 950,
      y = (i * 97 + 19) % 345;
    rect(c, x, y, i % 5 ? 2 : 4, i % 5 ? 2 : 4, i % 3 ? '#fff6d9' : m.accent);
  }
  if (m.theme === 'galaxy' || m.theme === 'nebula') {
    c.save();
    c.globalAlpha = 0.55;
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = m.distant;
      c.lineWidth = 9 + i * 4;
      c.beginPath();
      c.ellipse(150 + i * 12, 75, 125 + i * 28, 30 + i * 15, -0.35, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }
  if (m.theme === 'earth') {
    pixelCircle(c, 480, 600, 350, '#438ed3');
    for (const [x, y, w, h] of [
      [240, 298, 180, 45],
      [510, 278, 120, 37],
      [615, 315, 150, 50],
    ])
      rect(c, x, y, w, h, '#86ca81');
    cloud(c, 280, 280, 0.7);
    cloud(c, 650, 280, 0.7);
  } else {
    pixelCircle(c, 800, 98, 58, m.distant);
    pixelCircle(c, 785, 80, 21, m.ground);
    if (m.theme === 'saturn') {
      c.strokeStyle = m.accent;
      c.lineWidth = 9;
      c.beginPath();
      c.ellipse(800, 98, 104, 23, -0.33, 0, Math.PI * 2);
      c.stroke();
    }
    if (m.theme === 'lava')
      for (let i = 0; i < 4; i++) rect(c, 760 + i * 15, 75 + (i % 2) * 25, 5, 22, '#ffc377');
    if (m.theme === 'ice') star(c, 790, 88, 23, '#a3e9f1');
  }
  [255, 480, 705].forEach((x, i) => {
    if (i !== 1 || u < 0.55) asteroid(c, x + (i - 1) * u * 35, 105 - u * 7, 37, m);
    else
      for (let j = 0; j < 9; j++) {
        const angle = (j / 9) * Math.PI * 2;
        rect(c, x + Math.cos(angle) * (u - 0.5) * 160, 105 + Math.sin(angle) * (u - 0.5) * 110, 8, 8, m.top);
      }
  });
  const shipY = 257 - Math.sin(Math.PI * u) * 24;
  if (u > 0 && u < 0.58) rect(c, 477, shipY - 28 - u * 250, 6, 24, '#ffe57a');
  c.save();
  c.translate(wrong, 0);
  poly(
    c,
    [
      [428, shipY + 20],
      [438, shipY - 10],
      [523, shipY - 10],
      [535, shipY + 20],
    ],
    navy,
  );
  poly(
    c,
    [
      [434, shipY + 17],
      [442, shipY - 5],
      [518, shipY - 5],
      [529, shipY + 17],
    ],
    '#d6f4f7',
  );
  rect(c, 414, shipY + 5, 25, 19, '#45c8ee');
  rect(c, 522, shipY + 5, 25, 19, '#45c8ee');
  rect(c, 460, shipY + 8, 40, 12, '#36b7df');
  drawSprite(c, character, 452, shipY - 56, 56);
  rect(c, 466, shipY + 25, 27, 9, '#ffd36b');
  rect(c, 474, shipY + 34, 12, 12 + u * 16, '#ffab62');
  c.restore();
}
function kart(c: C, x: number, y: number, size: number, color: string, character?: CharacterId) {
  const scale = size / 100;
  c.save();
  c.translate(x - size / 2, y);
  c.scale(scale, scale);
  rect(c, 0, 10, 16, 38, navy);
  rect(c, 84, 10, 16, 38, navy);
  rect(c, 12, 0, 76, 48, navy);
  rect(c, 16, 4, 68, 37, color);
  rect(c, 42, 4, 15, 37, '#fff2d9');
  rect(c, 19, 27, 14, 9, '#ffdd6c');
  rect(c, 66, 27, 14, 9, '#ffdd6c');
  if (character) drawSprite(c, character, 23, -51, 54);
  else {
    rect(c, 35, -18, 30, 22, color);
    rect(c, 41, -15, 18, 13, '#fff2d9');
  }
  c.restore();
}
function race(c: C, m: MapTheme, character: CharacterId, u: number, wrong: number) {
  landscape(c, m, 'race');
  rect(c, 0, 254, 960, 106, m.ground);
  poly(
    c,
    [
      [365, 100],
      [595, 100],
      [900, 360],
      [60, 360],
    ],
    '#586375',
  );
  poly(
    c,
    [
      [360, 100],
      [365, 100],
      [60, 360],
      [42, 360],
    ],
    '#f8f1e2',
  );
  poly(
    c,
    [
      [595, 100],
      [600, 100],
      [918, 360],
      [900, 360],
    ],
    '#f8f1e2',
  );
  for (let lane = 1; lane <= 2; lane++)
    for (let j = 0; j < 5; j++) {
      const y = 130 + ((j * 53 + u * 75) % 220),
        f = (y - 100) / 260,
        x = 365 + lane * 76.66 + (lane === 1 ? -1 : 1) * f * 87;
      poly(
        c,
        [
          [x, y],
          [x + 4 + f * 3, y],
          [x + 8 + f * 4, y + 13 + f * 12],
          [x - 2, y + 13 + f * 12],
        ],
        '#f8f1e2',
      );
    }
  rect(c, 350, 71, 12, 76, navy);
  rect(c, 598, 71, 12, 76, navy);
  rect(c, 347, 52, 266, 29, navy);
  for (let i = 0; i < 13; i++) rect(c, 351 + i * 20, 56, 20, 21, i % 2 ? m.accent : '#fff6e4');
  if (!u) rect(c, 363, 126, 235, 8, m.accent);
  kart(c, 355, 190 + Math.sin(Math.PI * u) * 35, 61, '#ed8c88');
  kart(c, 605, 190 + Math.sin(Math.PI * u) * 35, 61, '#f9ce5e');
  kart(c, 480 + wrong, 279 - Math.sin(Math.PI * u) * 25, 105, '#3bc3ee', character);
  rect(c, 826, 290, 8, 39, navy);
  rect(c, 810, 280, 55, 18, m.accent);
  rect(c, 811, 280, 12, 18, '#fff8ea');
}
// Một đường leo liên tục gồm bậc xuất phát và 10 bậc đích, dùng chung mọi map.
const LEDGES = [145, 425, 286, 632, 420, 650, 330, 600, 390, 670, 470].map((x, i) => [x, 289 - i * 78]);
function climb(c: C, m: MapTheme, character: CharacterId, u: number, wrong: number, completed: number) {
  landscape(c, m, 'climb');
  const step = Math.min(completed, 9);
  const offset = (step + u) * 78;
  poly(
    c,
    [
      [210, 360],
      [960, 360],
      [960, 0],
      [810, 0],
      [780, 73],
      [592, 98],
      [535, 172],
      [356, 206],
    ],
    m.ground,
  );
  for (let i = 0; i < 11; i++) rect(c, 470 + (i % 3) * 130, 22 + i * 35 + (offset % 35), 65, 5, m.distant);
  if (m.theme === 'tree')
    for (let i = 0; i < 7; i++) rect(c, 350 + i * 86, 110 + (i % 2) * 60, 4, 250, '#bf925c');
  if (m.theme === 'candy')
    for (let i = 0; i < 7; i++) {
      rect(c, 600 + i * 45, 80 + (i % 2) * 40, 4, 220, '#e2bf91');
    }
  for (let i = 0; i < LEDGES.length - 1; i++) {
    const [x, y] = LEDGES[i],
      [nx, ny] = LEDGES[i + 1];
    c.strokeStyle = navy;
    c.lineWidth = 11;
    c.beginPath();
    c.moveTo(x + 118, y + offset);
    c.quadraticCurveTo((x + nx + 120) / 2, y + offset + 36, nx + 9, ny + offset);
    c.stroke();
    c.strokeStyle = '#f7cc70';
    c.lineWidth = 7;
    c.stroke();
  }
  for (const [x, worldY] of LEDGES) {
    const y = worldY + offset;
    rect(c, x - 3, y - 4, 138, 28, navy);
    rect(c, x, y, 132, 20, m.ground);
    rect(c, x, y, 132, 8, m.top);
    for (let i = 0; i < 4; i++) rect(c, x + 12 + i * 31, y + 9, 12, 4, m.distant);
  }
  const [x, y] = LEDGES[step],
    [nx, ny] = LEDGES[step + 1];
  drawSprite(
    c,
    character,
    x + 25 + (nx - x) * u + wrong,
    y + offset - 69 + (ny - y) * u - Math.sin(u * Math.PI) * 18,
    69,
  );
  const [goalX, goalY] = LEDGES[10];
  star(c, goalX + 65, goalY + offset - 42, 24);
}
export function renderScene(
  c: C,
  options: {
    game: GameId;
    map: string;
    character: CharacterId;
    completed?: number;
    phase?: Phase;
    progress?: number;
    elapsed?: number;
  },
) {
  const { game, map, character, completed = 0, phase = 'answer', progress = 0, elapsed = 0 } = options;
  const m = mapById(game, map);
  if (!m) return;
  c.save();
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, 960, 360);
  const u = phase === 'correct' ? Math.max(0, Math.min(1, progress)) : 0;
  const wrong = phase === 'wrong' && elapsed < 350 ? Math.sin(elapsed / 24) * 4 : 0;
  if (game === 'runner') runner(c, m, character, u, wrong);
  if (game === 'space') space(c, m, character, u, wrong);
  if (game === 'race') race(c, m, character, u, wrong);
  if (game === 'climb') climb(c, m, character, u, wrong, completed);
  c.restore();
}
