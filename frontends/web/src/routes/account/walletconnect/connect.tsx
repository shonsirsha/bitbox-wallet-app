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

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useLoad } from '../../../hooks/api';
import * as accountApi from '../../../api/account';
import { Header, Main } from '../../../components/layout';
import { SignClientTypes } from '@walletconnect/types';
import useInitialization, { pair, web3wallet } from './utils';
import { alertUser } from '../../../components/alert/Alert';
import { View, ViewContent } from '../../../components/view/view';
import { Skeleton } from '../../../components/skeleton/skeleton';
import { WCHeader } from './components/header/header';
import { WCConnectForm } from './components/connect-form/connect-form';
import { TConnectStatus } from './types';
import { WCIncomingPairing } from './components/incoming-pairing/incomingpairing';
import styles from './connect.module.css';

type TProps = {
  code: string;
  accounts: accountApi.IAccount[]
};

export const ConnectScreenWalletConnect = ({
  code,
  accounts
}: TProps) => {
  const initialized = useInitialization();
  const [currentAddresses, setCurrentAddresses] = useState<accountApi.IReceiveAddress[]>();
  const [uri, setUri] = useState('');
  const [status, setStatus] = useState<TConnectStatus>('connect');
  const [currentProposal, setCurrentProposal] = useState<SignClientTypes.EventArguments['session_proposal']>();
  const receiveAddresses = useLoad(accountApi.getReceiveAddressList(code));
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      setStatus('incoming_pairing');
      setCurrentProposal(proposal);
    },
    []
  );
  useEffect(() => {
    if (receiveAddresses) {
      setCurrentAddresses(receiveAddresses[0].addresses); // uses the first address of the account
    }
  }, [receiveAddresses, currentAddresses]);

  useEffect(() => {
    web3wallet?.on('session_proposal', onSessionProposal);
    return () => {
      web3wallet?.off('session_proposal', onSessionProposal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSessionProposal, web3wallet]);

  const handleApprovePairingStates = () => {
    setStatus('connect'); // TODO: Set this to the successful / approved pairing state and show the success / approved pairing UI according to mocukup.
    setUri('');
    setCurrentProposal(undefined);
  };

  function handleRejectPairingStates() {
    setStatus('connect');
    setUri('');
    setCurrentProposal(undefined);
  }

  const onConnect = async (uri: string) => {
    try {
      await pair({ uri });
    } catch (err: any) {
      alertUser(err.message);
    } finally {
      setUri('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>, uri: string) => {
    event.preventDefault();
    onConnect(uri);
  };

  if (!currentAddresses || !initialized) {
    return <Skeleton />;
  }

  const accountName = (accounts && accounts.find(acct => acct.code === code))?.name || '';
  const walletAddress = currentAddresses[0].address;

  return (
    <Main>
      <Header />
      <View verticallyCentered fullscreen={false}>
        <ViewContent>
          <WCHeader
            accountName={accountName}
            walletAddress={walletAddress}
          />
          <div className={styles.contentContainer}>
            {status === 'connect' &&
            <WCConnectForm
              code={code}
              uri={uri}
              onInputChange={setUri}
              onSubmit={handleSubmit}
            />
            }

            {(status === 'incoming_pairing' && currentProposal) &&
              <WCIncomingPairing
                currentProposal={currentProposal}
                pairingMetadata={currentProposal.params.proposer.metadata}
                walletAddress={walletAddress}
                onApprove={handleApprovePairingStates}
                onReject={handleRejectPairingStates}
              />
            }
          </div>
        </ViewContent>
      </View>
    </Main>
  );
};
