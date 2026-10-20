// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): one transaction as a kit ListRow.

import type { TAccount, TTransaction } from '@/api/account';
import { Amount, Badge, CoinIcon, Icon, ListRow, TCoinBadge, format } from '../kit';
import { usePrototype } from '../context';
import { href } from '../routing';
import styles from './patterns.module.css';

// What happened, always the row title; the transaction's note (if any) follows it.
export const txAction = (tx: TTransaction) => {
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


export const txSign = (tx: TTransaction) => (tx.type === 'receive' ? '+' : tx.type === 'send' ? '−' : '');

type TProps = {
  tx: TTransaction;
  account: TAccount;
  showAccount?: boolean;
  // Which amount leads on the right; the other one goes underneath.
  primary?: 'coin' | 'fiat';
  // 'primary' drops the second amount (narrow summary lists like "Recent activity").
  amounts?: 'both' | 'primary';
  selected?: boolean;
  // Where the row leads; the transaction's details by default.
  link?: string;
};

export const TxRow = ({
  tx, account, showAccount = false, primary = 'coin', amounts = 'both', selected = false, link,
}: TProps) => {
  const { locale } = usePrototype();
  const kind = txKind(tx);
  const when = format.formatDayLabel(tx.time, locale, 'short');
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
      href={link ?? href.transaction(account.code, tx.internalID)}
      selected={selected}
      leading={<CoinIcon coinCode={account.coinCode} size={36} badge={kind} />}
      title={(
        <>
          {txAction(tx)}
          {tx.note && (
            <span className={styles.note}>
              <Icon name="note" size={13} className={styles.noteIcon} />
              {tx.note}
            </span>
          )}
        </>
      )}
      subtitle={subtitle}
      trailing={primary === 'coin' ? coin : fiat}
      trailingSub={amounts === 'primary'
        ? (dateUnderAmount ? when : undefined)
        : (primary === 'coin' ? fiat : coin)} />
  );
};
