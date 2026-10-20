// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): transaction details content, shown in the Sheet.

import type { TAccount, TTransaction } from '@/api/account';
import { Amount, Badge, Button, CoinIcon, IconButton, List, ListRow, format } from '../kit';
import { usePrototype } from '../context';
import { txAction, txKind, txSign } from './tx-row';
import styles from './patterns.module.css';

type TProps = {
  tx: TTransaction;
  account: TAccount;
};

const copy = (value: string) => {
  navigator.clipboard?.writeText(value).catch(() => {});
};

export const TransactionDetails = ({ tx, account }: TProps) => {
  const { locale } = usePrototype();
  const kind = txKind(tx);
  const confirmed = tx.numConfirmations >= tx.numConfirmationsComplete;
  const status = tx.status === 'failed'
    ? <Badge tone="danger">Failed</Badge>
    : tx.status === 'pending'
      ? <Badge tone="warning" icon="clock">{tx.numConfirmations} of {tx.numConfirmationsComplete} confirmations</Badge>
      : <Badge tone="success" icon="check">{confirmed ? 'Confirmed' : `${tx.numConfirmations} confirmations`}</Badge>;
  const address = tx.addresses[0] || '';
  const hasFee = tx.type !== 'receive' && !!tx.fee.amount;
  return (
    <div className={styles.details}>
      <div className={styles.detailsHeader}>
          <CoinIcon coinCode={account.coinCode} size={48} badge={kind} />
          <p className={styles.detailsTitle}>{txAction(tx)}</p>
          <Amount value={tx.amount} as="coin" size="xl" sign={txSign(tx)} />
          <Amount value={tx.amount} as="fiat" size="md" tone="muted" sign={txSign(tx)} />
          <div className={styles.detailsStatus}>{status}</div>
      </div>
      <List>
        <ListRow title="Date" trailing={format.formatDateTime(tx.time, locale)} />
        <ListRow title="Account" trailing={account.name} trailingSub={account.coinName} />
        <ListRow
          title={tx.type === 'send' ? 'To' : 'Address'}
          subtitle={<span className={styles.mono}>{format.middleEllipsis(address, 10)}</span>}
          trailing={<IconButton icon="copy" label="Copy address" size="sm" onClick={() => copy(address)} />} />
        {hasFee && (
          <ListRow
            title="Network fee"
            subtitle={tx.feeRateInfo || undefined}
            trailing={<Amount value={tx.fee} as="coin" size="sm" />}
            trailingSub={<Amount value={tx.fee} as="fiat" size="sm" tone="muted" />} />
        )}
        <ListRow
          title={tx.type === 'receive' ? 'Value when received' : 'Value when sent'}
          trailing={<Amount value={tx.amountAtTime} as="fiat" size="sm" />} />
        <ListRow
          title="Transaction ID"
          subtitle={<span className={styles.mono}>{format.middleEllipsis(tx.txID, 10)}</span>}
          trailing={<IconButton icon="copy" label="Copy transaction ID" size="sm" onClick={() => copy(tx.txID)} />} />
        <ListRow title="Note" subtitle={tx.note || 'No note'} trailing={<IconButton icon="note" label="Edit note" size="sm" />} />
      </List>
      <Button variant="secondary" icon="external" full href={`${account.blockExplorerTxPrefix}${tx.txID}`} external>
        View in block explorer
      </Button>
    </div>
  );
};
