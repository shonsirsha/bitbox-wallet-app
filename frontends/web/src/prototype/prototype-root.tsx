// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): "The redesigned UI (variant 1) next to today's UI (variant 0), switchable
// via ?variant= on the existing routes." The query sits before the hash, so in-app navigation
// keeps the selected variant and links stay shareable.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { App } from '@/app';
import type { TThemeSetting, TVariantKey } from './context';
import { PrototypeBar, TVariant } from './prototype-bar';

const PrototypeApp = lazy(() => import('./prototype-app').then(module => ({ default: module.PrototypeApp })));

export const VARIANTS: TVariant[] = [
  { key: '0', name: 'Current app' },
  { key: '1', name: 'Redesigned' },
];

// Links shared before the rename used ?variant=E for the redesign.
const ALIASES: Record<string, TVariantKey> = { E: '1' };

const readVariant = (): TVariantKey => {
  const raw = new URLSearchParams(window.location.search).get('variant')?.toUpperCase() || '';
  const value = ALIASES[raw] || raw;
  return (VARIANTS.find(variant => variant.key === value)?.key) || '1';
};

// Dark is the default; the key is versioned so earlier saved "auto" choices start on dark too.
export const THEME_STORAGE_KEY = 'prototype-theme-v2';

const readTheme = (): TThemeSetting => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'auto' ? value : 'dark';
  } catch {
    return 'dark';
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
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the setting just won't persist.
    }
  };

  useEffect(() => {
    // Always show the variant in the URL (canonical key) so a copied link opens the same design.
    if (new URLSearchParams(window.location.search).get('variant') !== variant) {
      changeVariant(variant);
    }
  }, [changeVariant, variant]);

  return (
    <>
      {variant === '0'
        ? <App />
        : (
          <Suspense fallback={null}>
            <PrototypeApp direction="E" themeSetting={theme} />
          </Suspense>
        )}
      <PrototypeBar variants={VARIANTS} current={variant} onChange={changeVariant} theme={theme} onThemeChange={changeTheme} />
    </>
  );
};
