// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): a calm SVG area chart, no transaction markers or grid noise.
// Scrubbing reports the hovered point so the screen can show it in the balance header.

import { PointerEvent, useId, useMemo, useState } from 'react';
import styles from './area-chart.module.css';

export type TChartPoint = { time: number; value: number; label?: string };

type TProps = {
  points: TChartPoint[];
  height?: number;
  onScrub?: (point: TChartPoint | null) => void;
};

const WIDTH = 1000;
const MAX_POINTS = 360;

const downsample = (points: TChartPoint[]) => {
  if (points.length <= MAX_POINTS) {
    return points;
  }
  const step = points.length / MAX_POINTS;
  const sampled: TChartPoint[] = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    sampled.push(points[Math.floor(i * step)] as TChartPoint);
  }
  sampled.push(points[points.length - 1] as TChartPoint);
  return sampled;
};

export const AreaChart = ({ points, height = 180, onScrub }: TProps) => {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => downsample(points), [points]);
  const { line, area, coords } = useMemo(() => {
    if (data.length < 2) {
      return { line: '', area: '', coords: [] as { x: number; y: number }[] };
    }
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const top = 8;
    const bottom = height - 4;
    const xy = data.map((point, i) => ({
      x: (i / (data.length - 1)) * WIDTH,
      y: bottom - ((point.value - min) / span) * (bottom - top),
    }));
    const path = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
    return { line: path, area: `${path}L${WIDTH},${height}L0,${height}Z`, coords: xy };
  }, [data, height]);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (data.length - 1));
    setHover(index);
    onScrub?.(data[index] ?? null);
  };

  const handleLeave = () => {
    setHover(null);
    onScrub?.(null);
  };

  const hovered = hover !== null ? coords[hover] : undefined;

  return (
    <div className={styles.chart}>
      <div
        className={styles.plot}
        style={{ height }}
        onPointerMove={handleMove}
        onPointerDown={handleMove}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        role="img"
        aria-label="Portfolio value over time">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--k-chart-line)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--k-chart-line)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="var(--k-chart-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        {hovered && (
          <>
            <span className={styles.cursor} style={{ left: `${(hovered.x / WIDTH) * 100}%` }} />
            <span className={styles.dot} style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: hovered.y }} />
          </>
        )}
      </div>
    </div>
  );
};
