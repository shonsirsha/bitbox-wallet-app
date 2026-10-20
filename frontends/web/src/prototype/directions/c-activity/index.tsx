// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction C "Activity first"
// What happened, and what can I do: the activity feed is the home screen. One centered column and
// no navigation chrome at any size. The top bar's scope switcher picks whose activity the feed
// shows; Receive and Send float in a dock on phones and tablets and sit under the balance on desktop.

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { TAccount } from '@/api/account';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, GlyphIcon, IconButton, List, ListRow, Logo, Message,
  PageHeader, Section, SegmentedControl, Sheet, SkeletonRows, TChartPoint, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TActivityItem, TRange, RANGE_OPTIONS, chartPoints, fiatAmount, groupAccounts,
  useAccounts, useActivity, useBalance, useChart, useSummary, useTransactions,
} from '../../data';
import { href, TScreen } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow } from '../../patterns/tx-row';
import { AccountBalance, HideAmountsButton, activeNav, closeTransaction } from '../shared';
import type { TDirectionProps } from '../types';
import styles from './c.module.css';

const RANGE_LABEL: Record<TRange, string> = { week: 'past week', month: 'past month', year: 'past year', all: 'all time' };

// Receive and Send across all accounts start by picking an account (designed in round 2).
const SELECT_RECEIVE = '#/accounts/select-receive';
const SELECT_SEND = '#/accounts/select-send';

// Feed items shown before "Show more".
const FEED_PAGE = 30;

// The scope the feed and the switcher show: 'all', an account code or 'lightning'.
const scopeOf = (screen: TScreen) => {
  switch (screen.name) {
  case 'portfolio':
    return 'all';
  case 'account':
    return screen.code;
  default:
    return activeNav(screen) === 'lightning' ? 'lightning' : undefined;
  }
};

const scopeLabel = (screen: TScreen, accounts?: TAccount[]) => {
  if (screen.name === 'account') {
    return accounts?.find(account => account.code === screen.code)?.name || 'Account';
  }
  return activeNav(screen) === 'lightning' ? 'Lightning' : 'All accounts';
};

type TDay = { key: string; label: string; items: TActivityItem[] };

const byDay = (items: TActivityItem[], locale: string) => {
  const days: TDay[] = [];
  items.forEach(item => {
    const key = format.dayKey(item.tx.time);
    const last = days[days.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      days.push({ key, label: format.formatDayLabel(item.tx.time, locale), items: [item] });
    }
  });
  return days;
};

// Receive / Send: the floating dock on phones and tablets, inline under the balance on desktop.
const Actions = ({ receive, send }: { receive: string; send: string }) => (
  <div className={styles.actions}>
    <Button variant="secondary" icon="receive" href={receive} full>Receive</Button>
    <Button icon="send" href={send} full>Send</Button>
  </div>
);

type TBalanceProps = {
  label: ReactNode;
  amount: ReactNode;
  meta: ReactNode;
  actions: ReactNode;
};

const Balance = ({ label, amount, meta, actions }: TBalanceProps) => (
  <div className={styles.summary}>
    <div className={styles.hero}>
      <span className={styles.label}>{label}</span>
      {amount}
      <span className={styles.meta}>{meta}</span>
    </div>
    {actions}
  </div>
);

type TFeedProps = {
  items?: TActivityItem[];
  // Several accounts in one feed: fiat leads and every row names its account.
  merged?: boolean;
};

const Feed = ({ items, merged = false }: TFeedProps) => {
  const { locale } = usePrototype();
  const [showAll, setShowAll] = useState(false);
  if (!items) {
    return <SkeletonRows count={6} />;
  }
  if (!items.length) {
    return <Message tone="info" title="No activity yet">Transactions show up here as soon as coins arrive.</Message>;
  }
  const days = byDay(showAll ? items : items.slice(0, FEED_PAGE), locale);
  return (
    <div className={`${styles.feed || ''} ${styles.cards || ''}`}>
      {days.map(day => (
        <Section key={day.key} title={day.label}>
          <List>
            {day.items.map(({ account, tx }) => (
              <TxRow
                key={`${account.code}:${tx.internalID}`}
                tx={tx}
                account={account}
                leading="coin"
                showAccount={merged}
                primary={merged ? 'fiat' : 'coin'}
                date="time" />
            ))}
          </List>
        </Section>
      ))}
      {!showAll && items.length > FEED_PAGE && (
        <div className={styles.more}>
          <Button variant="ghost" onClick={() => setShowAll(true)}>Show more</Button>
        </div>
      )}
    </div>
  );
};

// Balance, chart and range: scrubbing re-renders only this part, not the feed below.
const PortfolioSummary = () => {
  const { locale, fiat } = usePrototype();
  const chart = useChart();
  const [range, setRange] = useState<TRange>('year');
  const [scrub, setScrub] = useState<TChartPoint | null>(null);
  const points = useMemo(() => chartPoints(chart, range), [chart, range]);
  const performance = chart?.chartPerformance[range].moneyWeightedReturn;
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  const scrubbed = scrub ? new Date(scrub.time * 1000).toISOString() : null;
  return (
    <>
      <Balance
        label={scrubbed
          ? (range === 'week' ? format.formatDateTime(scrubbed, locale) : format.formatShortDate(scrubbed, locale))
          : 'All accounts'}
        amount={<Amount value={scrub?.label ? fiatAmount(scrub.label, fiat) : total} size="hero" />}
        meta={(
          <>
            <Delta value={performance} />
            <span>{RANGE_LABEL[range]}</span>
          </>
        )}
        actions={<Actions receive={SELECT_RECEIVE} send={SELECT_SEND} />} />
      <div className={styles.chart}>
        <AreaChart points={points} height={120} onScrub={setScrub} />
        <div className={styles.ranges}>
          <SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />
        </div>
      </div>
    </>
  );
};

