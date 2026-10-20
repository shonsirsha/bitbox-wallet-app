// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): small screen helpers (no layouts here).

import type { TAccount } from '@/api/account';
import { IconButton, TNavItem } from '../kit';
import { usePrototype } from '../context';
import { href, TScreen } from '../routing';

export type TNavKey = 'portfolio' | 'accounts' | 'lightning' | 'market' | 'settings';

export const activeNav = (screen: TScreen): TNavKey | undefined => {
  switch (screen.name) {
  case 'portfolio':
    return 'portfolio';
  case 'accounts':
  case 'account':
    return 'accounts';
  case 'other':
    if (screen.path.startsWith('/lightning')) {
      return 'lightning';
    }
    if (screen.path.startsWith('/market')) {
      return 'market';
    }
    if (screen.path.startsWith('/settings')) {
      return 'settings';
    }
    return undefined;
  default:
    return undefined;
  }
};

const ALL_NAV: Omit<TNavItem, 'active'>[] = [
  { key: 'portfolio', label: 'Portfolio', icon: 'portfolio', href: href.portfolio },
  { key: 'accounts', label: 'Accounts', icon: 'accounts', href: href.accounts },
  { key: 'lightning', label: 'Lightning', icon: 'lightning', href: href.lightning },
  { key: 'market', label: 'Marketplace', icon: 'marketplace', href: href.market },
  { key: 'settings', label: 'Settings', icon: 'settings', href: href.settings },
];

export const navItems = (screen: TScreen, keys: TNavKey[] = ['portfolio', 'accounts', 'lightning', 'market', 'settings'], short = false): TNavItem[] => {
  const active = activeNav(screen);
  return keys.map(key => {
    const item = ALL_NAV.find(nav => nav.key === key) as TNavItem;
    return { ...item, label: short && key === 'market' ? 'Market' : item.label, active: key === active };
  });
};

export const HideAmountsButton = () => {
  const { hideAmounts, toggleHideAmounts } = usePrototype();
  return (
    <IconButton
      icon={hideAmounts ? 'eyeOff' : 'eye'}
      label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
      onClick={toggleHideAmounts}
      active={hideAmounts} />
  );
};


export const closeTransaction = (code: string) => {
  window.location.hash = href.account(code).slice(1);
};

// A coin opens its account, or the Accounts page filtered to it when several accounts hold it.
export const coinHref = (accounts: TAccount[] | undefined, coinCode: string) => {
  if (coinCode === 'lightning') {
    return href.lightning;
  }
  const matching = accounts?.filter(account => account.coinCode === coinCode) || [];
  if (matching.length === 1 && matching[0]) {
    return href.account(matching[0].code);
  }
  return matching.length ? href.accountsFor(coinCode) : href.accounts;
};
