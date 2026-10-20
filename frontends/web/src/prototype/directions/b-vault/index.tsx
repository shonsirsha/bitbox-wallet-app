// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction B "Vault"
// Dark-first and device-centric: the BitBox is the hero, security posture first, money second.
// Quiet bordered panels. The navigation panel stays dark in both themes and keeps the device in
// view: sidebar with the device card on desktop, icon rail plus a header chip on tablets, header
// chip plus tab bar on phones.

import { useState } from 'react';
import type { TAccount, TKeystore } from '@/api/account';
import { useMediaQuery } from '@/hooks/mediaquery';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, DeviceStatus, GlyphIcon, List, ListRow, Logo, Message, Navigation,
  PageHeader, Section, SegmentedControl, Sheet, Skeleton, SkeletonRows, TChartPoint, TDeviceState, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TRange, RANGE_OPTIONS, chartPoints, fiatAmount, groupAccounts,
  useAccounts, useBalance, useChart, useDevice, useSummary, useTransactions,
} from '../../data';
import { href } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow } from '../../patterns/tx-row';
import { AccountBalance, HideAmountsButton, TNavKey, closeTransaction, navItems } from '../shared';
import type { TDirectionProps } from '../types';
import styles from './b.module.css';

type TDevice = ReturnType<typeof useDevice>;
type TDeviceProps = { device: TDevice };
type THeaderProps = TDeviceProps & { pushed?: boolean };
type TPanelProps = { className?: string };
type TAccountProps = TDeviceProps & { code: string; txId?: string };
type TWallet = { keystore: TKeystore; accounts: TAccount[] };

// Lightning lives in the accounts and the phone tab bar, never in the side navigation.
const NAV_KEYS: TNavKey[] = ['portfolio', 'accounts', 'market', 'settings'];
const PHONE = '(max-width: 768px)';
const DESKTOP = '(min-width: 1200px)';
const BACKUP_HREF = '#/manage-backups/bitbox02-demo';
const RANGE_LABEL: Record<TRange, string> = { week: 'past week', month: 'past month', year: 'past year', all: 'all time' };

const stateOf = (device: TDevice): TDeviceState => (device.connected ? 'connected' : 'disconnected');

const firmwareDetail = ({ firmware, upToDate }: TDevice) => {
  if (!firmware) {
    return undefined;
  }
  return upToDate === undefined ? `Firmware ${firmware}` : `Firmware ${firmware} · ${upToDate ? 'up to date' : 'update available'}`;
};

// Accounts per wallet (keystore), tokens right after their parent account.
const walletsOf = (accounts: TAccount[] | undefined) => {
  const groups = groupAccounts(accounts);
  if (!groups) {
    return undefined;
  }
  const wallets: TWallet[] = [];
  groups.forEach(({ account, tokens }) => {
    const existing = wallets.find(wallet => wallet.keystore.rootFingerprint === account.keystore.rootFingerprint);
    const wallet = existing || { keystore: account.keystore, accounts: [] };
    if (!existing) {
      wallets.push(wallet);
    }
    wallet.accounts.push(account, ...tokens);
  });
  return wallets;
};

// Device presence in page headers on phones and tablets; the desktop sidebar shows the device card.
// Pushed screens name the device in their subtitle, so phones skip the chip there.
const HeaderActions = ({ device, pushed = false }: THeaderProps) => (
  <>
    <HideAmountsButton />
    <span className={`${styles.headerDevice} ${pushed ? styles.pushed : ''} ${styles.onPage}`}>
      {device.loaded
        ? <DeviceStatus name={device.name} state={stateOf(device)} variant="chip" />
        : <Skeleton width={112} height={32} radius="pill" />}
    </span>
  </>
);

const AccountRow = ({ account }: { account: TAccount }) => (
  <ListRow
    href={href.account(account.code)}
    leading={<CoinIcon coinCode={account.coinCode} size={32} />}
    title={account.name}
    subtitle={<AccountBalance account={account} as="coin" size="sm" tone="muted" />}
    trailing={<AccountBalance account={account} />}
    chevron />
);

