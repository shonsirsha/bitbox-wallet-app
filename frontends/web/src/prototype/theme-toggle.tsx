// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): floating light/dark switch for the preview (not part of the design).

import { useRef } from 'react';
import { useIndicator } from './kit/indicator';
import styles from './theme-toggle.module.css';

type TTheme = 'light' | 'dark';

type TProps = {
  theme: TTheme;
  onChange: (theme: TTheme) => void;
};

const OPTIONS: { value: TTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const ThemeToggle = ({ theme, onChange }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { rect, ready } = useIndicator(ref, '[aria-checked="true"]', [theme]);
  return (
    <div ref={ref} className={styles.toggle} role="radiogroup" aria-label="Theme">
      {rect && (
        <span
          className={`${styles.thumb} ${ready ? styles.thumbReady : ''}`}
          style={{ transform: `translateX(${rect.x}px)`, width: rect.width }}
          aria-hidden="true" />
      )}
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          className={styles.option}
          onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
};
