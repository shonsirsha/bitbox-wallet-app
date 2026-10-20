// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon } from './icon';
import styles from './chip.module.css';

type TProps = {
  children: ReactNode;
  // A filter toggle: pressed while selected, the check replacing the leading visual.
  selected?: boolean;
  onClick: () => void;
  // Small visual before the label (20px), e.g. a coin icon.
  leading: ReactNode;
  // Optional count after the label (e.g. number of accounts).
  count?: number;
  // An applied filter: tapping removes it (trailing ✕; the leading visual stays).
  removable?: boolean;
};

// A filter pill: a toggle in the filter panel, or an applied filter that can be removed.
export const Chip = ({ children, selected = false, onClick, leading, count, removable = false }: TProps) => (
  <button
    type="button"
    className={`${styles.chip} ${selected || removable ? styles.selected : ''} ${removable ? styles.removable : ''}`}
    aria-pressed={removable ? undefined : selected}
    aria-label={removable && typeof children === 'string' ? `Remove filter: ${children}` : undefined}
    onClick={onClick}>
    <span className={styles.slot}>{selected && !removable ? <Icon name="check" size={16} strokeWidth={2.25} /> : leading}</span>
    <span className={styles.label}>{children}</span>
    {count !== undefined && <span className={styles.count}>{count}</span>}
    {removable && <Icon name="close" size={14} strokeWidth={2.25} className={styles.remove} />}
  </button>
);
