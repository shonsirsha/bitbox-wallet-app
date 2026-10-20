// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon, TIconName } from './icon';
import styles from './badge.module.css';

type TProps = {
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  icon?: TIconName;
  dot?: boolean;
};

export const Badge = ({ children, tone = 'neutral', icon, dot = false }: TProps) => (
  <span className={`${styles.badge} ${styles[tone]}`}>
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {icon && <Icon name={icon} size={13} strokeWidth={2} />}
    {children}
  </span>
);
