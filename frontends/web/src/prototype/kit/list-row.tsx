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
  onClick?: () => void;
  chevron?: boolean;
  selected?: boolean;
  className?: string;
};

export const ListRow = ({
  leading, title, subtitle, trailing, trailingSub, href, onClick, chevron = false, selected = false, className = '',
}: TProps) => {
  const interactive = !!(href || onClick);
  const classes = `${styles.row} ${interactive ? styles.interactive : ''} ${selected ? styles.selected : ''} ${className}`;
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
  if (onClick) {
    return <button type="button" className={classes} onClick={onClick}>{content}</button>;
  }
  return <div className={classes}>{content}</div>;
};

// Groups rows with the direction's divider style.
export const List = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`${styles.list} ${className}`} role="list">{children}</div>
);
