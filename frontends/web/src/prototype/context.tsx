// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): view state shared by the prototype screens.

import { createContext, useContext } from 'react';

export type TDirectionKey = 'E';
// Variant 0 is today's app, variant 1 the redesign.
export type TVariantKey = '0' | '1';
export type TThemeSetting = 'auto' | 'light' | 'dark';

export type TPrototypeContext = {
  direction: TDirectionKey;
  theme: 'light' | 'dark';
  locale: string;
  fiat: string;
  hideAmounts: boolean;
  toggleHideAmounts: () => void;
};

export const PrototypeContext = createContext<TPrototypeContext>({
  direction: 'E',
  theme: 'light',
  locale: 'en-US',
  fiat: 'USD',
  hideAmounts: false,
  toggleHideAmounts: () => {},
});

export const usePrototype = () => useContext(PrototypeContext);
