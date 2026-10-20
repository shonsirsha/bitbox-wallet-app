// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): every kit component and state, rendered with the current direction's
// tokens. This page is the whole design vocabulary: screens may only use what is shown here.

import { useState } from 'react';
import type { TAmountWithConversions } from '@/api/account';
import {
  Amount, AreaChart, Badge, Button, CoinIcon, Delta, DeviceConfirm, DeviceStatus, GlyphIcon, Icon, IconButton,
  List, ListRow, Logo, Message, Navigation, PageHeader, Section, SegmentedControl, Sheet, Skeleton, SkeletonRows,
  TextField, TIconName, Toggle,
} from '../kit';
import { TDirectionKey, usePrototype } from '../context';
import { chartPoints, RANGE_OPTIONS, TRange, useChart } from '../data';
import styles from './kit-page.module.css';

const SAMPLE: TAmountWithConversions = {
  amount: '0.38708272',
  unit: 'BTC',
  estimated: false,
  conversions: { USD: '40\'353.37', EUR: '34\'744.25', CHF: '32\'161.64', GBP: '30\'184.32', BTC: '0.38708272', sat: '38708272' },
};

const ICONS: TIconName[] = [
  'portfolio', 'accounts', 'lightning', 'marketplace', 'settings', 'send', 'receive', 'self', 'swap', 'buy', 'plus',
  'back', 'chevron', 'chevronDown', 'close', 'search', 'eye', 'eyeOff', 'copy', 'external', 'check', 'info',
  'warning', 'failed', 'clock', 'more', 'device', 'lock', 'shield', 'qr', 'menu', 'wallet', 'note', 'filter',
];

const NAV = [
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio' as const, href: '#/prototype/kit', active: true },
  { key: 'accounts', label: 'Accounts', icon: 'accounts' as const, href: '#/prototype/kit' },
  { key: 'lightning', label: 'Lightning', icon: 'lightning' as const, href: '#/prototype/kit' },
  { key: 'market', label: 'Market', icon: 'marketplace' as const, href: '#/prototype/kit' },
  { key: 'settings', label: 'Settings', icon: 'settings' as const, href: '#/prototype/kit' },
];

type TNavLayoutKey = 'sidebar' | 'rail' | 'topbar' | 'tabbar' | 'floating';

const NAV_LAYOUTS: { key: TNavLayoutKey; label: string; wide?: boolean }[] = [
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'rail', label: 'Rail' },
  { key: 'topbar', label: 'Top bar', wide: true },
  { key: 'tabbar', label: 'Tab bar', wide: true },
  { key: 'floating', label: 'Floating tab bar', wide: true },
];

// Which navigation layouts each direction puts on which screen size.
const NAV_USAGE: Record<TDirectionKey, Partial<Record<TNavLayoutKey, string>>> = {
  A: { sidebar: 'tablet & desktop', tabbar: 'phone' },
  B: { sidebar: 'desktop', rail: 'tablet', tabbar: 'phone' },
  C: {},
  D: { tabbar: 'phone' },
  E: { sidebar: 'tablet & desktop', floating: 'phone' },
};

const NAV_NOTE: Partial<Record<TDirectionKey, string>> = {
  C: 'Activity first has no navigation bar at any size: an account switcher in the app bar and a Send/Receive dock replace it.',
  D: 'From tablet up, Workspace navigates with its panes (accounts list, content, inspector) instead of a navigation bar.',
};

