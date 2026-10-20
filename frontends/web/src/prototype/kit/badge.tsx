// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon, TIconName } from './icon';
import styles from './badge.module.css';

type TProps = {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  icon?: TIconName;
};

export const Badge = ({ children, tone = 'neutral', icon }: TProps) => (
  <span className={`${styles.badge} ${styles[tone]}`}>
    {icon && <Icon name={icon} size={13} strokeWidth={2} />}
    {children}
  </span>
);
