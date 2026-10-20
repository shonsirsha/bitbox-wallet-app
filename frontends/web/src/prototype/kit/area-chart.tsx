// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): a calm SVG area chart, no transaction markers or grid noise.
// Drawn in real pixels (measured width), so the line can draw itself from start to finish
// whenever the data changes. Scrubbing reports the hovered point to the screen.

import { PointerEvent, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './area-chart.module.css';

export type TChartPoint = { time: number; value: number; label?: string };

type TProps = {
  points: TChartPoint[];
  height?: number;
  onScrub?: (point: TChartPoint | null) => void;
};

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
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => downsample(points), [points]);

  useLayoutEffect(() => {
    const element = plotRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width || 0)));
    observer.observe(element);
    setWidth(Math.round(element.getBoundingClientRect().width));
    return () => observer.disconnect();
  }, []);

  const { line, area, coords } = useMemo(() => {
    if (data.length < 2 || !width) {
      return { line: '', area: '', coords: [] as { x: number; y: number }[] };
    }
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const top = 8;
    const bottom = height - 4;
    const xy = data.map((point, i) => ({
      x: (i / (data.length - 1)) * width,
      y: bottom - ((point.value - min) / span) * (bottom - top),
    }));
    const path = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
    return { line: path, area: `${path}L${width},${height}L0,${height}Z`, coords: xy };
  }, [data, height, width]);

  // A new data set (range switch) remounts the paths, which replays the draw-in.
  const drawKey = `${data.length}:${data[0]?.time}:${data[data.length - 1]?.time}`;

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
        ref={plotRef}
        className={styles.plot}
        style={{ height }}
        onPointerMove={handleMove}
        onPointerDown={handleMove}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        role="img"
        aria-label="Portfolio value over time">
        {width > 0 && (
          <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--k-chart-line)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--k-chart-line)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path key={`area-${drawKey}`} className={styles.area} d={area} fill={`url(#${gradientId})`} />
            <path
              key={`line-${drawKey}`}
              className={styles.line}
              d={line}
              pathLength={1}
              fill="none"
              stroke="var(--k-chart-line)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round" />
          </svg>
        )}
        {hovered && (
          <>
            <span className={styles.cursor} style={{ left: hovered.x }} />
            <span className={styles.dot} style={{ left: hovered.x, top: hovered.y }} />
          </>
        )}
      </div>
    </div>
  );
};