const LightningRow = () => {
  const summary = useSummary();
  const balance = summary?.coinsTotalBalance.find(coin => coin.coinCode === 'lightning')?.formattedAmount;
  return (
    <ListRow
      href={href.lightning}
      leading={<CoinIcon coinCode="lightning" size={32} />}
      title="Lightning"
      subtitle={<Amount value={balance} as="coin" size="sm" tone="muted" />}
      trailing={<Amount value={balance} />}
      chevron />
  );
};

const BalancePanel = ({ className = '' }: TPanelProps) => {
  const { fiat, locale } = usePrototype();
  const phone = useMediaQuery(PHONE);
  const desktop = useMediaQuery(DESKTOP);
  const chart = useChart();
  const [range, setRange] = useState<TRange>('year');
  const [scrub, setScrub] = useState<TChartPoint | null>(null);
  const performance = chart?.chartPerformance[range].moneyWeightedReturn;
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  return (
    <Section title="Total balance" className={className}>
      <div className={styles.balance}>
        <div className={styles.hero}>
          <Amount value={scrub?.label ? fiatAmount(scrub.label, fiat) : total} size="hero" />
          <span className={styles.meta}>
            {scrub ? <span>{format.formatShortDate(new Date(scrub.time * 1000).toISOString(), locale)}</span> : (
              <>
                <Delta value={performance} />
                <span>{RANGE_LABEL[range]}</span>
              </>
            )}
          </span>
        </div>
        <div className={styles.chart}>
          {/* Desktop: tall enough to line up with the device panel next to it. */}
          <AreaChart points={chartPoints(chart, range)} height={desktop ? 252 : phone ? 168 : 200} onScrub={setScrub} />
        </div>
        <div className={styles.range}>
          <SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" full />
        </div>
      </div>
    </Section>
  );
};

const SecurityPanel = ({ device, className = '' }: TDeviceProps & TPanelProps) => {
  const phone = useMediaQuery(PHONE);
  // On desktop the sidebar already shows the device card; the panel keeps to the compact row.
  const desktop = useMediaQuery(DESKTOP);
  return (
    <Section title="Your BitBox" className={className}>
      <div className={styles.securityBody}>
        <div className={styles.securityDevice}>
          {device.loaded
            ? <DeviceStatus name={device.name} state={stateOf(device)} variant={phone || desktop ? 'row' : 'card'} />
            : <Skeleton height={phone || desktop ? 36 : 180} radius="l" />}
        </div>
        {device.connected && (
          <List>
            <ListRow
              title="Firmware"
              subtitle={device.firmware ? `Version ${device.firmware}` : undefined}
              trailing={device.upToDate === undefined
                ? <Skeleton width={92} height={22} radius="pill" />
                : <Badge tone={device.upToDate ? 'success' : 'warning'} dot>{device.upToDate ? 'Up to date' : 'Update available'}</Badge>} />
            <ListRow
              title="Passphrase"
              trailing={device.passphrase === undefined
                ? <Skeleton width={40} height={22} radius="pill" />
                : <Badge>{device.passphrase ? 'On' : 'Off'}</Badge>} />
            <ListRow
              title="Recovery words"
              trailing={<span className={styles.flushEnd}><Button variant="ghost" size="sm" href={BACKUP_HREF}>Check backup</Button></span>} />
          </List>
        )}
      </div>
    </Section>
  );
};

const AccountsPanel = ({ className = '' }: TPanelProps) => {
  const wallets = walletsOf(useAccounts());
  return (
    <Section title="Accounts" className={className}>
      {wallets ? (
        <div className={styles.groups}>
          {wallets.map(wallet => (
            <Section key={wallet.keystore.rootFingerprint} title={wallet.keystore.name} variant="plain">
              <List>{wallet.accounts.map(account => <AccountRow key={account.code} account={account} />)}</List>
            </Section>
          ))}
          <Section title="Lightning" variant="plain">
            <List><LightningRow /></List>
          </Section>
        </div>
      ) : <SkeletonRows count={5} />}
    </Section>
  );
};

// Desktop: balance and device side by side, accounts below. Tablet stacks them; phones put the
// money first and the device panel last.
const Portfolio = ({ device }: TDeviceProps) => (
  <>
    <PageHeader title="Portfolio" actions={<HeaderActions device={device} />} />
    <div className={styles.portfolio}>
      <BalancePanel className={styles.balanceArea} />
      <SecurityPanel device={device} className={styles.securityArea} />
      <AccountsPanel className={styles.accountsArea} />
    </div>
  </>
);

