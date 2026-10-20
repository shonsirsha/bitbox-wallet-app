// SPDX-License-Identifier: Apache-2.0

import btc from '@/components/icon/assets/btc-color.svg';
import eth from '@/components/icon/assets/eth-color.svg';
import ltc from '@/components/icon/assets/ltc-color.svg';
import usdc from '@/components/icon/assets/usdc-color.svg';
import lightning from '@/components/icon/assets/lightning-color.svg';
import { Icon, TIconName } from './icon';
import styles from './coin-icon.module.css';

const LOGOS: Record<string, string> = {
  btc, tbtc: btc, ltc, tltc: ltc, eth, sepeth: eth, 'eth-erc20-usdc': usdc, lightning,
};

export type TCoinBadge = 'receive' | 'send' | 'self' | 'pending' | 'failed';

const BADGE_ICONS: Record<TCoinBadge, TIconName> = {
  receive: 'arrowDown', send: 'arrowUp', self: 'self', pending: 'clock', failed: 'failed',
};

type TProps = {
  coinCode: string;
  size?: number;
  badge?: TCoinBadge;
};

export const CoinIcon = ({ coinCode, size = 36, badge }: TProps) => (
  <span className={styles.wrap} style={{ width: size, height: size }}>
    {LOGOS[coinCode]
      ? <img src={LOGOS[coinCode]} alt="" width={size} height={size} className={coinCode === 'lightning' ? styles.lightning : styles.logo} />
      : <span className={styles.fallback}>{coinCode.slice(0, 1).toUpperCase()}</span>}
    {badge && (
      <span className={`${styles.badge} ${styles[badge]}`}>
        <Icon name={BADGE_ICONS[badge]} size={Math.round(size * .34)} strokeWidth={2.25} />
      </span>
    )}
  </span>
);

// Neutral round icon for non-coin rows (e.g. "All accounts").
export const GlyphIcon = ({ icon, size = 36 }: { icon: TIconName; size?: number }) => (
  <span className={styles.glyph} style={{ width: size, height: size }}>
    <Icon name={icon} size={Math.round(size * .5)} />
  </span>
);
