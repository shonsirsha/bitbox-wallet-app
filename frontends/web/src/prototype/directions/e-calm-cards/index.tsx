// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction E "Calm cards" (round 1 pick, refined)
// Soft white cards on light grey, one row of four round actions under the balance, generous
// radius. Frame: B's dark sidebar with a compact device row (desktop) or icon rail (tablet),
// a D-style top bar with the total and Settings (no search), C's accounts list as one card.
// Phones keep their page headers and the floating tab bar.

import { ReactNode, useMemo, useState } from 'react';
import { useMediaQuery } from '@/hooks/mediaquery';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, DeviceStatus, GlyphIcon, IconButton, List, ListRow, Logo,
  Navigation, PageHeader, Section, SegmentedControl, Sheet, Skeleton, SkeletonRows, TChartPoint, TIconName, TextField,
  Toggle, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TRange, RANGE_OPTIONS, allocation, chartPoints, fiatAmount, groupAccounts,
  useAccounts, useActivity, useBalance, useBalances, useChart, useDevice, useSummary, useTransactions,
} from '../../data';
import { href } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow } from '../../patterns/tx-row';
import { HideAmountsButton, TNavKey, activeNav, closeTransaction, coinHref, navItems } from '../shared';
import type { TDirectionProps } from '../types';
import styles from './e.module.css';

// Sidebar menu: the account list below it replaces an Accounts item, Settings sits in the top bar.
// Lightning lives in the phone tab bar only; from tablet up it is reached via its asset card.
const SIDE_NAV: TNavKey[] = ['portfolio', 'market'];

const RANGE_LABEL: Record<TRange, string> = { week: 'past week', month: 'past month', year: 'past year', all: 'all time' };

// Localized share of the portfolio ("82.0%"); the share itself comes from allocation().
const formatShare = (share: number | undefined, locale: string) => (
  new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(share || 0)
);

type TPhoneHeaderProps = {
  title: string;
  subtitle?: string;
  // Parent screen for pushed screens (compact header with a back button).
  back?: string;
  // Screen actions shown after Hide amounts (e.g. Add account).
  actions?: ReactNode;
};

// Every phone screen gets a page header; from tablet up the top bar and page content take over.
const PhoneHeader = ({ title, subtitle, back, actions }: TPhoneHeaderProps) => (
  <div className={`${styles.phoneHeader} ${styles.onCanvas}`}>
    <PageHeader
      title={title}
      subtitle={subtitle}
      back={back}
      size={back ? 'compact' : 'large'}
      actions={<><HideAmountsButton />{actions}</>} />
  </div>
);

type TAction = { icon: TIconName; label: string; href: string };

type TActionRowProps = { actions: TAction[] };

// The single row of round actions directly under a balance card.
const ActionRow = ({ actions }: TActionRowProps) => (
  <div className={`${styles.actions} ${styles.onCanvas}`}>
    {actions.map(action => (
      <IconButton key={action.label} icon={action.icon} label={action.label} href={action.href} variant="filled" size="lg" caption />
    ))}
  </div>
);

