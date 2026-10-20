// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway) · Direction E "Calm cards" (round 1 pick, refined)
// Soft white cards on light grey, one row of four round actions under the balance, generous
// radius. Frame: B's dark sidebar with a compact device row (desktop) or icon rail (tablet),
// a D-style top bar with the total and Settings (no search), C's accounts list as one card.
// Phones keep their page headers and the floating tab bar.

import { ReactNode, useEffect, useMemo, useState } from 'react';
import type { TTransaction } from '@/api/account';
import { useMediaQuery } from '@/hooks/mediaquery';
import {
  Amount, AreaChart, Badge, Button, Chip, CoinIcon, Delta, DeviceStatus, GlyphIcon, Icon, IconButton, List, ListRow, Logo,
  Navigation, PageHeader, Popover, Section, SearchField, SegmentedControl, Sheet, Skeleton, SkeletonRows, TChartPoint,
  TIconName, format,
} from '../../kit';
import { usePrototype } from '../../context';
import {
  TRange, RANGE_OPTIONS, allocation, chartPoints, fiatAmount, orderAccounts,
  useAccounts, useActivity, useBalance, useBalances, useChart, useDevice, useSummary, useTransactions,
} from '../../data';
import { href } from '../../routing';
import { ComingSoon } from '../../patterns/coming-soon';
import { KitPage } from '../../patterns/kit-page';
import { TransactionDetails } from '../../patterns/transaction-details';
import { TxRow, txAction } from '../../patterns/tx-row';
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

// Always shown within this distance of the top; smaller scroll steps are ignored (jitter).
const HEADER_REVEAL = 72;
const SCROLL_SLOP = 8;

// Like most mobile navigation bars: hidden while scrolling down, back on any scroll up.
const useHeaderHidden = () => {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Clamped, so rubber-band overscroll at either end is not taken as a direction change.
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const y = Math.min(Math.max(window.scrollY, 0), max);
      if (y < HEADER_REVEAL) {
        setHidden(false);
        last = y;
        return;
      }
      if (Math.abs(y - last) < SCROLL_SLOP) {
        return;
      }
      setHidden(y > last);
      last = y;
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return hidden;
};

