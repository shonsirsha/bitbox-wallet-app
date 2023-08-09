
/**
 * Copyright 2023 Shift Crypto AG
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

import { WalletConnectDefaultLogo } from '../../../../../components/icon';
import styles from './header.module.css';

type TWalletConnectProps = {
  walletAddress: string;
  accountName: string;
}

export const WCHeader = ({ walletAddress, accountName }: TWalletConnectProps) => {
  const displayedWalletAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 6)}`;
  return (
    <div className={styles.headerContainer}>
      <WalletConnectDefaultLogo />
      <h1>WalletConnect</h1>
      <p className={styles.accountName}>{accountName}</p>
      <p className={styles.walletAddress}>{displayedWalletAddress}</p>
    </div>
  );
};
