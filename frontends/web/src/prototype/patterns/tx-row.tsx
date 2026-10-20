// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): one transaction as a kit ListRow, used by every direction.

import type { TAccount, TTransaction } from '@/api/account';
import { Amount, Badge, CoinIcon, GlyphIcon, ListRow, TCoinBadge, TIconName, format } from '../kit';
import { usePrototype } from '../context';
import { href } from '../routing';
import styles from './patterns.module.css';

export const txTitle = (tx: TTransaction) => {
  if (tx.note) {
    return tx.note;
  }
  switch (tx.type) {
  case 'receive':
    return 'Received';
  case 'send_to_self':
    return 'Sent to self';
  default:
    return 'Sent';
  }
};

export const txKind = (tx: TTransaction): TCoinBadge => {
  if (tx.status === 'failed') {
    return 'failed';
  }
  if (tx.status === 'pending') {
    return 'pending';
  }
  return tx.type === 'receive' ? 'receive' : tx.type === 'send_to_self' ? 'self' : 'send';
};

const GLYPHS: Record<TCoinBadge, TIconName> = {
  receive: 'arrowDown', send: 'arrowUp', self: 'self', pending: 'clock', failed: 'failed',
};

export const txSign = (tx: TTransaction) => (tx.type === 'receive' ? '+' : tx.type === 'send' ? '−' : '');

type TProps = {
  tx: TTransaction;
  account: TAccount;
  leading?: 'coin' | 'glyph' | 'none';
  showAccount?: boolean;
  date?: 'time' | 'day' | 'full';
  // Which amount leads on the right; the other one goes underneath.
  primary?: 'coin' | 'fiat';
  // 'primary' drops the second amount (narrow summary lists like "Recent activity").
  amounts?: 'both' | 'primary';
  selected?: boolean;
};

export const TxRow = ({
  tx, account, leading = 'glyph', showAccount = false, date = 'day', primary = 'coin', amounts = 'both', selected = false,
}: TProps) => {
  const { locale } = usePrototype();
  const kind = txKind(tx);
  const when = date === 'time'
    ? format.formatTime(tx.time, locale)
    : date === 'full'
      ? format.formatShortDate(tx.time, locale)
      : format.formatDayLabel(tx.time, locale, 'short');
  // A pending or failed transaction shows its status in place of the date, so it never truncates.
  const status = tx.status === 'pending'
    ? <Badge tone="warning">Pending</Badge>
    : tx.status === 'failed' ? <Badge tone="danger">Failed</Badge> : null;
  // With the account shown, the date moves under the amount (single-amount rows) or follows
  // the account name after a comma, so rows need no separator dots.
  const dateUnderAmount = showAccount && amounts === 'primary';
  const subtitle = showAccount
    ? (
      <>
        {account.name}{!dateUnderAmount && !status && `, ${when}`}
        {status && <span className={styles.subtitlePart}>{status}</span>}
      </>
    )
    : (status || when);
  const sign = txSign(tx);
  const coin = <Amount value={tx.amount} as="coin" sign={sign} size={primary === 'coin' ? 'md' : 'sm'} tone={primary === 'coin' ? 'default' : 'muted'} />;
  const fiat = <Amount value={tx.amount} as="fiat" sign={sign} size={primary === 'fiat' ? 'md' : 'sm'} tone={primary === 'fiat' ? 'default' : 'muted'} />;
  return (
    <ListRow
      href={href.transaction(account.code, tx.internalID)}
      selected={selected}
      leading={leading === 'coin'
        ? <CoinIcon coinCode={account.coinCode} size={36} badge={kind} />
        : leading === 'glyph' ? <GlyphIcon icon={GLYPHS[kind]} size={36} /> : undefined}
      title={txTitle(tx)}
      subtitle={subtitle}
      trailing={primary === 'coin' ? coin : fiat}
      trailingSub={amounts === 'primary'
        ? (dateUnderAmount ? when : undefined)
        : (primary === 'coin' ? fiat : coin)} />
  );
};