const Portfolio = () => {
  const { locale, fiat } = usePrototype();
  const summary = useSummary();
  const chart = useChart();
  const accounts = useAccounts();
  const activity = useActivity(accounts);
  const [range, setRange] = useState<TRange>('year');
  const [scrub, setScrub] = useState<TChartPoint | null>(null);
  // Stable points, so scrubbing (a re-render per pointer move) does not rebuild the chart path.
  const points = useMemo(() => chartPoints(chart, range), [chart, range]);
  const performance = chart?.chartPerformance[range].moneyWeightedReturn;
  const coins = summary?.coinsTotalBalance;
  const shares = allocation(coins?.map(coin => coin.formattedAmount) || [], fiat);
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  return (
    <>
      <PhoneHeader title="Portfolio" />
      <div className={styles.portfolio}>
        <div className={styles.stack}>
          <Section
            title={scrub ? format.formatShortDate(new Date(scrub.time * 1000).toISOString(), locale) : 'Portfolio value'}
            action={<SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />}
            className={styles.heroCard}>
            <div className={styles.balance}>
              <div className={styles.balanceHead}>
                <Amount value={scrub?.label ? fiatAmount(scrub.label, fiat) : total} size="hero" />
                <span className={styles.meta}>
                  <Delta value={performance} />
                  <span>{RANGE_LABEL[range]}</span>
                </span>
              </div>
              <div className={styles.chart}>
                <AreaChart points={points} height={160} onScrub={setScrub} />
              </div>
            </div>
          </Section>
          <ActionRow actions={[
            { icon: 'send', label: 'Send', href: '#/accounts/select-receive' },
            { icon: 'receive', label: 'Receive', href: '#/accounts/select-receive' },
            { icon: 'buy', label: 'Buy', href: href.market },
            { icon: 'swap', label: 'Swap', href: '#/market/swap' },
          ]} />
          <Section variant="plain" title="Assets">
            <div className={styles.cardGrid}>
              {coins ? coins.map((coin, i) => (
                <Section key={coin.coinCode} className={styles.rowCard}>
                  <ListRow
                    href={coinHref(accounts, coin.coinCode)}
                    leading={<CoinIcon coinCode={coin.coinCode} size={40} />}
                    title={coin.coinName}
                    subtitle={<Amount value={coin.formattedAmount} as="coin" size="sm" tone="muted" />}
                    trailing={<Amount value={coin.formattedAmount} />}
                    trailingSub={formatShare(shares[i], locale)} />
                </Section>
              )) : <Section><SkeletonRows count={3} /></Section>}
            </div>
          </Section>
        </div>
        <div className={styles.aside}>
          <Section
            title="Recent activity"
            className={styles.listCard}
            action={<Button variant="ghost" size="sm" href={href.accounts}>See all</Button>}>
            {activity ? (
              <List>
                {activity.slice(0, 6).map(({ account, tx }) => (
                  <TxRow key={`${account.code}:${tx.internalID}`} tx={tx} account={account} leading="coin" showAccount primary="fiat" amounts="primary" />
                ))}
                {activity.length === 0 && <ListRow title="No activity yet" subtitle="Received and sent coins show up here." />}
              </List>
            ) : <SkeletonRows count={6} />}
          </Section>
        </div>
      </div>
    </>
  );
};

type TSort = 'value' | 'name';

const SORT_OPTIONS: { value: TSort; label: string }[] = [
  { value: 'value', label: 'Value' },
  { value: 'name', label: 'Name' },
];

type TAccountsListProps = {
  // sidebar: compact rows in the dark panel · page: the phone Accounts tab (and #/accounts/all)
  variant: 'sidebar' | 'page';
  selected?: string;
};

