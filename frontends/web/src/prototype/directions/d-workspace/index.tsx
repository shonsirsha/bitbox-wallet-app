// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction D "Workspace"
// Master-detail panes like a mail client or Sparrow Wallet: from desktop up the accounts, the
// screen and an inspector with its details are visible at once. Dense rows, mono identifiers,
// keyboard-friendly (/ searches, J/K step through transactions, Esc closes them). Tablets fold
// the inspector into a side sheet; phones get stacked screens over a tab bar.

import { useEffect, useRef, useState } from 'react';
import type { TTransaction } from '@/api/account';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, DeviceStatus, GlyphIcon, IconButton, List, ListRow, Logo, Message,
  Navigation, PageHeader, Section, SegmentedControl, Sheet, SkeletonRows, TChartPoint, TextField, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TRange, RANGE_OPTIONS, allocation, chartPoints, fiatAmount, groupAccounts,
  useAccounts, useActivity, useBalance, useChart, useDevice, useSummary, useTransactions,
} from '../../data';
import { href, TScreen } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow } from '../../patterns/tx-row';
import { AccountBalance, HideAmountsButton, activeNav, closeTransaction, coinHref, navItems } from '../shared';
import type { TDirectionProps } from '../types';
import styles from './d.module.css';

type TLayout = 'phone' | 'tablet' | 'desktop';

const DESKTOP = '(min-width: 1200px)';
const TABLET = '(min-width: 769px)';

const currentLayout = (): TLayout => {
  if (window.matchMedia(DESKTOP).matches) {
    return 'desktop';
  }
  return window.matchMedia(TABLET).matches ? 'tablet' : 'phone';
};

// The panes change structure between breakpoints (inspector pane, side sheet, stacked screens),
// not only size, so the layout is picked here instead of hiding duplicated markup with CSS.
const useLayout = () => {
  const [layout, setLayout] = useState<TLayout>(currentLayout);
  useEffect(() => {
    const queries = [DESKTOP, TABLET].map(query => window.matchMedia(query));
    const onChange = () => setLayout(currentLayout());
    queries.forEach(query => query.addEventListener('change', onChange));
    return () => queries.forEach(query => query.removeEventListener('change', onChange));
  }, []);
  return layout;
};

const isTyping = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return !!element && (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable);
};

// Client-side search over what a transaction row stands for: note, addresses and transaction ID.
const matches = (tx: TTransaction, query: string) => {
  const needle = query.toLowerCase();
  return !needle || [tx.note, tx.txID, ...tx.addresses].some(value => value.toLowerCase().includes(needle));
};

const formatShare = (share: number, locale: string) => (
  new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(share)
);

const Performance = ({ value, range }: { value?: number | null; range: TRange }) => (
  <Delta value={value} label={RANGE_OPTIONS.find(option => option.value === range)?.label} />
);

const DeviceChip = () => {
  const device = useDevice();
  if (!device.loaded) {
    return null;
  }
  return (
    <DeviceStatus
      variant="chip"
      name={device.connected ? 'Connected' : 'Not connected'}
      state={device.connected ? 'connected' : 'disconnected'} />
  );
};

// ---------------------------------------------------------------------------------------------
// Frame: top bar and the accounts pane (tablet and desktop)

type TTopBarProps = { screen: TScreen; search: string; onSearch: (value: string) => void };

const TopBar = ({ screen, search, onSearch }: TTopBarProps) => {
  const { fiat } = usePrototype();
  const chart = useChart();
  const searchRef = useRef<HTMLDivElement>(null);
  const active = activeNav(screen);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <header className={styles.topbar}>
      <a className={styles.brand} href={href.portfolio} aria-label="Portfolio"><Logo height={18} /></a>
      <div className={styles.total}>
        <Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} />
        <Performance value={chart?.chartPerformance.year.moneyWeightedReturn} range="year" />
      </div>
      <div ref={searchRef} className={styles.search}>
        <TextField type="search" icon="search" value={search} onChange={onSearch} placeholder="Search transactions" />
      </div>
      <div className={styles.tools}>
        <HideAmountsButton />
        <IconButton icon="marketplace" label="Marketplace" href={href.market} active={active === 'market'} />
        <IconButton icon="settings" label="Settings" href={href.settings} active={active === 'settings'} />
      </div>
    </header>
  );
};

