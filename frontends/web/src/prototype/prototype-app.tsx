// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): renders one direction around the current route.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrototypeContext, TDirectionKey, TPrototypeContext, TThemeSetting } from './context';
import { DIRECTIONS } from './directions';
import { useScreen } from './routing';

type TProps = {
  direction: TDirectionKey;
  themeSetting: TThemeSetting;
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

export const PrototypeApp = ({ direction, themeSetting }: TProps) => {
  const { i18n } = useTranslation();
  const systemDark = useSystemDark();
  const screen = useScreen();
  const [hideAmounts, setHideAmounts] = useState(false);
  // Vault is dark-first; the others follow the OS until a theme is picked in the switcher.
  const theme = themeSetting === 'auto'
    ? (direction === 'B' || systemDark ? 'dark' : 'light')
    : themeSetting;

  const context = useMemo<TPrototypeContext>(() => ({
    direction,
    theme,
    locale: i18n.language || 'en-US',
    fiat: 'USD',
    hideAmounts,
    toggleHideAmounts: () => setHideAmounts(value => !value),
  }), [direction, theme, i18n.language, hideAmounts]);

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.classList.add('proto-active');
    return () => {
      document.documentElement.classList.remove('proto-active');
      document.documentElement.style.colorScheme = '';
      document.body.style.background = '';
    };
  }, []);
  useEffect(() => {
    // The current app's global dark-mode class must not leak into the prototype, and the page
    // background (visible when overscrolling on phones) should match the direction.
    document.body.classList.remove('dark-mode');
    document.documentElement.style.colorScheme = theme;
    if (rootRef.current) {
      document.body.style.background = getComputedStyle(rootRef.current).getPropertyValue('--k-bg');
    }
  }, [theme, direction]);

  const Direction = DIRECTIONS[direction];
  return (
    <PrototypeContext.Provider value={context}>
      <div ref={rootRef} className="proto-root" data-direction={direction} data-theme={theme} dir={i18n.dir(i18n.language)}>
        <Suspense fallback={null}>
          <Direction screen={screen} />
        </Suspense>
      </div>
    </PrototypeContext.Provider>
  );
};
