// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import styles from './section.module.css';

type TProps = {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  // 'surface' follows the direction (card or plain); 'plain' never draws a surface.
  variant?: 'surface' | 'plain';
  className?: string;
};

export const Section = ({ title, action, children, variant = 'surface', className = '' }: TProps) => (
  <section className={`${styles.section} ${className}`}>
    {(title || action) && (
      <header className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {action && <div className={styles.action}>{action}</div>}
      </header>
    )}
    <div className={variant === 'surface' ? styles.surface : ''}>{children}</div>
  </section>
);
