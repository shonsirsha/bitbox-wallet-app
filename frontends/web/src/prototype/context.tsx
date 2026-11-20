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
  // Account codes pinned to Favourite accounts, in the order they were pinned.
  favourites: string[];
  toggleFavourite: (code: string) => void;
};

export const PrototypeContext = createContext<TPrototypeContext>({
  direction: 'E',
  theme: 'dark',
  locale: 'en-US',
  fiat: 'USD',
  hideAmounts: false,
  toggleHideAmounts: () => {},
  favourites: [],
  toggleFavourite: () => {},
});

export const usePrototype = () => useContext(PrototypeContext);
