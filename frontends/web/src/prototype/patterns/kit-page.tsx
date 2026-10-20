// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): every kit component in the variants the Redesigned screens use, filled
// with the demo wallet. This page is the whole design vocabulary: screens may only use what is shown here.

import { CSSProperties, useMemo, useState } from 'react';
import {
  Amount, AreaChart, Badge, Button, Chip, CoinIcon, Delta, DeviceStatus, GlyphIcon, Icon, IconButton, List,
  ListRow, Logo, Message, Navigation, PageHeader, Popover, SearchField, Section, SegmentedControl, Sheet, Skeleton,
  SkeletonRows, TIconName, TNavItem, format,
} from '../kit';
import { PrototypeContext, usePrototype } from '../context';
import {
  chartPoints, fiatAmount, orderAccounts, RANGE_OPTIONS, TRange, useAccounts, useActivity, useBalances, useChart, useDevice,
} from '../data';
import { TransactionDetails } from './transaction-details';
import { TxRow, txSign } from './tx-row';
import styles from './kit-page.module.css';

const KIT = '#/prototype/kit';

const ICONS: TIconName[] = [
  'portfolio', 'accounts', 'lightning', 'marketplace', 'settings', 'send', 'receive', 'self', 'swap', 'buy', 'plus',
  'back', 'chevron', 'close', 'search', 'filter', 'eye', 'eyeOff', 'copy', 'external', 'note', 'check', 'info',
  'failed', 'clock', 'device', 'wallet', 'arrowUp', 'arrowDown',
];

const SIDEBAR_NAV: TNavItem[] = [
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio', href: KIT, active: true },
  { key: 'market', label: 'Marketplace', icon: 'marketplace', href: KIT },
];

const TAB_NAV: TNavItem[] = [
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio', href: KIT, active: true },
  { key: 'accounts', label: 'Accounts', icon: 'accounts', href: KIT },
  { key: 'lightning', label: 'Lightning', icon: 'lightning', href: KIT },
  { key: 'market', label: 'Market', icon: 'marketplace', href: KIT },
  { key: 'settings', label: 'Settings', icon: 'settings', href: KIT },
];

const SORT_OPTIONS: { value: 'type' | 'value' | 'name'; label: string }[] = [
  { value: 'type', label: 'Type' },
  { value: 'value', label: 'Value' },
  { value: 'name', label: 'Name' },
];

// The dark navigation panel's tokens (the sidebar keeps them in both themes).
const DARK_PANEL = {
  '--k-nav-bg': '#1D1D1B',
  '--k-nav-text': '#999999',
  '--k-nav-text-active': '#F5F5F5',
  '--k-nav-active-bg': 'rgba(255, 255, 255, .08)',
  '--k-nav-border': 'transparent',
  '--k-nav-gap': '8px',
  '--k-text': '#F5F5F5',
  '--k-text-2': '#999999',
  '--k-surface-2': '#333333',
  background: '#1D1D1B',
} as CSSProperties;

