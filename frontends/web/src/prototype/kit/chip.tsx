// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon } from './icon';
import styles from './chip.module.css';

type TProps = {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  // Small visual before the label, e.g. a coin icon.
  leading?: ReactNode;
  // Optional count after the label (e.g. number of accounts).
  count?: number;
};

// A selectable filter pill.
export const Chip = ({ children, selected, onClick, leading, count }: TProps) => (
  <button
    type="button"
    className={`${styles.chip} ${selected ? styles.selected : ''}`}
    aria-pressed={selected}
    onClick={onClick}>
    {selected ? <Icon name="check" size={16} strokeWidth={2} className={styles.check} /> : leading}
    <span className={styles.label}>{children}</span>
    {count !== undefined && <span className={styles.count}>{count}</span>}
  </button>
);
