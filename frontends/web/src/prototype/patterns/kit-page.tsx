// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): every kit component in the variants the Calm cards screens use.
// This page is the whole design vocabulary: screens may only use what is shown here.

import { CSSProperties, useState } from 'react';
import type { TAmountWithConversions } from '@/api/account';
import {
  Amount, AreaChart, Badge, Button, Chip, CoinIcon, Delta, DeviceStatus, GlyphIcon, Icon, IconButton, List,
  ListRow, Logo, Message, Navigation, PageHeader, Popover, Section, SegmentedControl, Sheet, Skeleton, SkeletonRows,
  TIconName, TextField, Toggle,
} from '../kit';
import { chartPoints, RANGE_OPTIONS, TRange, useChart } from '../data';
import styles from './kit-page.module.css';

const SAMPLE: TAmountWithConversions = {
  amount: '0.34947407',
  unit: 'BTC',
  estimated: false,
  conversions: { USD: '36\'432.67', EUR: '31\'368.53', CHF: '29\'036.84', GBP: '27\'251.64', BTC: '0.34947407', sat: '34947407' },
};

const ICONS: TIconName[] = [
  'portfolio', 'accounts', 'lightning', 'marketplace', 'settings', 'send', 'receive', 'self', 'swap', 'buy', 'plus',
  'back', 'chevron', 'close', 'search', 'filter', 'eye', 'eyeOff', 'copy', 'external', 'note', 'check', 'info',
  'failed', 'clock', 'device', 'wallet', 'arrowUp', 'arrowDown',
];

