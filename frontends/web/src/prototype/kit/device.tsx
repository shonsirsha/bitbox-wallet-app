// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): BitBox device presence as one compact row.

import { Icon } from './icon';
import styles from './device.module.css';

export type TDeviceState = 'connected' | 'disconnected';

const STATE_LABEL: Record<TDeviceState, string> = {
  connected: 'Connected',
  disconnected: 'Not connected',
};

type TStatusProps = {
  name: string;
  state: TDeviceState;
  // Short extra detail after the state, e.g. the firmware version.
  detail?: string;
  // The row may sit on a dark panel even in light theme (the sidebar).
  onDark?: boolean;
};

export const DeviceStatus = ({ name, state, detail, onDark = false }: TStatusProps) => (
  <div className={`${styles.row} ${styles[state]} ${onDark ? styles.onDark : ''}`}>
    <span className={styles.rowIcon}><Icon name="device" size={20} /><span className={styles.rowDot} aria-hidden="true" /></span>
    <span className={styles.rowText}>
      <span className={styles.name}>{name}</span>
      <span className={styles.detail}>{STATE_LABEL[state]}{detail && <span className={styles.detailPart}>{detail}</span>}</span>
    </span>
  </div>
);
