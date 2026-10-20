// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): floating variant switcher. ← / → cycle variants (not while typing).
// Deliberately styled unlike any direction so it never reads as part of a design.

import { useEffect, useState } from 'react';
import type { TThemeSetting, TVariantKey } from './context';
import styles from './prototype-bar.module.css';

export type TVariant = { key: TVariantKey; name: string };

type TProps = {
  variants: TVariant[];
  current: TVariantKey;
  onChange: (key: TVariantKey) => void;
  theme: TThemeSetting;
  onThemeChange: (theme: TThemeSetting) => void;
};

const isTyping = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return !!element && (
    element.tagName === 'INPUT'
    || element.tagName === 'TEXTAREA'
    || element.tagName === 'SELECT'
    || element.isContentEditable
  );
};

const THEMES: TThemeSetting[] = ['auto', 'light', 'dark'];
const THEME_LABEL: Record<TThemeSetting, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };

export const PrototypeBar = ({ variants, current, onChange, theme, onThemeChange }: TProps) => {
  // Direction of the last switch, so the label slides in from the matching side.
  const [direction, setDirection] = useState<1 | -1>(1);
  // On phones the bar starts collapsed to a corner button so it never sits on the design.
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const index = Math.max(0, variants.findIndex(variant => variant.key === current));
  const step = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length];
    if (next) {
      setDirection(delta > 0 ? 1 : -1);
      onChange(next.key);
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        step(-1);
      } else if (event.key === 'ArrowRight') {
        step(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const variant = variants[index];
  if (collapsed) {
    return (
      <button type="button" className={`${styles.bar} ${styles.collapsed}`} onClick={() => setCollapsed(false)} title="Show prototype switcher">
        {variant?.key}
      </button>
    );
  }
  return (
    <div className={styles.bar} role="toolbar" aria-label="Prototype variant switcher">
      <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="Previous variant">‹</button>
      <span className={styles.label}>
        <span key={variant?.key} className={`${styles.labelInner} ${direction > 0 ? styles.fromEnd : styles.fromStart}`}>
          <span className={styles.key}>{variant?.key}</span>
          <span className={styles.name}>{variant?.name}</span>
        </span>
      </span>
      <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label="Next variant">›</button>
      <span className={styles.divider} />
      <button
        type="button"
        className={styles.text}
        onClick={() => onThemeChange(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length] as TThemeSetting)}
        title="Theme">
        {THEME_LABEL[theme]}
      </button>
      <button type="button" className={styles.text} onClick={() => setCollapsed(true)} aria-label="Hide switcher">✕</button>
    </div>
  );
};