const AccountRows = ({ selected, compact = false }: { selected?: string; compact?: boolean }) => {
  const accounts = useAccounts();
  const groups = groupAccounts(accounts);
  if (!groups) {
    return <SkeletonRows count={4} />;
  }
  return (
    <List className={compact ? styles.navList : styles.bleed}>
      {groups.flatMap(({ account, tokens }) => [account, ...tokens]).map(account => (
        <ListRow
          key={account.code}
          href={href.account(account.code)}
          selected={account.code === selected}
          leading={<CoinIcon coinCode={account.coinCode} size={compact ? 24 : 32} />}
          title={account.name}
          subtitle={<AccountBalance account={account} as={compact ? 'fiat' : 'coin'} size="sm" tone="muted" />}
          trailing={compact ? undefined : <AccountBalance account={account} />}
          chevron={!compact} />
      ))}
    </List>
  );
};

const AccountsPane = ({ screen }: { screen: TScreen }) => {
  const device = useDevice();
  return (
    <nav className={[styles.pane, styles.side, styles.accountsPane].join(' ')} aria-label="Accounts">
      <List className={styles.navList}>
        <ListRow
          href={href.portfolio}
          selected={screen.name === 'portfolio'}
          leading={<GlyphIcon icon="portfolio" size={24} />}
          title="Portfolio"
          subtitle="All accounts" />
      </List>
      <Section variant="plain" title={device.name} action={<DeviceChip />}>
        <AccountRows selected={screen.name === 'account' ? screen.code : undefined} compact />
      </Section>
      <div className={styles.addAccount}>
        <Button variant="ghost" size="sm" icon="plus" href="#/add-account">Add account</Button>
      </div>
    </nav>
  );
};

// ---------------------------------------------------------------------------------------------
// Inspector content (a pane on desktop, under the screen or in a side sheet on tablets)

const DeviceDetails = ({ wide = false }: { wide?: boolean }) => {
  const device = useDevice();
  const accounts = useAccounts();
  const unknown = '—';
  return (
    <Section title="Device">
      <div className={wide ? styles.deviceWide : styles.stack}>
        <DeviceStatus variant="card" name={device.name} state={device.connected ? 'connected' : 'disconnected'} />
        <List className={styles.facts}>
          <ListRow title="Firmware" trailing={device.firmware || unknown} />
          <ListRow title="Passphrase" trailing={device.passphrase === undefined ? unknown : device.passphrase ? 'On' : 'Off'} />
          <ListRow title="Accounts" trailing={accounts ? String(accounts.length) : unknown} />
          <ListRow
            title="Updates"
            trailing={device.upToDate === undefined
              ? unknown
              : device.upToDate
                ? <Badge tone="success" icon="check">Up to date</Badge>
                : <Badge tone="warning" icon="warning">Update available</Badge>} />
        </List>
      </div>
    </Section>
  );
};