// The account list with search, sort/filter and Add account; the same list in the sidebar and on
// the phone Accounts page. Lightning is listed on the page only (it has no desktop navigation).
const AccountsList = ({ variant, selected }: TAccountsListProps) => {
  const { fiat } = usePrototype();
  const accounts = useAccounts();
  const balances = useBalances(accounts);
  const summary = useSummary();
  const chart = useChart();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<TSort>('value');
  const [hideEmpty, setHideEmpty] = useState(false);
  const sidebar = variant === 'sidebar';
  // The tablet sidebar is too narrow for both amounts: its rows show name and fiat value only.
  const wideSidebar = useMediaQuery('(min-width: 1200px)');
  const compactRows = sidebar && !wideSidebar;
  const iconSize = sidebar ? 28 : 40;
  const needle = query.trim().toLowerCase();
  const matches = (...values: string[]) => !needle || values.some(value => value.toLowerCase().includes(needle));
  const filtered = useMemo(() => {
    const flat = groupAccounts(accounts)?.flatMap(({ account, tokens }) => [account, ...tokens]) || [];
    const value = (code: string) => Number(balances?.[code]?.available.unformattedConversions?.[fiat as 'USD'] || 0);
    return flat
      .filter(account => matches(account.name, account.coinName, account.coinUnit))
      .filter(account => !hideEmpty || balances?.[account.code]?.hasAvailable)
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : value(b.code) - value(a.code)));
  }, [accounts, balances, fiat, needle, hideEmpty, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const lightning = summary?.coinsTotalBalance.find(coin => coin.coinCode === 'lightning')?.formattedAmount;
  const accountCount = accounts ? `${accounts.length} accounts` : '';
  const filtersActive = sort !== 'value' || hideEmpty;
  const list = !accounts ? <SkeletonRows count={5} /> : (
    <List>
      {!sidebar && !needle && (
        <ListRow
          href={href.portfolio}
          leading={<GlyphIcon icon="wallet" size={iconSize} />}
          title="All accounts"
          subtitle={accountCount}
          trailing={<Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} />}
          chevron />
      )}
      {filtered.map(account => (
        <ListRow
          key={account.code}
          href={href.account(account.code)}
          selected={account.code === selected}
          leading={<CoinIcon coinCode={account.coinCode} size={iconSize} />}
          title={account.name}
          subtitle={<Amount value={balances?.[account.code]?.available} as={compactRows ? 'fiat' : 'coin'} size="sm" tone="muted" />}
          trailing={compactRows ? undefined : <Amount value={balances?.[account.code]?.available} size={sidebar ? 'sm' : 'md'} />}
          chevron={!sidebar} />
      ))}
      {!sidebar && matches('Lightning') && (
        <ListRow
          href={href.lightning}
          leading={<CoinIcon coinCode="lightning" size={iconSize} />}
          title="Lightning"
          subtitle={<Amount value={lightning} as="coin" size="sm" tone="muted" />}
          trailing={<Amount value={lightning} />}
          chevron />
      )}
      {filtered.length === 0 && (sidebar || !matches('Lightning')) && (
        <ListRow title="No matching accounts" subtitle="Try another name or coin." />
      )}
    </List>
  );
  return (
    <div className={sidebar ? styles.sidebarAccounts : styles.pageAccounts}>
      <div className={styles.accountsTools}>
        <div className={styles.accountsSearch}>
          <TextField type="search" icon="search" value={query} onChange={setQuery} placeholder={sidebar ? 'Accounts' : 'Search accounts'} />
        </div>
        <IconButton
          icon="filter"
          label={showFilters ? 'Hide sort and filter' : 'Sort and filter'}
          size={sidebar ? 'sm' : 'md'}
          active={showFilters || filtersActive}
          onClick={() => setShowFilters(value => !value)} />
        <IconButton icon="plus" label="Add account" size={sidebar ? 'sm' : 'md'} href="#/add-account" />
      </div>
      {showFilters && (
        <div className={styles.accountsFilters}>
          <SegmentedControl label="Sort accounts" options={SORT_OPTIONS} value={sort} onChange={setSort} size="sm" full />
          <ListRow title="Hide empty accounts" trailing={<Toggle checked={hideEmpty} onChange={setHideEmpty} label="Hide empty accounts" />} />
        </div>
      )}
      {sidebar ? list : <Section className={styles.listCard}>{list}</Section>}
    </div>
  );
};

// Phones: the Accounts tab. From tablet up the same list lives in the sidebar; this route stays
// reachable (e.g. from "See all") with the page header.
const Accounts = () => (
  <div className={styles.accounts}>
    <PhoneHeader title="Accounts" />
    <div className={`${styles.wideHeader} ${styles.onCanvas}`}>
      <PageHeader title="Accounts" />
    </div>
    <AccountsList variant="page" />
  </div>
);

type TAccountProps = { code: string; txId?: string };

