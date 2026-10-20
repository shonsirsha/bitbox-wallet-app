// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import type { TAmountWithConversions } from '@/api/account';
import { usePrototype } from '../context';
import { fiatOf, formatCoinAmount, formatFiatAmount } from './format';
import { Odometer } from './odometer';
import styles from './amount.module.css';

type TProps = {
  value?: TAmountWithConversions;
  // 'fiat' shows the main fiat conversion, 'coin' the coin amount.
  as?: 'fiat' | 'coin';
  size?: 'hero' | 'xl' | 'lg' | 'md' | 'sm';
  tone?: 'default' | 'muted';
  sign?: '+' | '−' | '';
  // Digits roll like an odometer when the value appears or changes (not when amounts are shown
  // again after Hide amounts: then they just appear).
  animated?: boolean;
  // Animated amounts whose changes show at once (values read off a chart while scrubbing).
  instant?: boolean;
  className?: string;
};

export const Amount = ({ value, as = 'fiat', size = 'md', tone = 'default', sign = '', animated = false, instant = false, className = '' }: TProps) => {
  const { fiat, locale, hideAmounts } = usePrototype();
  const [wasHidden, setWasHidden] = useState(hideAmounts);
  if (hideAmounts && !wasHidden) {
    setWasHidden(true);
  }
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
  if (animated) {
    const text = `${sign}${formatted.prefix}${formatted.integer}${formatted.decimals}${formatted.unit ? ` ${formatted.unit}` : ''}`;
    return (
      <span className={classes} dir="ltr">
        <span className={styles.srOnly}>{text}</span>
        {sign && <span className={styles.sign} aria-hidden="true">{sign}</span>}
        {formatted.prefix && <span className={styles.prefix} aria-hidden="true">{formatted.prefix}</span>}
        <span><Odometer text={formatted.integer} rollIn={!wasHidden} instant={instant} /></span>
        {formatted.decimals && <span className={styles.decimals}><Odometer text={formatted.decimals} rollIn={!wasHidden} instant={instant} /></span>}
        {formatted.unit && <span className={styles.unit} aria-hidden="true"> {formatted.unit}</span>}
      </span>
    );
  }
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
