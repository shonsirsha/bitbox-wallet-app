// SPDX-License-Identifier: Apache-2.0

import { ReactNode, useRef } from 'react';
import { Icon, TIconName } from './icon';
import { useIndicator } from './indicator';
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

export const Navigation = ({ items, layout, header, children, label = 'Main' }: TProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const activeKey = items.find(item => item.active)?.key;
  // The active highlight slides from item to item instead of jumping.
  const { rect, ready } = useIndicator(listRef, '[aria-current="page"]', [activeKey, items.length]);
  // Without an active item the highlight fades out where it was, instead of jumping away.
  const lastRect = useRef(rect);
  if (rect) {
    lastRect.current = rect;
  }
  const shown = rect || lastRect.current;
  return (
    <nav className={`${styles.nav} ${styles[layout]}`} aria-label={label}>
      {header && <div className={styles.header}>{header}</div>}
      <ul ref={listRef} className={styles.items}>
        <li
          className={`${styles.indicator} ${ready ? styles.indicatorReady : ''} ${rect ? '' : styles.indicatorHidden}`}
          style={shown ? { transform: `translate(${shown.x}px, ${shown.y}px)`, width: shown.width, height: shown.height } : undefined}
          aria-hidden="true" />
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
};
