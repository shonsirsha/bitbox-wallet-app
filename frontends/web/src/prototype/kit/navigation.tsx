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
  // tabbar: phone bottom bar · rail: icon column · sidebar: full side navigation · topbar: horizontal items
  layout: 'tabbar' | 'rail' | 'sidebar' | 'topbar';
  floating?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  // Extra sidebar content between items and footer (e.g. the account list).
  children?: ReactNode;
  label?: string;
};

export const Navigation = ({ items, layout, floating = false, header, footer, children, label = 'Main' }: TProps) => (
  <nav className={`${styles.nav} ${styles[layout]} ${floating ? styles.floating : ''}`} aria-label={label}>
    {header && <div className={styles.header}>{header}</div>}
    <ul className={styles.items}>
      {items.map(item => (
        <li key={item.key}>
          <a
            href={item.href}
            className={`${styles.item} ${item.active ? styles.active : ''}`}
            aria-current={item.active ? 'page' : undefined}
            title={layout === 'rail' ? item.label : undefined}>
            <Icon name={item.icon} size={layout === 'topbar' ? 18 : 22} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
    {children && <div className={styles.extra}>{children}</div>}
    {footer && <div className={styles.footer}>{footer}</div>}
  </nav>
);
