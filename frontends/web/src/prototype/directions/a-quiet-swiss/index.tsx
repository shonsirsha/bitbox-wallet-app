// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction A "Quiet Swiss"
// No cards: hairline lists, large light numerals, generous white. Sidebar with the account list
// from tablet up, flat tab bar on phones. Closest evolution of today's app.

import { useState } from 'react';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, DeviceStatus, IconButton, List, ListRow, Logo, Navigation,
  PageHeader, Section, SegmentedControl, Sheet, SkeletonRows, TChartPoint, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TRange, RANGE_OPTIONS, allocation, chartPoints, fiatAmount, groupAccounts,
  useAccounts, useBalance, useChart, useDevice, useSummary, useTransactions,
} from '../../data';
import { href } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow } from '../../patterns/tx-row';
import { AccountBalance, HideAmountsButton, closeTransaction, coinHref, navItems } from '../shared';
import type { TDirectionProps } from '../types';
import styles from './a.module.css';

const RANGE_LABEL: Record<TRange, string> = { week: 'past week', month: 'past month', year: 'past year', all: 'all time' };

const Portfolio = () => {
  const { locale } = usePrototype();
  const summary = useSummary();
  const chart = useChart();
  const accounts = useAccounts();
  const [range, setRange] = useState<TRange>('year');
  const [scrub, setScrub] = useState<TChartPoint | null>(null);
  const points = chartPoints(chart, range);
  const performance = chart?.chartPerformance[range].moneyWeightedReturn;
  const coins = summary?.coinsTotalBalance;
  const shares = allocation(coins?.map(coin => coin.formattedAmount) || [], 'USD');
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, 'USD') : undefined;
  return (
    <>
      <PageHeader title="Portfolio" actions={<HideAmountsButton />} />
      <div className={styles.hero}>
        <span className={styles.label}>{scrub ? format.formatShortDate(new Date(scrub.time * 1000).toISOString(), locale) : 'Total balance'}</span>
        <Amount value={scrub?.label ? fiatAmount(scrub.label, 'USD') : total} size="hero" />
        <span className={styles.meta}>
          <Delta value={performance} />
          <span>{RANGE_LABEL[range]}</span>
        </span>
      </div>
      <div className={styles.chart}>
        <AreaChart points={points} height={190} onScrub={setScrub} />
        <div className={styles.chartControls}>
          <SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />
        </div>
      </div>
      <Section title="Assets">
        {coins ? (
          <List>
            {coins.map((coin, i) => (
              <ListRow
                key={coin.coinCode}
                href={coinHref(accounts, coin.coinCode)}
                leading={<CoinIcon coinCode={coin.coinCode} size={32} />}
                title={coin.coinName}
                subtitle={<Amount value={coin.formattedAmount} as="coin" size="sm" tone="muted" />}
                trailing={<Amount value={coin.formattedAmount} />}
                trailingSub={`${(100 * (shares[i] || 0)).toFixed(1)}%`} />
            ))}
          </List>
        ) : <SkeletonRows count={5} />}
      </Section>
    </>
  );
};

const AccountList = ({ selected, compact = false }: { selected?: string; compact?: boolean }) => {
  const accounts = useAccounts();
  const groups = groupAccounts(accounts);
  if (!groups) {
    return <SkeletonRows count={4} />;
  }
  return (
    <List className={compact ? styles.compactList : ''}>
      {groups.flatMap(({ account, tokens }) => [account, ...tokens]).map(account => (
        <ListRow
          key={account.code}
          href={href.account(account.code)}
          selected={account.code === selected}
          leading={<CoinIcon coinCode={account.coinCode} size={compact ? 22 : 32} />}
          title={account.name}
          subtitle={<AccountBalance account={account} as={compact ? 'fiat' : 'coin'} size="sm" tone="muted" />}
          trailing={compact ? undefined : <AccountBalance account={account} />}
          chevron={!compact} />
      ))}
    </List>
  );
};