const Account = ({ code, txId }: TAccountProps) => {
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  if (accounts && !account) {
    return <div className={styles.onCanvas}><ComingSoon title="Account not found" /></div>;
  }
  return (
    <>
      <PhoneHeader
        title={account?.name || ' '}
        subtitle={account?.coinName}
        back={href.accounts} />
      <div className={styles.account}>
        <div className={`${styles.stack} ${styles.accountSide}`}>
          <Section className={`${styles.heroCard} ${styles.accountCard}`}>
            <div className={styles.accountBody}>
              <div className={styles.identity}>
                <ListRow
                  leading={account ? <CoinIcon coinCode={account.coinCode} size={48} /> : <Skeleton width={48} height={48} radius="pill" />}
                  title={account ? account.name : <Skeleton width={120} height={16} />}
                  subtitle={account?.coinName} />
              </div>
              <div className={styles.balanceHead}>
                <Amount value={balance?.available} as="coin" size="hero" />
                <span className={styles.meta}>
                  <Amount value={balance?.available} size="lg" tone="muted" />
                  {balance?.hasIncoming && (
                    <Badge tone="warning" icon="clock">Incoming <Amount value={balance.incoming} as="coin" size="sm" sign="+" /></Badge>
                  )}
                </span>
              </div>
            </div>
          </Section>
          <ActionRow actions={[
            { icon: 'send', label: 'Send', href: href.send(code) },
            { icon: 'receive', label: 'Receive', href: href.receive(code) },
            { icon: 'swap', label: 'Swap', href: '#/market/swap' },
            { icon: 'info', label: 'Info', href: `#/account/${encodeURIComponent(code)}/info` },
          ]} />
        </div>
        <Section title="Activity" className={styles.listCard}>
          {transactions && account ? (
            <List>
              {transactions.map(tx => (
                <TxRow key={tx.internalID} tx={tx} account={account} leading="coin" primary="coin" selected={tx.internalID === txId} />
              ))}
              {transactions.length === 0 && <ListRow title="No transactions yet" subtitle="Receive coins to get started." />}
            </List>
          ) : <SkeletonRows count={6} />}
        </Section>
      </div>
      <Sheet open={!!(selectedTx && account)} onClose={() => closeTransaction(code)} title="Transaction" presentation="panel">
        {selectedTx && account && <TransactionDetails tx={selectedTx} account={account} />}
      </Sheet>
    </>
  );
};

// D-style top bar, without search: portfolio total and change, then Hide amounts and Settings.
const TopBar = ({ screen }: { screen: TDirectionProps['screen'] }) => {
  const { fiat } = usePrototype();
  const chart = useChart();
  return (
    <header className={`${styles.topbar} ${styles.onCanvas}`}>
      <div className={styles.total}>
        <Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} size="lg" />
        <Delta value={chart?.chartPerformance.year.moneyWeightedReturn} label="1Y" />
      </div>
      <div className={styles.tools}>
        <HideAmountsButton />
        <IconButton icon="settings" label="Settings" href={href.settings} active={activeNav(screen) === 'settings'} />
      </div>
    </header>
  );
};

export const DirectionE = ({ screen }: TDirectionProps) => {
  const device = useDevice();
  const deviceState = device.connected ? 'connected' : 'disconnected';
  const selectedAccount = screen.name === 'account' ? screen.code : undefined;
  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${styles.dark}`}>
        <Navigation
          layout="sidebar"
          items={navItems(screen, SIDE_NAV)}
          header={(
            <div className={styles.sidebarHeader}>
              <a href={href.portfolio} aria-label="Portfolio"><Logo height={19} onDark /></a>
              <DeviceStatus
                name={device.name}
                state={deviceState}
                detail={device.firmware ? `v${device.firmware}` : undefined}
                onDark />
            </div>
          )}>
          <AccountsList variant="sidebar" selected={selectedAccount} />
        </Navigation>
      </aside>
      <div className={styles.column}>
        <TopBar screen={screen} />
        <main className={styles.main}>
          <div className={styles.content}>
            {screen.name === 'portfolio' && <Portfolio />}
            {screen.name === 'accounts' && <Accounts />}
            {screen.name === 'account' && <Account code={screen.code} txId={screen.txId} />}
            {screen.name === 'kit' && <KitPage />}
            {screen.name === 'other' && <div className={styles.onCanvas}><ComingSoon title={screen.title} /></div>}
          </div>
        </main>
      </div>
      <div className={styles.tabbar}>
        <Navigation layout="tabbar" floating items={navItems(screen, undefined, true)} />
      </div>
    </div>
  );
};