const Accounts = ({ device }: TDeviceProps) => {
  const wallets = walletsOf(useAccounts());
  return (
    <>
      <PageHeader title="Accounts" actions={<HeaderActions device={device} />} />
      {wallets ? wallets.map(wallet => (
        <Section
          key={wallet.keystore.rootFingerprint}
          title={wallet.keystore.name}
          action={(
            <span className={styles.onPage}>
              <DeviceStatus
                name={wallet.keystore.connected ? 'Connected' : 'Not connected'}
                state={wallet.keystore.connected ? 'connected' : 'disconnected'}
                variant="chip" />
            </span>
          )}>
          <List>
            {wallet.accounts.map(account => <AccountRow key={account.code} account={account} />)}
            <ListRow href="#/add-account" leading={<GlyphIcon icon="plus" size={32} tone="accent" />} title="Add account" />
          </List>
        </Section>
      )) : (
        <Section title={device.name}>
          <SkeletonRows count={5} />
        </Section>
      )}
      <Section title="Lightning">
        <List><LightningRow /></List>
      </Section>
    </>
  );
};

const Account = ({ device, code, txId }: TAccountProps) => {
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  if (accounts && !account) {
    return <ComingSoon title="Account not found" />;
  }
  return (
    <>
      <PageHeader
        title={account?.name || ' '}
        subtitle={account ? `${account.coinName} · On ${account.keystore.name}` : undefined}
        back={href.accounts}
        actions={<HeaderActions device={device} pushed />} />
      <Section title="Available balance">
        <div className={styles.accountBalance}>
          <div className={styles.hero}>
            <Amount value={balance?.available} as="coin" size="hero" />
            <span className={styles.meta}>
              <Amount value={balance?.available} size="lg" tone="muted" />
              {balance?.hasIncoming && <Badge tone="warning" icon="clock">Incoming <Amount value={balance.incoming} as="coin" size="sm" sign="+" /></Badge>}
            </span>
          </div>
          <div className={styles.actions}>
            <Button icon="send" href={href.send(code)}>Send</Button>
            <Button icon="receive" variant="secondary" href={href.receive(code)}>Receive</Button>
          </div>
        </div>
      </Section>
      <Section title="Activity" className={styles.activity}>
        {transactions === undefined || !account ? <SkeletonRows count={6} /> : transactions.length ? (
          <List>
            {transactions.map(tx => (
              <TxRow key={tx.internalID} tx={tx} account={account} leading="coin" selected={tx.internalID === txId} />
            ))}
          </List>
        ) : (
          <Message tone="info" title="No transactions yet">Coins you receive show up here.</Message>
        )}
      </Section>
      <Sheet open={!!(selectedTx && account)} onClose={() => closeTransaction(code)} title="Transaction" presentation="panel">
        {selectedTx && account && <TransactionDetails tx={selectedTx} account={account} />}
      </Sheet>
    </>
  );
};

export const DirectionB = ({ screen }: TDirectionProps) => {
  const device = useDevice();
  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${styles.dark}`}>
        <Navigation
          layout="sidebar"
          items={navItems(screen, NAV_KEYS)}
          header={(
            <div className={styles.sidebarHeader}>
              <a href={href.portfolio} aria-label="Portfolio"><Logo height={19} onDark /></a>
              {device.loaded
                ? <DeviceStatus name={device.name} state={stateOf(device)} detail={firmwareDetail(device)} variant="card" onDark />
                : <Skeleton height={196} radius="l" />}
            </div>
          )} />
      </aside>
      <aside className={`${styles.rail} ${styles.dark}`}>
        <Navigation layout="rail" items={navItems(screen, NAV_KEYS, true)} />
      </aside>
      <main className={styles.main}>
        <div className={styles.content}>
          {screen.name === 'portfolio' && <Portfolio device={device} />}
          {screen.name === 'accounts' && <Accounts device={device} />}
          {screen.name === 'account' && <Account device={device} code={screen.code} txId={screen.txId} />}
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