const Portfolio = () => {
  const accounts = useAccounts();
  const activity = useActivity(accounts);
  return (
    <>
      <PortfolioSummary />
      <Feed items={activity} merged />
    </>
  );
};

const Account = ({ code, txId }: { code: string; txId?: string }) => {
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const items = useMemo(
    () => (account && transactions ? transactions.map(tx => ({ account, tx })) : undefined),
    [account, transactions],
  );
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  const onClose = useCallback(() => closeTransaction(code), [code]);
  if (accounts && !account) {
    return <ComingSoon title="Account not found" />;
  }
  return (
    <>
      <Balance
        label={account?.name || '\u00a0'}
        amount={<Amount value={balance?.available} as="coin" size="hero" />}
        meta={(
          <>
            <Amount value={balance?.available} size="lg" tone="muted" />
            {balance?.hasIncoming && (
              <Badge tone="warning" icon="clock">Incoming <Amount value={balance.incoming} as="coin" size="sm" sign="+" /></Badge>
            )}
          </>
        )}
        actions={<Actions receive={href.receive(code)} send={href.send(code)} />} />
      <Feed items={items} />
      <Sheet open={!!(selectedTx && account)} onClose={onClose} title="Transaction" presentation="dialog">
        {selectedTx && account && <TransactionDetails tx={selectedTx} account={account} />}
      </Sheet>
    </>
  );
};

// "All accounts", every account and Lightning: the switcher sheet and the Accounts page.
const ScopeList = ({ current, className }: { current?: string; className?: string }) => {
  const { fiat } = usePrototype();
  const accounts = useAccounts();
  const summary = useSummary();
  const chart = useChart();
  const groups = groupAccounts(accounts);
  if (!accounts || !groups) {
    return <SkeletonRows count={6} />;
  }
  const lightning = summary?.coinsTotalBalance.find(coin => coin.coinCode === 'lightning')?.formattedAmount;
  const keystores = Array.from(new Set(accounts.map(account => account.keystore.name))).join(' · ');
  return (
    <List className={className}>
      <ListRow
        href={href.portfolio}
        selected={current === 'all'}
        leading={<GlyphIcon icon="wallet" />}
        title="All accounts"
        subtitle={keystores}
        trailing={<Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} />} />
      {groups.flatMap(({ account, tokens }) => [account, ...tokens]).map(account => (
        <ListRow
          key={account.code}
          href={href.account(account.code)}
          selected={current === account.code}
          leading={<CoinIcon coinCode={account.coinCode} />}
          title={account.name}
          subtitle={<AccountBalance account={account} as="coin" size="sm" tone="muted" />}
          trailing={<AccountBalance account={account} />} />
      ))}
      <ListRow
        href={href.lightning}
        selected={current === 'lightning'}
        leading={<CoinIcon coinCode="lightning" />}
        title="Lightning"
        subtitle={<Amount value={lightning} as="coin" size="sm" tone="muted" />}
        trailing={<Amount value={lightning} />} />
    </List>
  );
};

const Accounts = () => (
  <>
    <PageHeader title="Accounts" actions={<IconButton icon="plus" label="Add account" href="#/add-account" />} />
    <Section className={styles.cards}>
      <ScopeList />
    </Section>
  </>
);

export const DirectionC = ({ screen }: TDirectionProps) => {
  const accounts = useAccounts();
  const [switcher, setSwitcher] = useState(false);
  const closeSwitcher = useCallback(() => setSwitcher(false), []);
  // Any navigation, also back/forward, closes the switcher.
  useEffect(() => setSwitcher(false), [screen]);
  const nav = activeNav(screen);
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.barRow}>
          <div className={styles.barStart}>
            <a className={styles.logo} href={href.portfolio} aria-label="Portfolio"><Logo height={19} /></a>
            <Button variant="secondary" size="sm" icon="chevronDown" className={styles.switcher} onClick={() => setSwitcher(true)}>
              {scopeLabel(screen, accounts)}
            </Button>
          </div>
          <div className={styles.barEnd}>
            <HideAmountsButton />
            <IconButton icon="marketplace" label="Marketplace" href={href.market} active={nav === 'market'} />
            <IconButton icon="settings" label="Settings" href={href.settings} active={nav === 'settings'} />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          {screen.name === 'portfolio' && <Portfolio />}
          {screen.name === 'accounts' && <Accounts />}
          {screen.name === 'account' && <Account key={screen.code} code={screen.code} txId={screen.txId} />}
          {screen.name === 'kit' && <KitPage />}
          {screen.name === 'other' && <ComingSoon title={screen.title} />}
        </div>
      </main>
      <Sheet open={switcher} onClose={closeSwitcher} title="Accounts">
        {/* Rows are links: picking one, even the current scope, closes the sheet. */}
        <div onClick={closeSwitcher}>
          <ScopeList current={scopeOf(screen)} className={styles.menuList} />
        </div>
      </Sheet>
    </div>
  );
};