export const KitPage = () => {
  const { direction } = usePrototype();
  const chart = useChart();
  const [range, setRange] = useState<TRange>('year');
  const [toggle, setToggle] = useState(true);
  const [text, setText] = useState('');
  const [sheet, setSheet] = useState<'dialog' | 'panel' | null>(null);
  return (
    <div className={styles.page}>
      <PageHeader title="Component kit" subtitle={`Direction ${direction}: the only building blocks the screens use`} />

      <Section title="Brand">
        <div className={styles.row}><Logo height={22} /></div>
      </Section>

      <Section title="Button">
        <div className={styles.row}>
          <Button icon="send">Primary</Button>
          <Button variant="secondary" icon="receive">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="secondary">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="IconButton">
        <div className={styles.row}>
          <IconButton icon="eye" label="Plain" />
          <IconButton icon="more" label="Filled" variant="filled" />
          <IconButton icon="plus" label="Accent" variant="accent" />
          <IconButton icon="send" label="Send" variant="filled" size="lg" caption />
          <IconButton icon="receive" label="Receive" variant="filled" size="lg" caption />
          <IconButton icon="buy" label="Buy" variant="filled" size="lg" caption />
          <IconButton icon="swap" label="Swap" variant="filled" size="lg" caption />
        </div>
      </Section>

      <Section title="Amount">
        <div className={styles.stack}>
          <Amount value={SAMPLE} size="hero" />
          <Amount value={SAMPLE} as="coin" size="xl" />
          <div className={styles.row}>
            <Amount value={SAMPLE} as="coin" size="lg" sign="+" />
            <Amount value={SAMPLE} size="md" sign="−" />
            <Amount value={SAMPLE} size="sm" tone="muted" />
            <Amount value={undefined} size="md" />
          </div>
        </div>
      </Section>

      <Section title="ListRow">
        <List>
          <ListRow leading={<CoinIcon coinCode="btc" />} title="Bitcoin" subtitle="0.38 708 272 BTC" trailing={<Amount value={SAMPLE} />} trailingSub="41.2%" href="#/prototype/kit" chevron />
          <ListRow leading={<CoinIcon coinCode="eth" badge="receive" />} title="Received" subtitle="Today, 14:03" trailing={<Amount value={SAMPLE} as="coin" sign="+" />} trailingSub={<Amount value={SAMPLE} size="sm" tone="muted" />} href="#/prototype/kit" />
          <ListRow leading={<GlyphIcon icon="clock" />} title="Pending" subtitle={<Badge tone="warning">Pending</Badge>} trailing="—" selected />
          <ListRow title="Without leading" subtitle="Key/value use" trailing="Value" />
        </List>
      </Section>

      <Section title="Badge and Delta">
        <div className={styles.row}>
          <Badge>Neutral</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success" dot>Connected</Badge>
          <Badge tone="warning" icon="clock">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
          <Delta value={0.2071} />
          <Delta value={-0.0312} />
        </div>
      </Section>

      <Section title="SegmentedControl, TextField and Toggle">
        <div className={styles.stack}>
          <SegmentedControl label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
          <div className={styles.field}>
            <TextField label="Search" icon="search" value={text} onChange={setText} placeholder="Address, amount or note" />
          </div>
          <div className={styles.row}><Toggle checked={toggle} onChange={setToggle} label="Toggle" /> <span>Toggle</span></div>
        </div>
      </Section>

      <Section title="Message">
        <div className={styles.stack}>
          <Message tone="info" title="Info">Keep your recovery words offline.</Message>
          <Message tone="success" title="Success">Backup verified.</Message>
          <Message tone="warning" title="Warning" action={<Button size="sm" variant="secondary">Update</Button>}>A firmware update is available.</Message>
          <Message tone="danger" title="Error" onDismiss={() => {}}>Could not connect to the BitBox.</Message>
        </div>
      </Section>

      <Section title="DeviceStatus and DeviceConfirm">
        <div className={styles.grid}>
          <DeviceStatus name="My BitBox" state="connected" detail="Firmware 9.24.0, up to date" variant="card" />
          <div className={styles.stack}>
            <DeviceStatus name="My BitBox" state="connected" detail="Firmware 9.24.0" />
            <DeviceStatus name="My BitBox" state="disconnected" detail="Watch-only" />
            <div className={styles.row}><DeviceStatus name="My BitBox" state="connected" variant="chip" /><DeviceStatus name="My BitBox" state="confirm" variant="chip" /></div>
          </div>
          <DeviceConfirm title="Confirm on your BitBox" values={[{ label: 'Amount', value: '0.0214 BTC' }, { label: 'To', value: 'bc1q…f7k2', mono: true }]}>
            Check that the address on the device matches.
          </DeviceConfirm>
        </div>
      </Section>

      <Section title="AreaChart">
        <AreaChart points={chartPoints(chart, range)} height={140} formatLabel={(time) => new Date(time * 1000).toLocaleDateString()} />
      </Section>

      <Section title="Navigation: what this direction uses">
        <div className={styles.navPreviews}>
          {NAV_LAYOUTS.map(layout => {
            const usage = NAV_USAGE[direction][layout.key];
            return (
              <div key={layout.key} className={styles.navPreview}>
                <div className={styles.navCaption}>
                  <span>{layout.label}</span>
                  {usage ? <Badge tone="success" icon="check">Used on {usage}</Badge> : <Badge>Not used here</Badge>}
                </div>
                <div className={`${styles.navFrame} ${layout.wide ? styles.navFrameWide : ''} ${usage ? '' : styles.navUnused}`}>
                  {layout.key === 'sidebar' && <Navigation layout="sidebar" items={NAV} header={<Logo height={18} />} />}
                  {layout.key === 'rail' && <Navigation layout="rail" items={NAV} />}
                  {layout.key === 'topbar' && <Navigation layout="topbar" items={NAV} />}
                  {layout.key === 'tabbar' && <Navigation layout="tabbar" items={NAV} />}
                  {layout.key === 'floating' && <Navigation layout="tabbar" floating items={NAV} />}
                </div>
              </div>
            );
          })}
        </div>
        {NAV_NOTE[direction] && <Message tone="info">{NAV_NOTE[direction]}</Message>}
      </Section>

      <Section title="Sheet, PageHeader and Skeleton">
        <div className={styles.stack}>
          <div className={styles.row}>
            <Button variant="secondary" onClick={() => setSheet('dialog')}>Open dialog sheet</Button>
            <Button variant="secondary" onClick={() => setSheet('panel')}>Open panel sheet</Button>
          </div>
          <PageHeader title="Compact header" size="compact" back="#/prototype/kit" actions={<IconButton icon="more" label="More" />} />
          <div className={styles.row}><Skeleton width={160} height={28} /><Skeleton width={80} height={28} radius="pill" /></div>
          <SkeletonRows count={2} />
        </div>
      </Section>

      <Section title="Icon">
        <div className={styles.icons}>
          {ICONS.map(name => <span key={name} className={styles.iconCell} title={name}><Icon name={name} size={22} /><span>{name}</span></span>)}
        </div>
      </Section>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title="Sheet" presentation={sheet || 'dialog'}
        footer={<><Button variant="secondary" full onClick={() => setSheet(null)}>Cancel</Button><Button full onClick={() => setSheet(null)}>Confirm</Button></>}>
        <p>Bottom sheet on phones; {sheet === 'panel' ? 'side panel' : 'centered dialog'} from tablet up.</p>
      </Sheet>
    </div>
  );
};
