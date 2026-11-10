import type { CharacterId } from './types';
type Rect = [number, number, number, number, string];
const eye = '#112c49',
  cream = '#fff1d5';
const eyes = (y = 7, a = 5, b = 10): Rect[] => [
  [a, y, 1, 1, eye],
  [b, y, 1, 1, eye],
];
const art: Record<CharacterId, Rect[]> = {
  mascot: [
    [3, 3, 10, 4, '#e98760'],
    [1, 6, 14, 4, '#e98760'],
    [3, 9, 10, 3, '#e98760'],
    ...[3, 6, 9, 12].map((x) => [x, 11, 1, 3, '#e98760'] as Rect),
    ...eyes(5, 5, 10),
  ],
  byte: [
    [7, 1, 1, 3, '#35bdf1'],
    [6, 0, 3, 2, '#ffe24b'],
    [3, 4, 10, 7, '#35bdf1'],
    [1, 7, 14, 3, '#35bdf1'],
    [4, 5, 8, 4, '#d9f6fc'],
    [4, 11, 8, 2, '#35bdf1'],
    [4, 13, 2, 3, '#35bdf1'],
    [10, 13, 2, 3, '#35bdf1'],
    ...eyes(6, 5, 10),
  ],
  cat: [
    [3, 3, 3, 5, '#bb8de5'],
    [9, 3, 3, 5, '#bb8de5'],
    [4, 4, 1, 2, '#eeb3dc'],
    [10, 4, 1, 2, '#eeb3dc'],
    [3, 7, 9, 6, '#bb8de5'],
    [12, 10, 3, 2, '#bb8de5'],
    [14, 7, 1, 4, '#bb8de5'],
    ...[3, 6, 9].map((x) => [x, 12, 1, 3, '#bb8de5'] as Rect),
    ...eyes(9, 5, 9),
  ],
  rabbit: [
    [4, 0, 3, 8, cream],
    [9, 0, 3, 8, cream],
    [5, 1, 1, 4, '#ff9dc7'],
    [10, 1, 1, 4, '#ff9dc7'],
    [3, 7, 10, 7, cream],
    [2, 10, 12, 2, cream],
    [4, 14, 2, 2, cream],
    [10, 14, 2, 2, cream],
    [4, 11, 1, 1, '#ff9dc7'],
    [11, 11, 1, 1, '#ff9dc7'],
    ...eyes(9),
  ],
  bear: [
    [2, 2, 4, 4, '#ca944d'],
    [10, 2, 4, 4, '#ca944d'],
    [3, 3, 2, 2, cream],
    [11, 3, 2, 2, cream],
    [3, 5, 10, 9, '#ca944d'],
    [1, 9, 14, 3, '#ca944d'],
    [5, 10, 6, 4, cream],
    [3, 14, 3, 2, '#ca944d'],
    [10, 14, 3, 2, '#ca944d'],
    ...eyes(7),
  ],
  fox: [
    [2, 2, 3, 5, '#ffb13e'],
    [8, 2, 3, 5, '#ffb13e'],
    [3, 3, 1, 2, cream],
    [9, 3, 1, 2, cream],
    [2, 6, 9, 7, '#ffb13e'],
    [2, 10, 9, 2, cream],
    [4, 11, 5, 2, cream],
    [11, 10, 4, 4, '#ffb13e'],
    [13, 7, 3, 5, '#ffb13e'],
    [13, 6, 3, 3, cream],
    [3, 13, 2, 3, '#ffb13e'],
    [8, 13, 2, 3, '#ffb13e'],
    ...eyes(8, 4, 9),
  ],
  frog: [
    [3, 3, 4, 5, '#7edb96'],
    [9, 3, 4, 5, '#7edb96'],
    [2, 7, 12, 6, '#7edb96'],
    [5, 10, 6, 4, '#c3eea5'],
    [0, 12, 4, 3, '#7edb96'],
    [12, 12, 4, 3, '#7edb96'],
    [4, 4, 2, 2, eye],
    [10, 4, 2, 2, eye],
  ],
  penguin: [
    [5, 1, 6, 2, '#414b95'],
    [3, 3, 10, 11, '#414b95'],
    [1, 8, 14, 4, '#414b95'],
    [5, 5, 6, 9, '#f1f2ff'],
    [3, 14, 3, 2, '#ffe05a'],
    [10, 14, 3, 2, '#ffe05a'],
    ...eyes(7, 6, 9),
  ],
  sprout: [
    [2, 1, 5, 3, '#8bdc47'],
    [9, 1, 5, 3, '#8bdc47'],
    [5, 3, 6, 2, '#8bdc47'],
    [7, 4, 2, 3, '#58ae4c'],
    [2, 7, 12, 2, '#ee8d5e'],
    [3, 9, 10, 5, '#df7c51'],
    [1, 11, 14, 1, '#df7c51'],
    [4, 14, 2, 2, '#df7c51'],
    [10, 14, 2, 2, '#df7c51'],
    ...eyes(10),
  ],
  star: [
    [7, 1, 2, 3, '#ffe443'],
    [5, 4, 6, 3, '#ffe443'],
    [1, 7, 14, 2, '#ffe443'],
    [3, 9, 10, 2, '#ffe443'],
    [4, 11, 3, 3, '#ffe443'],
    [9, 11, 3, 3, '#ffe443'],
    [3, 14, 3, 1, '#ffe443'],
    [10, 14, 3, 1, '#ffe443'],
    ...eyes(8, 5, 10),
  ],
};
export interface Pixel {
  x: number;
  y: number;
  color: string;
}
const cache = new Map<CharacterId, Pixel[]>();
export function spritePixels(id: CharacterId): Pixel[] {
  if (cache.has(id)) return cache.get(id)!;
  const grid = new Map<string, Pixel>();
  for (const [x, y, w, h, color] of art[id])
    for (let dx = 0; dx < w; dx++)
      for (let dy = 0; dy < h; dy++) grid.set(`${x + dx},${y + dy}`, { x: x + dx, y: y + dy, color });
  const outline = new Map<string, Pixel>();
  for (const p of grid.values())
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const x = p.x + dx,
        y = p.y + dy,
        key = `${x},${y}`;
      if (!grid.has(key)) outline.set(key, { x, y, color: eye });
    }
  const pixels = [...outline.values(), ...grid.values()];
  cache.set(id, pixels);
  return pixels;
}
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  id: CharacterId,
  x: number,
  y: number,
  size: number,
  flip = false,
) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  const unit = size / 18;
  for (const pixel of spritePixels(id)) {
    ctx.fillStyle = pixel.color;
    ctx.fillRect(
      Math.round((pixel.x + 1) * unit),
      Math.round((pixel.y + 1) * unit),
      Math.ceil(unit),
      Math.ceil(unit),
    );
  }
  ctx.restore();
}
