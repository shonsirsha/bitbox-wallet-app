// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { IconButton } from './button';
import styles from './page-header.module.css';

type TProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  // Hash href of the parent screen; shows a back button.
  back?: string;
  actions?: ReactNode;
  // 'large' for top-level screens, 'compact' for pushed screens (centered small title on phones).
  size?: 'large' | 'compact';
  leading?: ReactNode;
};

export const PageHeader = ({ title, subtitle, back, actions, size = 'large', leading }: TProps) => (
  <header className={`${styles.header} ${styles[size]}`}>
    <div className={styles.start}>
      {back && <IconButton icon="back" label="Back" href={back} className={styles.back} />}
      {leading}
    </div>
    <div className={styles.titles}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    <div className={styles.actions}>{actions}</div>
  </header>
);