const AccountInspector = ({ code, txId }: { code: string; txId?: string }) => {
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const transactions = useTransactions(code);
  const tx = transactions?.find(candidate => candidate.internalID === txId);
  if (!account || !transactions) {
    return accounts && !account ? null : <SkeletonRows count={5} />;
  }
  if (tx) {
    return (
      <Section
        title="Transaction"
        action={<IconButton icon="close" label="Close details" size="sm" href={href.account(code)} />}>
        <TransactionDetails tx={tx} account={account} dense />
      </Section>
    );
  }
  const pending = transactions.filter(candidate => candidate.status === 'pending').length;
  return (
    <>
      <Section title="Account">
        <List className={styles.facts}>
          <ListRow title="Coin" trailing={`${account.coinName} · ${account.coinUnit}`} />
          <ListRow title="Wallet" trailing={account.keystore.name} />
          <ListRow title="Transactions" trailing={String(transactions.length)} />
          <ListRow title="Pending" trailing={String(pending)} />
        </List>
      </Section>
      <Message tone="info" title="Select a transaction to see its details.">
        J and K step through the list, / jumps to search and Esc closes the details.
      </Message>
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Screens

const Portfolio = ({ layout }: { layout: TLayout }) => {
  const { fiat, locale } = usePrototype();
  const summary = useSummary();
  const chart = useChart();
  const accounts = useAccounts();
  const [range, setRange] = useState<TRange>('year');
  const [scrub, setScrub] = useState<TChartPoint | null>(null);
  const coins = summary?.coinsTotalBalance;
  const shares = allocation(coins?.map(coin => coin.formattedAmount) || [], fiat);
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  const scrubDate = scrub && new Date(scrub.time * 1000).toISOString();
  return (
    <>
      <PageHeader title="Portfolio" />
      <Section
        title={scrubDate ? (range === 'week' ? format.formatDateTime : format.formatShortDate)(scrubDate, locale) : 'Total balance'}
        action={<SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />}>
        <div className={styles.chartBlock}>
          <div className={styles.figure}>
            <Amount value={scrub?.label ? fiatAmount(scrub.label, fiat) : total} size="hero" />
            <Performance value={chart?.chartPerformance[range].moneyWeightedReturn} range={range} />
          </div>
          <AreaChart points={chartPoints(chart, range)} height={220} onScrub={setScrub} />
        </div>
      </Section>
      <Section title="Allocation">
        {coins ? (
          <List className={styles.bleed}>
            {coins.map((coin, i) => (
              <ListRow
                key={coin.coinCode}
                // Lightning only exists in the mobile apps: listed with its balance, not linked.
                href={coin.coinCode === 'lightning' ? undefined : coinHref(accounts, coin.coinCode)}
                leading={<CoinIcon coinCode={coin.coinCode} size={28} />}
                title={coin.coinName}
                subtitle={<Amount value={coin.formattedAmount} as="coin" size="sm" tone="muted" />}
                trailing={<Amount value={coin.formattedAmount} />}
                trailingSub={formatShare(shares[i] || 0, locale)} />
            ))}
          </List>
        ) : <SkeletonRows count={5} />}
      </Section>
      {layout === 'tablet' && <DeviceDetails wide />}
    </>
  );
};

// Phone home: the total and the accounts, no analysis.
const WalletHome = () => {
  const { fiat } = usePrototype();
  const chart = useChart();
  const device = useDevice();
  return (
    <>
      <PageHeader title="Wallet" actions={<HideAmountsButton />} />
      <Section title="Total balance">
        <div className={styles.chartBlock}>
          <div className={styles.figure}>
            <Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} size="hero" />
            <Performance value={chart?.chartPerformance.year.moneyWeightedReturn} range="year" />
          </div>
          <div className={styles.phoneChart}>
            <AreaChart points={chartPoints(chart, 'year')} height={72} />
          </div>
        </div>
      </Section>
      <Section title={device.name} action={<DeviceChip />}>
        <AccountRows />
      </Section>
    </>
  );
};

const Accounts = ({ layout }: { layout: TLayout }) => {
  const device = useDevice();
  return (
    <>
      <PageHeader
        title="Accounts"
        actions={layout === 'phone' && <><HideAmountsButton /><IconButton icon="plus" label="Add account" href="#/add-account" /></>} />
      {/* From tablet up the accounts pane and the device details already show the connection. */}
      <Section title={device.name} action={layout === 'phone' && <DeviceChip />}>
        <AccountRows />
      </Section>
      {layout === 'tablet' && <DeviceDetails wide />}
    </>
  );
};

type TAccountProps = { code: string; txId?: string; query: string; layout: TLayout };

const Account = ({ code, txId, query, layout }: TAccountProps) => {
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const visible = transactions?.filter(tx => matches(tx, query));
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  const listRef = useRef<HTMLDivElement>(null);
  const phone = layout === 'phone';

  // Panes scroll on their own (the page does not), so keep the selected row in view.
  useEffect(() => {
    if (!phone) {
      listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
    }
  }, [phone, txId, transactions]);

  // J/K step through the visible transactions; Esc closes the inspector (the sheet closes itself).
  useEffect(() => {
    if (phone || !visible) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === 'Escape' && txId && layout === 'desktop') {
        closeTransaction(code);
      } else if (event.key === 'j' || event.key === 'k') {
        const index = visible.findIndex(tx => tx.internalID === txId);
        const next = visible[event.key === 'j' ? index + 1 : Math.max(0, index - 1)];
        if (next) {
          window.location.replace(href.transaction(code, next.internalID));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (accounts && !account) {
    return <ComingSoon title="Account not found" />;
  }
  const actions = (
    <>
      <Button size={phone ? 'lg' : 'sm'} variant="secondary" icon="receive" href={href.receive(code)}>Receive</Button>
      <Button size={phone ? 'lg' : 'sm'} icon="send" href={href.send(code)}>Send</Button>
    </>
  );
  return (
    <>
      <PageHeader
        size="compact"
        title={account?.name || ' '}
        subtitle={account ? `${account.coinName} · ${account.coinUnit}` : undefined}
        back={phone ? href.portfolio : undefined}
        leading={!phone && account ? <CoinIcon coinCode={account.coinCode} size={32} /> : undefined}
        actions={phone ? <HideAmountsButton /> : actions} />
      <div className={styles.balance}>
        <Amount value={balance?.available} as="coin" size="xl" />
        <Amount value={balance?.available} tone="muted" />
        {balance?.hasIncoming && (
          <Badge tone="warning" icon="clock">Incoming <Amount value={balance.incoming} as="coin" size="sm" sign="+" /></Badge>
        )}
      </div>
      {phone && <div className={styles.phoneActions}>{actions}</div>}
      <Section
        title="Transactions"
        action={transactions && visible && (
          <Badge tone={query ? 'info' : 'neutral'}>
            {query ? `${visible.length} of ${transactions.length}` : String(transactions.length)}
          </Badge>
        )}>
        <div ref={listRef}>
          {!visible || !account ? <SkeletonRows count={6} /> : visible.length ? (
            <List className={styles.bleed}>
              {visible.map(tx => (
                <TxRow
                  key={tx.internalID}
                  tx={tx}
                  account={account}
                  leading="glyph"
                  // Phones are too narrow for a full date next to the Pending badge.
                  date={phone ? 'day' : 'full'}
                  primary="coin"
                  selected={tx.internalID === txId} />
              ))}
            </List>
          ) : (
            <Message tone="info" title="No matching transactions">
              Search looks at notes, addresses and transaction IDs.
            </Message>
          )}
        </div>
      </Section>
      {layout !== 'desktop' && (
        <Sheet open={!!(selectedTx && account)} onClose={() => closeTransaction(code)} title="Transaction" presentation="panel">
          {selectedTx && account && (
            <div className={styles.facts}>
              <TransactionDetails tx={selectedTx} account={account} dense={!phone} />
            </div>
          )}
        </Sheet>
      )}
    </>
  );
};

// What the top-bar search finds while no account is open: matches across all accounts.
const SearchResults = ({ query }: { query: string }) => {
  const accounts = useAccounts();
  const activity = useActivity(accounts);
  const results = activity?.filter(item => matches(item.tx, query));
  return (
    <>
      <PageHeader
        title="Search"
        subtitle={results ? `${results.length} ${results.length === 1 ? 'match' : 'matches'} across all accounts` : ' '} />
      <Section title={`Results for “${query}”`}>
        {!results ? <SkeletonRows count={5} /> : results.length ? (
          <List className={styles.bleed}>
            {results.map(({ account, tx }) => (
              <TxRow key={`${account.code}:${tx.internalID}`} tx={tx} account={account} leading="coin" showAccount date="full" primary="coin" />
            ))}
          </List>
        ) : (
          <Message tone="info" title="No matching transactions">
            Search looks at notes, addresses and transaction IDs.
          </Message>
        )}
      </Section>
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Shell

// The phone home is the "Wallet" screen, so its tab carries that name.
const phoneNav = (screen: TScreen) => navItems(screen, undefined, true)
  .map(item => (item.key === 'portfolio' ? { ...item, label: 'Wallet', icon: 'wallet' as const } : item));

export const DirectionD = ({ screen }: TDirectionProps) => {
  const layout = useLayout();
  const [search, setSearch] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  // Search lives in the top bar, which phones do not have.
  const query = layout === 'phone' ? '' : search.trim();
  const searching = query !== '' && screen.name !== 'account';
  const txId = screen.name === 'account' ? screen.txId : undefined;
  // Changes when the middle pane shows another screen; selecting a transaction does not count.
  const paneKey = (
    searching ? 'search' : screen.name === 'account' ? `account:${screen.code}` : screen.name === 'other' ? screen.path : screen.name
  );

  // Panes keep their scroll position while a transaction is selected, but not across screens.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [paneKey]);

  useEffect(() => {
    inspectorRef.current?.scrollTo({ top: 0 });
  }, [paneKey, txId]);

  const content = (
    <>
      {searching && <SearchResults query={query} />}
      {!searching && screen.name === 'portfolio' && (layout === 'phone' ? <WalletHome /> : <Portfolio layout={layout} />)}
      {!searching && screen.name === 'accounts' && <Accounts layout={layout} />}
      {screen.name === 'account' && <Account code={screen.code} txId={screen.txId} query={query} layout={layout} />}
      {!searching && screen.name === 'kit' && <KitPage />}
      {!searching && screen.name === 'other' && <ComingSoon title={screen.title} />}
    </>
  );

  if (layout === 'phone') {
    return (
      <div className={styles.phone}>
        <main className={styles.phoneMain}>{content}</main>
        <Navigation layout="tabbar" items={phoneNav(screen)} />
      </div>
    );
  }

  const inspector = layout === 'desktop' && (searching || screen.name === 'portfolio' || screen.name === 'accounts' || screen.name === 'account');
  return (
    <div className={styles.workspace}>
      <TopBar screen={screen} search={search} onSearch={setSearch} />
      <AccountsPane screen={screen} />
      <main ref={mainRef} className={[styles.pane, styles.main].join(' ')}>
        <div className={styles.content}>{content}</div>
      </main>
      {inspector && (
        <aside ref={inspectorRef} className={[styles.pane, styles.side, styles.inspector].join(' ')} aria-label="Details">
          {screen.name === 'account' ? <AccountInspector code={screen.code} txId={screen.txId} /> : <DeviceDetails />}
        </aside>
      )}
    </div>
  );
};