const NAV = [
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio' as const, href: '#/prototype/kit', active: true },
  { key: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '#/prototype/kit' },
  { key: 'lightning', label: 'Lightning', icon: 'lightning' as const, href: '#/prototype/kit' },
  { key: 'market', label: 'Market', icon: 'marketplace' as const, href: '#/prototype/kit' },
  { key: 'settings', label: 'Settings', icon: 'settings' as const, href: '#/prototype/kit' },
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
  const chart = useChart();
  const [range, setRange] = useState<TRange>('year');
  const [sort, setSort] = useState<'value' | 'name'>('value');
  const [coin, setCoin] = useState(true);
  const [toggle, setToggle] = useState(true);
  const [text, setText] = useState('');
  const [popover, setPopover] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <div className={styles.page}>
      <PageHeader title="Component kit" />

      <Section title="Logo">
        <div className={styles.row}>
          <Logo height={22} />
          <span className={styles.darkTile} style={DARK_PANEL}><Logo height={22} onDark /></span>
        </div>
      </Section>

      <Section title="Button">
        <div className={styles.row}>
          <Button variant="primary" onClick={() => {}}>Show 5 accounts</Button>
          <Button href="#/prototype/kit">Secondary</Button>
          <Button variant="ghost" href="#/prototype/kit">Ghost</Button>
          <Button variant="ghost" size="sm" href="#/prototype/kit">See all</Button>
          <Button icon="external" href="#/prototype/kit">View in block explorer</Button>
        </div>
      </Section>

      <Section title="IconButton">
        <div className={styles.row}>
          <IconButton icon="eye" label="Plain" />
          <IconButton icon="filter" label="Active" active />
          <IconButton icon="plus" label="Small" size="sm" />
          <IconButton icon="close" label="Filled" variant="filled" size="sm" />
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
          <Amount value={SAMPLE} size="hero" />
          <Amount value={SAMPLE} as="coin" size="hero" />
          <div className={styles.row}>
            <Amount value={SAMPLE} as="coin" size="xl" sign="+" />
            <Amount value={SAMPLE} size="lg" tone="muted" />
            <Amount value={SAMPLE} sign="−" />
            <Amount value={SAMPLE} as="coin" size="sm" tone="muted" />
            <Amount value={undefined} />
          </div>
          <div className={styles.row}>
            <Delta value={0.2071} />
            <Delta value={0.2071} label="1Y" />
            <Delta value={-0.0312} />
          </div>
        </div>
      </Section>

      <Section title="Badge">
        <div className={styles.row}>
          <Badge>Neutral</Badge>
          <Badge tone="success" icon="check">Confirmed</Badge>
          <Badge tone="warning" icon="clock">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
        </div>
      </Section>

      <Section title="ListRow and coin icons">
        <List>
          <ListRow href="#/prototype/kit" leading={<GlyphIcon icon="wallet" size={40} />} title="All accounts" subtitle="5 accounts" trailing={<Amount value={SAMPLE} />} chevron />
          <ListRow href="#/prototype/kit" leading={<CoinIcon coinCode="btc" size={40} />} title="Savings" subtitle={<Amount value={SAMPLE} as="coin" size="sm" tone="muted" />} trailing={<Amount value={SAMPLE} />} chevron />
          <ListRow href="#/prototype/kit" selected leading={<CoinIcon coinCode="btc" size={36} badge="pending" />} title="Received" subtitle={<Badge tone="warning">Pending</Badge>} trailing={<Amount value={SAMPLE} as="coin" sign="+" />} trailingSub={<Amount value={SAMPLE} size="sm" tone="muted" sign="+" />} />
          <ListRow title="Value when received" trailing="$542.10" />
        </List>
        <div className={styles.row}>
          {['btc', 'eth', 'eth-erc20-usdc', 'ltc', 'lightning'].map(code => <CoinIcon key={code} coinCode={code} size={36} />)}
          {(['receive', 'send', 'self', 'pending', 'failed'] as const).map(badge => <CoinIcon key={badge} coinCode="btc" size={36} badge={badge} />)}
        </div>
      </Section>

      <Section title="SegmentedControl, TextField, Toggle and Chip">
        <div className={styles.stack}>
          <div className={styles.row}>
            <SegmentedControl label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
            <span className={styles.field}><TextField icon="search" value={text} onChange={setText} placeholder="Search accounts" /></span>
            <Toggle checked={toggle} onChange={setToggle} label="Toggle" />
          </div>
          <div className={styles.row}>
            <Chip selected={!coin} onClick={() => setCoin(false)} leading={<Icon name="accounts" size={18} />}>All coins</Chip>
            <Chip selected={coin} onClick={() => setCoin(value => !value)} leading={<CoinIcon coinCode="btc" size={20} />} count={2}>Bitcoin</Chip>
            <Chip selected={false} onClick={() => {}} leading={<CoinIcon coinCode="eth" size={20} />} count={1}>Ethereum</Chip>
          </div>
        </div>
      </Section>

      <Section title="Popover and Sheet">
        <div className={styles.row}>
          <Popover
            open={popover}
            onClose={() => setPopover(false)}
            label="Example popover"
            trigger={<IconButton icon="filter" label="Open popover" active={popover} onClick={() => setPopover(value => !value)} />}>
            <Section variant="plain" title="Sort by">
              <SegmentedControl label="Sort" options={[{ value: 'value', label: 'Value' }, { value: 'name', label: 'Name' }]} value={sort} onChange={setSort} full />
            </Section>
          </Popover>
          <Button onClick={() => setSheet(true)}>Open sheet</Button>
        </div>
      </Section>

      <Section title="Message">
        <Message title="Hey there">Not available yet. This prototype only covers Portfolio, Accounts, individual account screens and tx details.</Message>
      </Section>

      <Section title="DeviceStatus">
        <div className={styles.row}>
          <span className={styles.darkTile} style={DARK_PANEL}><DeviceStatus name="My BitBox" state="connected" detail="v9.24.0" onDark /></span>
          <span className={styles.darkTile} style={DARK_PANEL}><DeviceStatus name="My BitBox" state="disconnected" onDark /></span>
        </div>
      </Section>

      <Section title="AreaChart">
        <AreaChart points={chartPoints(chart, range)} height={140} />
      </Section>

      <Section title="Navigation">
        <div className={styles.navPreviews}>
          <div className={styles.navFrame} style={DARK_PANEL}>
            <Navigation layout="sidebar" items={NAV.filter(item => item.key === 'portfolio' || item.key === 'market')} header={<Logo height={18} onDark />} />
          </div>
          <div className={`${styles.navFrame} ${styles.navFrameWide}`}>
            <Navigation layout="tabbar" items={NAV} />
          </div>
        </div>
      </Section>

      <Section title="PageHeader, Section and Skeleton">
        <div className={styles.stack}>
          <PageHeader title="Savings" subtitle="Bitcoin" size="compact" back="#/prototype/kit" actions={<IconButton icon="eye" label="Hide amounts" />} />
          <Section title="Card section"><p className={styles.copy}>A Section draws the calm white card.</p></Section>
          <div className={styles.row}><Skeleton width={160} height={28} /><Skeleton width={40} height={40} radius="pill" /></div>
          <SkeletonRows count={2} />
        </div>
      </Section>

      <Section title="Icon">
        <div className={styles.icons}>
          {ICONS.map(name => <span key={name} className={styles.iconCell} title={name}><Icon name={name} size={22} /><span>{name}</span></span>)}
        </div>
      </Section>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Sheet">
        <p className={styles.copy}>A bottom sheet on phones and a side panel from tablet up.</p>
      </Sheet>
    </div>
  );
};
