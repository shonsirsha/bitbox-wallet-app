
import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CoreTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import AppContext from '../../contexts/AppContext';
import { Button } from '../forms';
import { Dialog, DialogButtons } from '../dialog/dialog';
import { alertUser } from '../alert/Alert';
import useInitialization, { web3wallet } from '../../routes/account/walletconnect/utils';
import { TEthSignHandlerParams, handleWcEthSignRequest } from '../../utils/wcEthSignHandlers';

type TRequestDialogProps = {
  accountAddress: string;
  open: boolean;
  metadata: CoreTypes.Metadata
  onAccept: () => void;
  onReject: () => void;
  signingData: string;
}

const rejectMessage = (id: number) => {
  return {
    id,
    jsonrpc: '2.0',
    error: {
      code: 5000,
      message: 'User rejected.'
    }
  };
};

const RequestDialog = ({
  accountAddress,
  open,
  metadata,
  onAccept,
  onReject,
  signingData,
}: TRequestDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} medium title={t('walletConnect.signingRequest.walletConnectRequest')} >
      <div>
        <span>
          <img src={metadata.icons[0]} width="50" height="50" alt="icon" />
          <span>{metadata.name}</span>
        </span>
        <div>{metadata.description}</div>
        <div>Account: {accountAddress}</div>
        <div>Data: {signingData.toString()}</div>
        <DialogButtons>
          <Button onClick={onAccept} primary type="submit">Sign</Button>
          <Button onClick={onReject} primary type="submit">Reject</Button>
        </DialogButtons>
      </div>
    </Dialog>
  );
};

type TSigningRequestData = {
  topic: string;
  id: number;
  message: any;
  currentSession: SessionTypes.Struct;
}

export const WCIncomingRequest = () => {
  const isInitialized = useInitialization();
  const { allSessions } = useContext(AppContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signingData, setSigningData] = useState(''); // data / "message" coming from dApp
  const [accountAddress, setAccountAddress] = useState(''); // 'accountAddress' is the account's "receive" / "wallet" address
  const [signingSession, setSigningSession] = useState<SessionTypes.Struct>();
  const signMessageApiCallerRef: MutableRefObject<(() => Promise<any>) | undefined> = useRef();
  const requestDataRef = useRef<TSigningRequestData>();

  const launchSignDialog = (
    topic: string,
    id: number,
    message: string,
    currentSession: SessionTypes.Struct,
  ) => {
    // storing data to be used whenever
    // user accepts or rejects later
    // (see handleAcceptBtn & handleRejectBtn)
    requestDataRef.current = { topic, id, message, currentSession };

    //preparing to be displayed in the UI
    setSigningSession(currentSession);
    setSigningData(message);

    //opening the dialog
    setDialogOpen(true);
  };

  useEffect(() => {
    if (web3wallet && isInitialized) {
      const onSessionRequest = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, id } = requestEvent;
        const activeSessions = Object.values(web3wallet?.getActiveSessions() || {});
        const currentSession = activeSessions.find(session => session.topic === topic);
        if (currentSession) {
          const handlerArgs: TEthSignHandlerParams = {
            topic,
            id,
            params,
            currentSession,
            onReturnedAddress: (address: string) => setAccountAddress(address),
            // storing the appropriate signing api call to be called later on (see handleAcceptBtn)
            onSaveApiCaller: (apiCaller: () => Promise<any>) => signMessageApiCallerRef.current = apiCaller,
            launchSignDialog,
          };
          await handleWcEthSignRequest(params.request.method, handlerArgs);
        }
      };
      web3wallet?.on('session_request', onSessionRequest);
      return () => {
        web3wallet?.off('session_request', onSessionRequest);
      };
    }
  }, [isInitialized, allSessions]);

  const handleRejectBtn = async () => {
    setDialogOpen(false);
    const requestData = requestDataRef.current;
    if (requestData) {
      const { topic, id } = requestData;
      await web3wallet.respondSessionRequest({ topic, response: rejectMessage(id) });
    }
  };

  const handleAcceptBtn = async () => {
    setDialogOpen(false);
    //todo: make sure to not totally close dialog, but change smt so it says
    //according to mockup
    const apiCaller = signMessageApiCallerRef.current;
    const requestData = requestDataRef.current;
    if (apiCaller && requestData) {
      const { topic, id, } = requestData;
      const { response, success, error } = await apiCaller();
      if (success) {
        await web3wallet.respondSessionRequest({ topic, response });
        //here close all modals
      } else if (error.aborted) {
        await web3wallet.respondSessionRequest({ topic, response: rejectMessage(id) });
        //here close all modals
      } else {
        const { errorMessage } = error;
        alertUser(errorMessage ? errorMessage : 'Something went wrong');
      }
    }
  };

  if (!signingSession) {
    return null;
  }

  return (
    <RequestDialog
      accountAddress={accountAddress}
      signingData={signingData}
      open={dialogOpen && !!signingSession}
      onAccept={handleAcceptBtn}
      onReject={handleRejectBtn}
      metadata={signingSession.peer.metadata}
    />
  );
};
