// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): BitBox device presence and the "confirm on device" moment.

import type { ReactNode } from 'react';
import deviceLight from '@/components/icon/assets/bitbox02-stylized-reflection-light.png';
import deviceDark from '@/components/icon/assets/bitbox02-stylized-reflection-dark.png';
import { usePrototype } from '../context';
import { Badge } from './badge';
import { Icon } from './icon';
import styles from './device.module.css';

export type TDeviceState = 'connected' | 'disconnected' | 'confirm';

const STATE_LABEL: Record<TDeviceState, string> = {
  connected: 'Connected',
  disconnected: 'Not connected',
  confirm: 'Confirm on device',
};

type TStatusProps = {
  name: string;
  state: TDeviceState;
  detail?: ReactNode;
  // card: image + details · row: compact line · chip: tiny pill for headers
  variant?: 'card' | 'row' | 'chip';
  action?: ReactNode;
  // The device panel may sit on a dark surface even in light theme (Vault sidebar).
  onDark?: boolean;
};

export const DeviceStatus = ({ name, state, detail, variant = 'row', action, onDark = false }: TStatusProps) => {
  const { theme } = usePrototype();
  const tone = state === 'connected' ? 'success' : state === 'confirm' ? 'info' : 'neutral';
  if (variant === 'chip') {
    return (
      <span className={`${styles.chip} ${styles[state]}`}>
        <span className={styles.chipDot} aria-hidden="true" />
        <Icon name="device" size={16} />
        <span className={styles.chipName}>{name}</span>
      </span>
    );
  }
  if (variant === 'card') {
    return (
      <div className={`${styles.card} ${onDark ? styles.onDark : ''}`}>
        <img className={styles.image} src={theme === 'dark' || onDark ? deviceDark : deviceLight} alt="" />
        <div className={styles.cardBody}>
          <div className={styles.cardTitle}>
            <span className={styles.name}>{name}</span>
            <Badge tone={tone} dot>{STATE_LABEL[state]}</Badge>
          </div>
          {detail && <div className={styles.detail}>{detail}</div>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.row} ${styles[state]} ${onDark ? styles.onDark : ''}`}>
      <span className={styles.rowIcon}><Icon name="device" size={20} /><span className={styles.rowDot} aria-hidden="true" /></span>
      <span className={styles.rowText}>
        <span className={styles.name}>{name}</span>
        <span className={styles.detail}>{STATE_LABEL[state]}{detail && <span className={styles.detailPart}>{detail}</span>}</span>
      </span>
    </div>
  );
};

type TConfirmProps = {
  title: string;
  children?: ReactNode;
  // Values the user must compare on the device screen (address, amount, fee...).
  values?: { label: string; value: ReactNode; mono?: boolean }[];
};

export const DeviceConfirm = ({ title, children, values = [] }: TConfirmProps) => {
  const { theme } = usePrototype();
  return (
    <div className={styles.confirm}>
      <div className={styles.confirmVisual}>
        <img className={styles.confirmImage} src={theme === 'dark' ? deviceDark : deviceLight} alt="" />
        <span className={styles.pulse} aria-hidden="true" />
      </div>
      <h2 className={styles.confirmTitle}>{title}</h2>
      {children && <div className={styles.confirmText}>{children}</div>}
      {values.length > 0 && (
        <dl className={styles.values}>
          {values.map(item => (
            <div key={item.label} className={styles.valueRow}>
              <dt>{item.label}</dt>
              <dd className={item.mono ? styles.mono : ''}>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
