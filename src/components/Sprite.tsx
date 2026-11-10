import type { CharacterId } from '../types';
import { spritePixels } from '../sprites';
export function Sprite({
  id,
  size = 100,
  className = '',
}: {
  id: CharacterId;
  size?: number;
  className?: string;
}) {
  const paths = new Map<string, string>();
  for (const { x, y, color } of spritePixels(id))
    paths.set(color, (paths.get(color) || '') + `M${x} ${y}h1v1h-1z`);
  return (
    <svg
      className={`sprite ${className}`}
      width={size}
      height={size}
      viewBox="-1 -1 18 18"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {[...paths].map(([color, d]) => (
        <path key={color} fill={color} d={d} />
      ))}
    </svg>
  );
}
