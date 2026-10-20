// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): the redesigned UI on the existing hash routes.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrototypeContext, TDirectionKey, TPrototypeContext, TThemeSetting } from './context';
import { DIRECTIONS } from './directions';
import { useScreen } from './routing';
import { ThemeToggle } from './theme-toggle';

const DIRECTION: TDirectionKey = 'E';

// Dark is the default; the key is versioned so earlier saved "auto" choices start on dark too.
const THEME_STORAGE_KEY = 'prototype-theme-v2';

const readThemeSetting = (): TThemeSetting => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'auto' ? value : 'dark';
  } catch {
    return 'dark';
  }
};

const useSystemDark = () => {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return dark;
};

export const PrototypeApp = () => {
  const { i18n } = useTranslation();
  const systemDark = useSystemDark();
  const screen = useScreen();
  const [hideAmounts, setHideAmounts] = useState(false);
  // Picked with the floating toggle and saved; dark by default ('auto' from earlier visits follows
  // the OS).
  const [themeSetting, setThemeSetting] = useState<TThemeSetting>(readThemeSetting);
  const theme = themeSetting === 'auto' ? (systemDark ? 'dark' : 'light') : themeSetting;
  const changeTheme = useCallback((next: 'light' | 'dark') => {
    setThemeSetting(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the choice lasts for this visit.
    }
  }, []);

  const context = useMemo<TPrototypeContext>(() => ({
    direction: DIRECTION,
    theme,
    locale: i18n.language || 'en-US',
    fiat: 'USD',
    hideAmounts,
    toggleHideAmounts: () => setHideAmounts(value => !value),
  }), [theme, i18n.language, hideAmounts]);

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.classList.add('proto-active');
    return () => {
      document.documentElement.classList.remove('proto-active');
      delete document.documentElement.dataset.protoTheme;
      document.documentElement.style.colorScheme = '';
      document.body.style.background = '';
    };
  }, []);
  useEffect(() => {
    // The app's global dark-mode class must not leak into the prototype, and the page background
    // (visible when overscrolling on phones) should match the theme.
    document.body.classList.remove('dark-mode');
    document.documentElement.style.colorScheme = theme;
    // The page scrollbar is drawn on the root, outside the themed tree.
    document.documentElement.dataset.protoTheme = theme;
    if (rootRef.current) {
      document.body.style.background = getComputedStyle(rootRef.current).getPropertyValue('--k-bg');
    }
  }, [theme]);

  const Direction = DIRECTIONS[DIRECTION];
  return (
    <PrototypeContext.Provider value={context}>
      <div ref={rootRef} className="proto-root" data-direction={DIRECTION} data-theme={theme} dir={i18n.dir(i18n.language)}>
        <Direction screen={screen} />
        <ThemeToggle theme={theme} onChange={changeTheme} />
      </div>
    </PrototypeContext.Provider>
  );
};
