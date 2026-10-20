// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): "Five UI-refresh directions for the whole app, switchable via ?variant=
// on the existing routes; variant 0 is today's UI." The query sits before the hash, so in-app
// navigation keeps the selected variant and links stay shareable.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { App } from '@/app';
import type { TThemeSetting, TVariantKey } from './context';
import { PrototypeBar, TVariant } from './prototype-bar';

const PrototypeApp = lazy(() => import('./prototype-app').then(module => ({ default: module.PrototypeApp })));

export const VARIANTS: TVariant[] = [
  { key: '0', name: 'Current app' },
  { key: 'A', name: 'Quiet Swiss' },
  { key: 'B', name: 'Vault' },
  { key: 'C', name: 'Activity first' },
  { key: 'D', name: 'Workspace' },
  { key: 'E', name: 'Calm cards' },
];

const readVariant = (): TVariantKey => {
  const value = new URLSearchParams(window.location.search).get('variant')?.toUpperCase();
  return (VARIANTS.find(variant => variant.key === value)?.key) || 'A';
};

const readTheme = (): TThemeSetting => {
  try {
    const value = window.localStorage.getItem('prototype-theme');
    return value === 'light' || value === 'dark' ? value : 'auto';
  } catch {
    return 'auto';
  }
};

export const PrototypeRoot = () => {
  const [variant, setVariant] = useState<TVariantKey>(readVariant);
  const [theme, setTheme] = useState<TThemeSetting>(readTheme);

  const changeVariant = useCallback((key: TVariantKey) => {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', key);
    window.history.replaceState(window.history.state, '', url);
    setVariant(key);
  }, []);

  const changeTheme = (next: TThemeSetting) => {
    setTheme(next);
    try {
      window.localStorage.setItem('prototype-theme', next);
    } catch {
      // Private mode: the setting just won't persist.
    }
  };

  useEffect(() => {
    // Always show the variant in the URL so a copied link opens the same design.
    if (!new URLSearchParams(window.location.search).get('variant')) {
      changeVariant(variant);
    }
  }, [changeVariant, variant]);

  return (
    <>
      {variant === '0'
        ? <App />
        : (
          <Suspense fallback={null}>
            <PrototypeApp direction={variant} themeSetting={theme} />
          </Suspense>
        )}
      <PrototypeBar variants={VARIANTS} current={variant} onChange={changeVariant} theme={theme} onThemeChange={changeTheme} />
    </>
  );
};
