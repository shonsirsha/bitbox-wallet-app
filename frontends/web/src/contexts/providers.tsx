/**
 * Copyright 2024 Shift Crypto AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReactNode } from 'react';
import { DarkModeProvider } from './DarkmodeProvider';
import { AppProvider } from './AppProvider';
import { WCWeb3WalletProvider } from './WCWeb3WalletProvider';
import { RatesProvider } from './RatesProvider';
import { LightningProvider } from './LightningProvider';

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <AppProvider>
      <DarkModeProvider>
        <RatesProvider>
          <WCWeb3WalletProvider>
            <LightningProvider>
              {children}
            </LightningProvider>
          </WCWeb3WalletProvider>
        </RatesProvider>
      </DarkModeProvider>
    </AppProvider>
  );
};
