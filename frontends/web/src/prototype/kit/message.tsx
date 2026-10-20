// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { IconButton } from './button';
import { Icon, TIconName } from './icon';
import styles from './message.module.css';

type TTone = 'info' | 'success' | 'warning' | 'danger';

const ICONS: Record<TTone, TIconName> = { info: 'info', success: 'check', warning: 'warning', danger: 'failed' };

type TProps = {
  tone?: TTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
};

export const Message = ({ tone = 'info', title, children, action, onDismiss }: TProps) => (
  <div className={`${styles.message} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
    <Icon name={ICONS[tone]} size={20} className={styles.icon} />
    <div className={styles.content}>
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.text}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
    {onDismiss && <IconButton icon="close" label="Dismiss" size="sm" onClick={onDismiss} />}
  </div>
);
