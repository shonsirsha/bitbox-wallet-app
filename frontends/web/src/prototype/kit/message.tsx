// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon } from './icon';
import styles from './message.module.css';

type TProps = {
  title?: ReactNode;
  children?: ReactNode;
};

export const Message = ({ title, children }: TProps) => (
  <div className={styles.message} role="status">
    <Icon name="info" size={20} className={styles.icon} />
    <div className={styles.content}>
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.text}>{children}</div>}
    </div>
  </div>
);