// Every phone screen gets a page header; from tablet up the top bar and page content take over.
const PhoneHeader = ({ title, subtitle, back, actions }: TPhoneHeaderProps) => {
  const hidden = useHeaderHidden();
  return (
    <div className={`${styles.phoneHeader} ${styles.onCanvas} ${hidden ? styles.phoneHeaderHidden : ''}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        back={back}
        size={back ? 'compact' : 'large'}
        actions={<><HideAmountsButton />{actions}</>} />
    </div>
  );
};

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
  // Lightning is not listed under Assets; the shares stay those of the whole portfolio.
  const assets = coins
    ?.map((coin, i) => ({ coin, share: shares[i] }))
    .filter(({ coin }) => coin.coinCode !== 'lightning');
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  return (
    <>
      <PhoneHeader title="Portfolio" />
      <div className={styles.portfolio}>
        <div className={styles.stack}>
          <Section
            title={scrub ? format.formatShortDate(new Date(scrub.time * 1000).toISOString(), locale) : 'Portfolio value'}
            action={<SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} />}
            className={styles.heroCard}>
            <div className={styles.balance}>
              <div className={styles.balanceHead}>
                <Amount value={scrub?.label ? fiatAmount(scrub.label, fiat) : total} size="hero" animated />
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
              {assets ? assets.map(({ coin, share }) => (
                <Section key={coin.coinCode} className={styles.rowCard}>
                  <ListRow
                    href={coinHref(accounts, coin.coinCode)}
                    leading={<CoinIcon coinCode={coin.coinCode} size={40} />}
                    title={coin.coinName}
                    subtitle={<Amount value={coin.formattedAmount} as="coin" size="sm" tone="muted" />}
                    trailing={<Amount value={coin.formattedAmount} />}
                    trailingSub={formatShare(share, locale)} />
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
                  <TxRow key={`${account.code}:${tx.internalID}`} tx={tx} account={account} showAccount primary="fiat" amounts="primary" />
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

// type: grouped by coin type (Bitcoin, Ethereum, Litecoin, ERC20 tokens), the default.
type TSort = 'type' | 'value' | 'name';

const SORT_OPTIONS: { value: TSort; label: string }[] = [
  { value: 'type', label: 'Type' },
  { value: 'value', label: 'Value' },
  { value: 'name', label: 'Name' },
];

type TCoinType = { code: string; name: string; count: number };

type TFiltersProps = {
  sort: TSort;
  onSort: (sort: TSort) => void;
  // Shown at the top right of the panel (Reset in the popover).
  action?: ReactNode;
  coinTypes: TCoinType[];
  selectedCoins: string[];
  onToggleCoin: (code: string) => void;
  onAllCoins: () => void;
};

// Sort by type, value or name, filter by coin: the same controls in the popover and the sheet.
const AccountFilters = ({ sort, onSort, action, coinTypes, selectedCoins, onToggleCoin, onAllCoins }: TFiltersProps) => (
  <div className={styles.filters}>
    <Section variant="plain" title="Sort by" action={action}>
      <SegmentedControl label="Sort accounts" options={SORT_OPTIONS} value={sort} onChange={onSort} full />
    </Section>
    <Section variant="plain" title="Coins">
      <div className={styles.chips}>
        <Chip selected={selectedCoins.length === 0} onClick={onAllCoins} leading={<Icon name="accounts" size={18} />}>All coins</Chip>
        {coinTypes.map(coin => (
          <Chip
            key={coin.code}
            selected={selectedCoins.includes(coin.code)}
            onClick={() => onToggleCoin(coin.code)}
            leading={<CoinIcon coinCode={coin.code} size={20} />}
            count={coin.count}>
            {coin.name}
          </Chip>
        ))}
      </div>
    </Section>
  </div>
);

type TAccountsListProps = {
  // sidebar: compact rows in the dark panel. page: the Accounts tab on phones, a table on desktop.
  variant: 'sidebar' | 'page';
  selected?: string;
  // Page: the coin to filter by when it opens (an asset held in several accounts).
  coin?: string;
};

// The account list with search, sort and coin filter, and Add account; the same list in the
// sidebar and on the Accounts page. Lightning is listed on phones only (it has no tablet or
// desktop navigation). Sort and filter open in a popover, or a bottom sheet on phones.
const AccountsList = ({ variant, selected, coin }: TAccountsListProps) => {
  const { fiat } = usePrototype();
  const accounts = useAccounts();
  const balances = useBalances(accounts);
  const summary = useSummary();
  const chart = useChart();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<TSort>('type');
  const [selectedCoins, setSelectedCoins] = useState<string[]>(coin ? [coin] : []);
  useEffect(() => {
    setSelectedCoins(coin ? [coin] : []);
  }, [coin]);
  const phone = useMediaQuery('(max-width: 768px)');
  const sidebar = variant === 'sidebar';
  const desktop = useMediaQuery('(min-width: 1200px)');
  // The tablet sidebar is too narrow for both amounts: its rows show name and fiat value only.
  const compactRows = sidebar && !desktop;
  // The desktop page is a table: coin, balance and value each get their own column.
  const columns = !sidebar && desktop;
  const iconSize = sidebar ? 28 : 40;
  const needle = query.trim().toLowerCase();
  const matches = (...values: string[]) => !needle || values.some(value => value.toLowerCase().includes(needle));
  const ordered = useMemo(() => orderAccounts(accounts) || [], [accounts]);
  const coinTypes = useMemo(() => {
    const types: TCoinType[] = [];
    ordered.forEach(account => {
      const type = types.find(candidate => candidate.code === account.coinCode);
      if (type) {
        type.count++;
      } else {
        types.push({ code: account.coinCode, name: account.coinName, count: 1 });
      }
    });
    return types;
  }, [ordered]);
  const filtered = useMemo(() => {
    const value = (code: string) => Number(balances?.[code]?.available.unformattedConversions?.[fiat as 'USD'] || 0);
    const list = ordered
      .filter(account => matches(account.name, account.coinName, account.coinUnit))
      .filter(account => selectedCoins.length === 0 || selectedCoins.includes(account.coinCode));
    if (sort === 'value') {
      return list.sort((a, b) => value(b.code) - value(a.code));
    }
    return sort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [ordered, balances, fiat, needle, selectedCoins, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const lightning = summary?.coinsTotalBalance.find(coin => coin.coinCode === 'lightning')?.formattedAmount;
  const accountCount = accounts ? `${accounts.length} accounts` : '';
  const filtersActive = sort !== 'type' || selectedCoins.length > 0;
  const showLightning = !sidebar && phone && matches('Lightning') && selectedCoins.length === 0;
  const resetFilters = () => {
    setSort('type');
    setSelectedCoins([]);
  };
  const toggleCoin = (code: string) => setSelectedCoins(current => (
    current.includes(code) ? current.filter(candidate => candidate !== code) : [...current, code]
  ));
  const filters = (withReset: boolean) => (
    <AccountFilters
      sort={sort}
      onSort={setSort}
      action={withReset ? <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!filtersActive}>Reset</Button> : undefined}
      coinTypes={coinTypes}
      selectedCoins={selectedCoins}
      onToggleCoin={toggleCoin}
      onAllCoins={() => setSelectedCoins([])} />
  );
  const resultCount = filtered.length + (showLightning ? 1 : 0);
  const filterButton = (
    <IconButton
      icon="filter"
      label="Sort and filter"
      size={sidebar ? 'sm' : 'md'}
      active={filtersOpen || filtersActive}
      onClick={() => setFiltersOpen(open => !open)} />
  );
  const tools = (
    <div className={styles.accountsTools}>
      <div className={styles.accountsSearch}>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={sidebar ? 'Accounts' : 'Search accounts'}
          variant="field" />
      </div>
      <div className={styles.accountsActions}>
        {filterButton}
        <IconButton icon="plus" label="Add account" size={sidebar ? 'sm' : 'md'} href="#/add-account" />
      </div>
    </div>
  );
  const list = !accounts ? <SkeletonRows count={5} /> : (
    <List>
      {columns && <ListRow header title="Account" cells={['Balance']} trailing="Value" chevron />}
      {!sidebar && !needle && selectedCoins.length === 0 && (
        <ListRow
          href={href.portfolio}
          leading={<GlyphIcon icon="wallet" size={iconSize} />}
          title="All accounts"
          subtitle={accountCount}
          cells={columns ? [null] : undefined}
          trailing={<Amount value={chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined} />}
          chevron />
      )}
      {filtered.map(account => {
        const available = balances?.[account.code]?.available;
        return (
          <ListRow
            key={account.code}
            href={href.account(account.code)}
            selected={account.code === selected}
            leading={<CoinIcon coinCode={account.coinCode} size={iconSize} />}
            title={account.name}
            subtitle={columns ? account.coinName : <Amount value={available} as={compactRows ? 'fiat' : 'coin'} size="sm" tone="muted" animated />}
            cells={columns ? [<Amount value={available} as="coin" animated />] : undefined}
            trailing={compactRows ? undefined : <Amount value={available} size={sidebar ? 'sm' : 'md'} animated />}
            chevron={!sidebar} />
        );
      })}
      {showLightning && (
        <ListRow
          href={href.lightning}
          leading={<CoinIcon coinCode="lightning" size={iconSize} />}
          title="Lightning"
          subtitle={<Amount value={lightning} as="coin" size="sm" tone="muted" />}
          trailing={<Amount value={lightning} />}
          chevron />
      )}
      {resultCount === 0 && <ListRow title="No matching accounts" subtitle="Try another name or coin." />}
    </List>
  );
  return (
    <div className={sidebar ? styles.sidebarAccounts : styles.pageAccounts}>
      {phone ? tools : (
        <Popover open={filtersOpen} onClose={() => setFiltersOpen(false)} label="Sort and filter accounts" trigger={tools} block>
          {filters(true)}
        </Popover>
      )}
      {sidebar ? list : <Section className={styles.listCard}>{list}</Section>}
      {phone && (
        <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)}>
          <div className={styles.sheetFilters}>
            {filters(false)}
            <div className={styles.sheetActions}>
              <Button variant="primary" full onClick={() => setFiltersOpen(false)}>Apply</Button>
              <Button variant="ghost" full onClick={resetFilters} disabled={!filtersActive}>Reset</Button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};

// Phones: the Accounts tab. From tablet up the same list lives in the sidebar; this route stays
// reachable (e.g. from "See all", or an asset held in several accounts) with the page header.
const Accounts = ({ coin }: { coin?: string }) => (
  <div className={styles.accounts}>
    <PhoneHeader title="Accounts" />
    <div className={`${styles.wideHeader} ${styles.onCanvas}`}>
      <PageHeader title="Accounts" />
    </div>
    <AccountsList variant="page" coin={coin} />
  </div>
);

type TAccountProps = { code: string; txId?: string };

// Matches what a row shows: title or note, address, transaction ID, amounts and date.
const matchesTransaction = (tx: TTransaction, needle: string, locale: string) => [
  txAction(tx),
  tx.note,
  ...tx.addresses,
  tx.txID,
  tx.amount.amount,
  ...Object.values(tx.amount.conversions || {}),
  format.formatDayLabel(tx.time, locale, 'short'),
  format.formatShortDate(tx.time, locale),
].some(value => value && value.toLowerCase().includes(needle));

const Account = ({ code, txId }: TAccountProps) => {
  const { locale } = usePrototype();
  const accounts = useAccounts();
  const account = accounts?.find(candidate => candidate.code === code);
  const balance = useBalance(code);
  const transactions = useTransactions(code);
  const selectedTx = transactions?.find(tx => tx.internalID === txId);
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visibleTransactions = needle ? transactions?.filter(tx => matchesTransaction(tx, needle, locale)) : transactions;
  // A new account starts with an empty search.
  useEffect(() => setQuery(''), [code]);
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
                <Amount value={balance?.available} as="coin" size="hero" animated />
                <span className={styles.meta}>
                  <Amount value={balance?.available} size="lg" tone="muted" animated />
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
        <Section
          title="Activity"
          className={`${styles.listCard} ${styles.activity}`}
          action={(
            // The header sits on the canvas: the open field takes the card colour.
            <div className={styles.onCanvas}>
              <SearchField value={query} onChange={setQuery} placeholder="Search activity" />
            </div>
          )}>
          {visibleTransactions && account ? (
            <List>
              {visibleTransactions.map(tx => (
                <TxRow key={tx.internalID} tx={tx} account={account} primary="coin" selected={tx.internalID === txId} />
              ))}
              {transactions?.length === 0 && <ListRow title="No transactions yet" subtitle="Receive coins to get started." />}
              {!!transactions?.length && visibleTransactions.length === 0 && (
                <ListRow title="No matching transactions" subtitle="Try a note, an address, an amount or a date." />
              )}
            </List>
          ) : <SkeletonRows count={6} />}
        </Section>
      </div>
      <Sheet open={!!(selectedTx && account)} onClose={() => closeTransaction(code)} title="Transaction">
        {selectedTx && account && <TransactionDetails tx={selectedTx} account={account} />}
      </Sheet>
    </>
  );
};

// Top bar (tablet and desktop): Hide amounts and Settings.
const TopBar = ({ screen }: { screen: TDirectionProps['screen'] }) => (
  <header className={`${styles.topbar} ${styles.onCanvas}`}>
    <div className={styles.tools}>
      <HideAmountsButton />
      <IconButton icon="settings" label="Settings" href={href.settings} active={activeNav(screen) === 'settings'} />
    </div>
  </header>
);

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
              <a href={href.portfolio} aria-label="Portfolio"><Logo height={19} /></a>
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
            {screen.name === 'accounts' && <Accounts coin={screen.coin} />}
            {screen.name === 'account' && <Account code={screen.code} txId={screen.txId} />}
            {screen.name === 'kit' && <KitPage />}
            {screen.name === 'other' && <div className={styles.onCanvas}><ComingSoon title={screen.title} /></div>}
          </div>
        </main>
      </div>
      <div className={styles.tabbar}>
        <Navigation layout="tabbar" items={navItems(screen, undefined, true)} />
      </div>
    </div>
  );
};
