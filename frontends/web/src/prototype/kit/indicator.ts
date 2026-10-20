// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): measures the active child of a container so a highlight can slide to it
// (segmented control thumb, navigation highlights). Re-measures when the container resizes.

import { DependencyList, RefObject, useLayoutEffect, useState } from 'react';

export type TIndicatorRect = { x: number; y: number; width: number; height: number };

export const useIndicator = (
  container: RefObject<HTMLElement>,
  activeSelector: string,
  deps: DependencyList,
) => {
  const [rect, setRect] = useState<TIndicatorRect | null>(null);
  // The first placement must not slide in from the corner, so transitions start afterwards.
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) {
      return;
    }
    // Relative to the container's padding box, where the absolutely positioned highlight lives.
    const measure = () => {
      const active = element.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        setRect(null);
        return;
      }
      const base = element.getBoundingClientRect();
      const box = active.getBoundingClientRect();
      setRect({
        x: box.left - base.left - element.clientLeft + element.scrollLeft,
        y: box.top - base.top - element.clientTop + element.scrollTop,
        width: box.width,
        height: box.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (rect && !ready) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [rect, ready]);
  return { rect, ready };
};
