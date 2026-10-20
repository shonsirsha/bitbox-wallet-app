// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon, TIconName } from './icon';
import styles from './navigation.module.css';

export type TNavItem = {
  key: string;
  label: string;
  icon: TIconName;
  href: string;
  active?: boolean;
};

type TProps = {
  items: TNavItem[];
  // sidebar: side navigation (tablet and desktop) · tabbar: floating bottom bar (phones)
  layout: 'sidebar' | 'tabbar';
  header?: ReactNode;
  // Extra sidebar content under the items (the account list).
  children?: ReactNode;
  label?: string;
};

export const Navigation = ({ items, layout, header, children, label = 'Main' }: TProps) => (
  <nav className={`${styles.nav} ${styles[layout]}`} aria-label={label}>
    {header && <div className={styles.header}>{header}</div>}
    <ul className={styles.items}>
      {items.map(item => (
        <li key={item.key}>
          <a href={item.href} className={`${styles.item} ${item.active ? styles.active : ''}`} aria-current={item.active ? 'page' : undefined}>
            <Icon name={item.icon} size={22} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
    {children && <div className={styles.extra}>{children}</div>}
  </nav>
);
