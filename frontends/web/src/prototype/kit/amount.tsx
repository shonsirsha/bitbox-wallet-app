// SPDX-License-Identifier: Apache-2.0

import type { TAmountWithConversions } from '@/api/account';
import { usePrototype } from '../context';
import { fiatOf, formatCoinAmount, formatFiatAmount } from './format';
import styles from './amount.module.css';

type TProps = {
  value?: TAmountWithConversions;
  // 'fiat' shows the main fiat conversion, 'coin' the coin amount.
  as?: 'fiat' | 'coin';
  size?: 'hero' | 'xl' | 'lg' | 'md' | 'sm';
  tone?: 'default' | 'muted';
  sign?: '+' | '−' | '';
  className?: string;
};

export const Amount = ({ value, as = 'fiat', size = 'md', tone = 'default', sign = '', className = '' }: TProps) => {
  const { fiat, locale, hideAmounts } = usePrototype();
  const classes = `${styles.amount} ${styles[size]} ${styles[tone]} ${className} k-num`;
  if (!value) {
    return <span className={`${classes} ${styles.loading}`} dir="ltr" aria-busy="true">&nbsp;</span>;
  }
  const formatted = as === 'fiat'
    ? formatFiatAmount(fiatOf(value, fiat) || '0.00', fiat, locale)
    : formatCoinAmount(value, locale);
  if (hideAmounts) {
    return (
      <span className={classes} dir="ltr" aria-label="Hidden amount">
        {formatted.prefix}<span className={styles.mask}>••••</span>{formatted.unit && <span className={styles.unit}> {formatted.unit}</span>}
      </span>
    );
  }
  // Numbers always read left-to-right, also inside right-to-left layouts.
  return (
    <span className={classes} dir="ltr">
      {sign && <span className={styles.sign}>{sign}</span>}
      {formatted.prefix && <span className={styles.prefix}>{formatted.prefix}</span>}
      <span>{formatted.integer}</span>
      {formatted.decimals && <span className={styles.decimals}>{formatted.decimals}</span>}
      {formatted.unit && <span className={styles.unit}> {formatted.unit}</span>}
    </span>
  );
};
