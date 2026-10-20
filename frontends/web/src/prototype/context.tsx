// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): view state shared by the prototype directions.

import { createContext, useContext } from 'react';

export type TDirectionKey = 'A' | 'B' | 'C' | 'D' | 'E';
export type TVariantKey = '0' | TDirectionKey;
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
  direction: 'A',
  theme: 'light',
  locale: 'en-US',
  fiat: 'USD',
  hideAmounts: false,
  toggleHideAmounts: () => {},
});

export const usePrototype = () => useContext(PrototypeContext);