export const KitPage = () => {
  const prototype = usePrototype();
  const { fiat, locale } = prototype;
  const chart = useChart();
  const accounts = useAccounts();
  const balances = useBalances(accounts);
  const activity = useActivity(accounts);
  const device = useDevice();
  const [range, setRange] = useState<TRange>('year');
  const [sort, setSort] = useState<'type' | 'value' | 'name'>('type');
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['btc']);
  const [search, setSearch] = useState('');
  const [popover, setPopover] = useState(false);
  const [sheet, setSheet] = useState(false);

  const points = useMemo(() => chartPoints(chart, range), [chart, range]);
  const total = chart?.formattedChartTotal ? fiatAmount(chart.formattedChartTotal, fiat) : undefined;
  const savings = accounts?.[0];
  const balance = savings ? balances?.[savings.code] : undefined;
  const savingsActivity = activity?.filter(item => item.account.code === savings?.code);
  const pending = savingsActivity?.find(item => item.tx.status === 'pending');
  const received = savingsActivity?.find(item => item.tx.type === 'receive' && item.tx.status === 'complete');
  const recent = activity?.find(item => item.tx.status === 'complete');
  const coins = useMemo(() => {
    const list: { code: string; name: string; count: number }[] = [];
    orderAccounts(accounts)?.forEach(account => {
      const coin = list.find(item => item.code === account.coinCode);
      if (coin) {
        coin.count++;
      } else {
        list.push({ code: account.coinCode, name: account.coinName, count: 1 });
      }
    });
    return list;
  }, [accounts]);
  const toggleCoin = (code: string) => setSelectedCoins(current => (
    current.includes(code) ? current.filter(item => item !== code) : [...current, code]
  ));
  const sortControl = <SegmentedControl label="Sort accounts" options={SORT_OPTIONS} value={sort} onChange={setSort} full />;
  const chips = (
    <div className={styles.chips}>
      <Chip selected={selectedCoins.length === 0} onClick={() => setSelectedCoins([])} leading={<Icon name="accounts" size={18} />}>All coins</Chip>
      {coins.map(coin => (
        <Chip key={coin.code} selected={selectedCoins.includes(coin.code)} onClick={() => toggleCoin(coin.code)} leading={<CoinIcon coinCode={coin.code} size={20} />} count={coin.count}>
          {coin.name}
        </Chip>
      ))}
    </div>
  );
  const hideButton = <IconButton icon="eye" label="Hide amounts" />;

  return (
    <div className={styles.page}>
      <PageHeader title="Component kit" />

      <Section title="Logo">
        <span className={styles.darkTile} style={DARK_PANEL}><Logo height={22} /></span>
      </Section>

      <Section title="Button">
        <div className={styles.row}>
          <Button variant="primary" onClick={() => {}}>Apply</Button>
          <Button variant="ghost" onClick={() => {}}>Reset</Button>
          <Button variant="ghost" size="sm" href={KIT}>See all</Button>
          <Button variant="secondary" icon="external" href={KIT}>View in block explorer</Button>
        </div>
      </Section>

      <Section title="IconButton">
        <div className={styles.row}>
          {hideButton}
          <IconButton icon="settings" label="Settings" />
          <IconButton icon="filter" label="Sort and filter" />
          <IconButton icon="filter" label="Sort and filter, active" active />
          <IconButton icon="plus" label="Add account" size="sm" />
          <IconButton icon="copy" label="Copy" size="sm" />
          <IconButton icon="note" label="Edit note" size="sm" />
          <IconButton icon="close" label="Close" variant="filled" size="sm" />
          <span className={styles.actionRow}>
            <IconButton icon="send" label="Send" variant="filled" size="lg" caption />
            <IconButton icon="receive" label="Receive" variant="filled" size="lg" caption />
            <IconButton icon="buy" label="Buy" variant="filled" size="lg" caption />
            <IconButton icon="swap" label="Swap" variant="filled" size="lg" caption />
          </span>
        </div>
      </Section>

      <Section title="Amount and Delta">
        <div className={styles.stack}>
          <Amount value={total} size="hero" animated />
          <div className={styles.amounts}>
            <Amount value={balance?.available} as="coin" size="hero" animated />
            <Amount value={balance?.available} size="lg" tone="muted" animated />
          </div>
          <div className={styles.row}>
            {received && (
              <div className={styles.amounts}>
                <Amount value={received.tx.amount} as="coin" size="xl" sign={txSign(received.tx)} />
                <Amount value={received.tx.amount} tone="muted" sign={txSign(received.tx)} />
              </div>
            )}
            <div className={styles.amounts}>
              <Amount value={balance?.available} />
              <Amount value={balance?.available} as="coin" size="sm" tone="muted" />
            </div>
            <PrototypeContext.Provider value={{ ...prototype, hideAmounts: true }}>
              <Amount value={total} size="lg" />
            </PrototypeContext.Provider>
            <Amount value={undefined} size="lg" />
          </div>
          <div className={styles.row}>
            <Delta value={chart?.chartPerformance[range].moneyWeightedReturn} />
            <Delta value={-0.0312} />
          </div>
        </div>
      </Section>

      <Section title="Badge">
        <div className={styles.row}>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="warning" icon="clock">1 of 6 confirmations</Badge>
          <Badge tone="success" icon="check">Confirmed</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="warning" icon="clock">Incoming <Amount value={balance?.incoming} as="coin" size="sm" sign="+" /></Badge>
        </div>
      </Section>

      <Section title="ListRow and coin icons">
        <div className={styles.stack}>
          <List>
            <ListRow
              href={KIT}
              leading={<GlyphIcon icon="wallet" size={40} />}
              title="All accounts"
              subtitle={accounts ? `${accounts.length} accounts` : ''}
              trailing={<Amount value={total} />}
              chevron />
            {savings && (
              <ListRow
                href={KIT}
                leading={<CoinIcon coinCode={savings.coinCode} size={40} />}
                title={savings.name}
                subtitle={<Amount value={balance?.available} as="coin" size="sm" tone="muted" />}
                trailing={<Amount value={balance?.available} />}
                chevron />
            )}
          </List>
          <div className={styles.table}>
            <List>
              <ListRow header title="Account" cells={['Balance']} trailing="Value" chevron />
              {savings && (
                <ListRow
                  href={KIT}
                  leading={<CoinIcon coinCode={savings.coinCode} size={40} />}
                  title={savings.name}
                  subtitle={savings.coinName}
                  cells={[<Amount value={balance?.available} as="coin" />]}
                  trailing={<Amount value={balance?.available} />}
                  chevron />
              )}
            </List>
          </div>
          <List>
            {pending && <TxRow tx={pending.tx} account={pending.account} primary="coin" link={KIT} />}
            {received && <TxRow tx={received.tx} account={received.account} primary="coin" selected link={KIT} />}
            {recent && <TxRow tx={recent.tx} account={recent.account} showAccount primary="fiat" amounts="primary" link={KIT} />}
          </List>
          <List>
            {received && <ListRow title="Date" trailing={format.formatDateTime(received.tx.time, locale)} />}
            {received && <ListRow title="Value when received" trailing={<Amount value={received.tx.amountAtTime} size="sm" />} />}
            <ListRow title="No matching transactions" subtitle="Try a note, an address, an amount or a date." />
          </List>
          <div className={styles.row}>
            {['btc', 'eth', 'eth-erc20-usdc', 'ltc', 'lightning'].map(code => <CoinIcon key={code} coinCode={code} size={36} />)}
            {(['receive', 'send', 'self', 'pending', 'failed'] as const).map(badge => <CoinIcon key={badge} coinCode="btc" size={36} badge={badge} />)}
          </div>
        </div>
      </Section>

      <Section title="SegmentedControl, SearchField and Chip">
        <div className={styles.stack}>
          <div className={styles.row}>
            <SegmentedControl label="Chart range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
            <span className={styles.field}>{sortControl}</span>
          </div>
          <div className={styles.row}>
            <SearchField value={search} onChange={setSearch} placeholder="Search accounts" />
            <span className={styles.field}><SearchField value={search} onChange={setSearch} placeholder="Accounts" variant="field" /></span>
          </div>
          {chips}
          <div className={styles.chips}>
            <Chip removable onClick={() => {}} leading={<CoinIcon coinCode="btc" size={20} />}>Bitcoin</Chip>
          </div>
        </div>
      </Section>

      <Section title="Popover and Sheet">
        <div className={styles.row}>
          <Popover
            open={popover}
            onClose={() => setPopover(false)}
            label="Sort and filter"
            trigger={<IconButton icon="filter" label="Sort and filter" active={popover} onClick={() => setPopover(value => !value)} />}>
            <div className={styles.filters}>
              <Section variant="plain" title="Sort by">{sortControl}</Section>
              <Section variant="plain" title="Coins">{chips}</Section>
            </div>
          </Popover>
          <Button onClick={() => setSheet(true)}>Open transaction details</Button>
        </div>
      </Section>

      <Section title="Message">
        <Message title="Hey there">Not available yet. This prototype only covers Portfolio, Accounts, individual account screens and tx details.</Message>
      </Section>

      <Section title="DeviceStatus">
        <div className={styles.row}>
          <span className={styles.darkTile} style={DARK_PANEL}>
            <DeviceStatus name={device.name} state="connected" detail={device.firmware ? `v${device.firmware}` : undefined} onDark />
          </span>
          <span className={styles.darkTile} style={DARK_PANEL}><DeviceStatus name={device.name} state="disconnected" onDark /></span>
        </div>
      </Section>

      <Section title="AreaChart">
        <AreaChart points={points} height={140} />
      </Section>

      <Section title="Navigation">
        <div className={styles.navPreviews}>
          <div className={styles.navFrame} style={DARK_PANEL}>
            <Navigation layout="sidebar" items={SIDEBAR_NAV} header={<Logo height={18} />} />
          </div>
          <div className={`${styles.navFrame} ${styles.navFrameWide}`}>
            <Navigation layout="tabbar" items={TAB_NAV} />
          </div>
        </div>
      </Section>

      <Section title="PageHeader">
        <div className={styles.stack}>
          <PageHeader title="Portfolio" actions={hideButton} />
          <PageHeader title={savings?.name || 'Savings'} subtitle={savings?.coinName} back={KIT} size="compact" actions={hideButton} />
        </div>
      </Section>

      <Section title="Section" variant="plain">
        <div className={styles.sections}>
          <Section title="Recent activity" action={<Button variant="ghost" size="sm" href={KIT}>See all</Button>}>
            <List>
              {recent && <TxRow tx={recent.tx} account={recent.account} showAccount primary="fiat" amounts="primary" link={KIT} />}
            </List>
          </Section>
          <Section variant="plain" title="Sort by">{sortControl}</Section>
        </div>
      </Section>

      <Section title="Skeleton">
        <div className={styles.stack}>
          <div className={styles.row}>
            <Skeleton width={48} height={48} radius="pill" />
            <Skeleton width={120} height={16} />
          </div>
          <SkeletonRows count={2} />
        </div>
      </Section>

      <Section title="Icon">
        <div className={styles.icons}>
          {ICONS.map(name => <span key={name} className={styles.iconCell} title={name}><Icon name={name} size={22} /><span>{name}</span></span>)}
        </div>
      </Section>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Transaction">
        {received && <TransactionDetails tx={received.tx} account={received.account} />}
      </Sheet>
    </div>
  );
};