const Accounts = () => {
  const device = useDevice();
  return (
    <>
      <PageHeader title="Accounts" actions={<><HideAmountsButton /><IconButton icon="plus" label="Add account" href="#/add-account" /></>} />
      <Section
        title={device.name}
        action={<DeviceStatus name="Connected" state="connected" variant="chip" />}>
        <AccountList />
      </Section>
      <Section title="Lightning">
        <List>
          <ListRow href={href.lightning} leading={<CoinIcon coinCode="lightning" size={32} />} title="Lightning" subtitle="Instant payments" chevron />
        </List>
      </Section>
    </>
  );
};

const Account = ({ code, txId }: { code: string; txId?: string }) => {
  const { locale } = usePrototype();
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  const months: { key: string; label: string; items: NonNullable<typeof transactions> }[] = [];
  transactions?.forEach(tx => {
    const label = format.formatMonthLabel(tx.time, locale);
    const last = months[months.length - 1];
    if (last && last.label === label) {
      last.items.push(tx);
    } else {
      months.push({ key: label, label, items: [tx] });
    }
  });
  if (accounts && !account) {
    return <ComingSoon title="Account not found" />;
  }
  return (
    <>
      <PageHeader
        title={account?.name || ' '}
        subtitle={account ? `${account.coinName} · ${account.keystore.name}` : undefined}
        back={href.accounts}
        actions={<><HideAmountsButton /><IconButton icon="info" label="Account info" href={`#/account/${code}/info`} /></>} />
      <div className={styles.hero}>
        <span className={styles.label}>Available balance</span>
        <Amount value={balance?.available} as="coin" size="hero" />
        <span className={styles.meta}>
          <Amount value={balance?.available} size="lg" tone="muted" />
          {balance?.hasIncoming && <Badge tone="warning" icon="clock">Incoming <Amount value={balance.incoming} as="coin" size="sm" sign="+" /></Badge>}
        </span>
      </div>
      <div className={styles.actions}>
        <Button icon="send" href={href.send(code)}>Send</Button>
        <Button icon="receive" variant="secondary" href={href.receive(code)}>Receive</Button>
        <IconButton icon="swap" label="Buy, sell or swap" variant="filled" href={`#/market/select/${code}`} />
      </div>
      {transactions === undefined && <SkeletonRows count={6} />}
      <div className={styles.activity}>
        {months.map(month => (
          <Section key={month.key} title={month.label}>
            <List>
              {month.items.map(tx => account && (
                <TxRow key={tx.internalID} tx={tx} account={account} leading="glyph" selected={tx.internalID === txId} />
              ))}
            </List>
          </Section>
        ))}
      </div>
      <Sheet open={!!(selectedTx && account)} onClose={() => closeTransaction(code)} title="Transaction" presentation="panel">
        {selectedTx && account && <TransactionDetails tx={selectedTx} account={account} />}
      </Sheet>
    </>
  );
};

export const DirectionA = ({ screen }: TDirectionProps) => {
  const device = useDevice();
  const selected = screen.name === 'account' ? screen.code : undefined;
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Navigation
          layout="sidebar"
          items={navItems(screen, ['portfolio', 'market', 'settings'])}
          header={<a href={href.portfolio} aria-label="Portfolio"><Logo height={19} /></a>}
          footer={<DeviceStatus name={device.name} state={device.connected ? 'connected' : 'disconnected'} detail={device.firmware ? `Firmware ${device.firmware}` : undefined} />}>
          <Section title="Accounts" variant="plain" action={<IconButton icon="plus" label="Add account" size="sm" href="#/add-account" />}>
            <AccountList selected={selected} compact />
          </Section>
        </Navigation>
      </aside>
      <main className={styles.main}>
        <div className={styles.content}>
          {screen.name === 'portfolio' && <Portfolio />}
          {screen.name === 'accounts' && <Accounts />}
          {screen.name === 'account' && <Account code={screen.code} txId={screen.txId} />}
          {screen.name === 'kit' && <KitPage />}
          {screen.name === 'other' && <ComingSoon title={screen.title} />}
        </div>
      </main>
      <div className={styles.tabbar}>
        <Navigation layout="tabbar" items={navItems(screen, undefined, true)} />
      </div>
    </div>
  );
};
