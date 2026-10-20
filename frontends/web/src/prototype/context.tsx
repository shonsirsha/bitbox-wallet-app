// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): view state shared by the prototype screens.

import { createContext, useContext } from 'react';

export type TDirectionKey = 'E';
// 'auto' follows the operating system.
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
  theme: 'dark',
  locale: 'en-US',
  fiat: 'USD',
  hideAmounts: false,
  toggleHideAmounts: () => {},
});

export const usePrototype = () => useContext(PrototypeContext);
