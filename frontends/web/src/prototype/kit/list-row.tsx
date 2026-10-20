// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon } from './icon';
import styles from './list-row.module.css';

type TProps = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  trailingSub?: ReactNode;
  href?: string;
  chevron?: boolean;
  selected?: boolean;
};

export const ListRow = ({
  leading, title, subtitle, trailing, trailingSub, href, chevron = false, selected = false,
}: TProps) => {
  const classes = `${styles.row} ${href ? styles.interactive : ''} ${selected ? styles.selected : ''}`;
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.main}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {(trailing || trailingSub) && (
        <span className={styles.trailing}>
          {trailing && <span className={styles.trailingMain}>{trailing}</span>}
          {trailingSub && <span className={styles.trailingSub}>{trailingSub}</span>}
        </span>
      )}
      {chevron && <Icon name="chevron" size={18} className={styles.chevron} />}
    </>
  );
  if (href) {
    return <a className={classes} href={href} aria-current={selected ? 'page' : undefined}>{content}</a>;
  }
  return <div className={classes}>{content}</div>;
};

// Groups rows with the direction's divider style.
export const List = ({ children }: { children: ReactNode }) => (
  <div className={styles.list} role="list">{children}</div>
);
