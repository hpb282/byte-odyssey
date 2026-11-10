import { useEffect, useRef } from 'react';
import { gameById, mapById } from '../catalog';
import { renderScene, SCENE_HEIGHT, SCENE_WIDTH } from '../scene';
import type { CharacterId, GameId, Phase } from '../types';
export function Scene({
  game,
  map,
  character = 'byte',
  completed = 0,
  phase = 'answer',
  reducedMotion = false,
  thumbnail = false,
  paused = false,
}: {
  game: GameId;
  map: string;
  character?: CharacterId;
  completed?: number;
  phase?: Phase;
  reducedMotion?: boolean;
  thumbnail?: boolean;
  paused?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const elapsed = now - start,
        progress = reducedMotion ? 1 : Math.min(elapsed / 1100, 1);
      renderScene(ctx, { game, map, character, completed, phase, progress, elapsed });
      if (
        !thumbnail &&
        !paused &&
        !reducedMotion &&
        ((phase === 'correct' && elapsed < 1100) || (phase === 'wrong' && elapsed < 360))
      )
        frame = requestAnimationFrame(draw);
    };
    draw(start);
    return () => cancelAnimationFrame(frame);
  }, [game, map, character, completed, phase, reducedMotion, thumbnail, paused]);
  return (
    <canvas
      ref={ref}
      className={`scene ${thumbnail ? 'scene-thumb' : ''}`}
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      role={thumbnail ? undefined : 'img'}
      aria-hidden={thumbnail || undefined}
      aria-label={thumbnail ? undefined : `${gameById(game).name} — ${mapById(game, map).name}`}
    />
  );
}
