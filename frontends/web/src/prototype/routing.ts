// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): the existing hash routes, parsed for the prototype directions.

import { useEffect, useState } from 'react';

export type TScreen =
  | { name: 'portfolio' }
  | { name: 'accounts'; coin?: string }
  | { name: 'account'; code: string; txId?: string }
  | { name: 'kit' }
  | { name: 'other'; path: string; title: string };

const TITLES: [RegExp, string][] = [
  [/^\/settings/, 'Settings'],
  [/^\/market/, 'Marketplace'],
  [/^\/lightning/, 'Lightning'],
  [/^\/account\/[^/]+\/send/, 'Send'],
  [/^\/account\/[^/]+\/receive/, 'Receive'],
  [/^\/add-account/, 'Add account'],
];

export const parseHash = (hash: string): TScreen => {
  const [rawPath = '/', search = ''] = hash.replace(/^#/, '').split('?');
  const path = rawPath || '/';
  const query = new URLSearchParams(search);
  if (path === '/' || path === '/account-summary') {
    return { name: 'portfolio' };
  }
  if (path === '/accounts/all') {
    return { name: 'accounts', coin: query.get('coin') || undefined };
  }
  if (path === '/prototype/kit') {
    return { name: 'kit' };
  }
  const account = path.match(/^\/account\/([^/]+)$/);
  if (account?.[1]) {
    return { name: 'account', code: decodeURIComponent(account[1]), txId: query.get('tx') || undefined };
  }
  const title = TITLES.find(([pattern]) => pattern.test(path))?.[1] || 'This screen';
  return { name: 'other', path, title };
};

export const useScreen = () => {
  const [screen, setScreen] = useState<TScreen>(() => parseHash(window.location.hash));
  useEffect(() => {
    let lastPath = window.location.hash.split('?')[0];
    const onChange = () => {
      setScreen(parseHash(window.location.hash));
      const path = window.location.hash.split('?')[0];
      if (path !== lastPath) {
        window.scrollTo({ top: 0 });
      }
      lastPath = path;
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return screen;
};

export const href = {
  portfolio: '#/account-summary',
  accounts: '#/accounts/all',
  accountsFor: (coinCode: string) => `#/accounts/all?coin=${encodeURIComponent(coinCode)}`,
  account: (code: string) => `#/account/${encodeURIComponent(code)}`,
  transaction: (code: string, txId: string) => `#/account/${encodeURIComponent(code)}?tx=${encodeURIComponent(txId)}`,
  send: (code: string) => `#/account/${encodeURIComponent(code)}/send`,
  receive: (code: string) => `#/account/${encodeURIComponent(code)}/receive`,
  lightning: '#/lightning',
  market: '#/market/select',
  settings: '#/settings',
  kit: '#/prototype/kit',
};
