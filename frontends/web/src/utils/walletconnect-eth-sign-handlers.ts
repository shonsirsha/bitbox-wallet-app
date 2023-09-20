import { t } from 'i18next';
import { SessionTypes } from '@walletconnect/types';
import { EIP155_SIGNING_METHODS } from './walletconnect';
import { ethSignMessage, ethSignTypedMessage, ethSignWalletConnectTx, getEthAccountCodeAndNameByAddress } from '../api/account';

type TWCParams = {
  request: {
    method: string,
    params: any[]
  };
  chainId: string;
}

export type TEthSignHandlerParams = {
  topic: string;
  id: number;
  params: TWCParams;
  currentSession: SessionTypes.Struct;
  launchSignDialog: ({ topic, id, dialogContent }: TLaunchSignDialog) => void;
};

export type TRequestDialogContent = {
  accountName: string;
  accountAddress: string; // 'accountAddress' is the account's "receive" / "wallet" address
  chain: string;
  signingData: string; // data / message coming from dapp
  currentSession: SessionTypes.Struct;
  method: string;
}

export type TLaunchSignDialog = {
  topic: string,
  id: number,
  apiCaller: () => Promise<any>;
  dialogContent: TRequestDialogContent
}

const fetchAccountNameAndAddress = async (address: string) => {
  const accountDetail = await getEthAccountCodeAndNameByAddress(address);
  if (!accountDetail.success) {
    console.log('Failed in fetching account name and code'); //silently fails
    return { accountName: '', accountCode: '' };
  }
  const { code, name } = accountDetail;
  return { accountName: name, accountCode: code };
};

export async function handleWcEthSignRequest(method: string, args: TEthSignHandlerParams) {
  switch (method) {
  case EIP155_SIGNING_METHODS.ETH_SIGN:
  case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    await ethSignHandler(args, method);
    break;
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
    await ethSignTypedDataHandler(args);
    break;
  case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
  case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
    await ethSignOrSendTransactionHandler(args, method);
    break;
  default:
    console.log(`${method} is unsupported`);
  }
}

/**
     * Wallet Connect's ETH_SIGN gives the params as [address, message]
     * while PERSONAL_SIGN gives them as [message, address]
*/

async function ethSignHandler({ params, launchSignDialog, topic, id, currentSession }: TEthSignHandlerParams, method: string) {
  const isPersonalSign = method === EIP155_SIGNING_METHODS.PERSONAL_SIGN;
  const requestParams = params.request.params;
  const accountAddress = isPersonalSign ? requestParams[1] : requestParams[0];
  const signingData = isPersonalSign ? requestParams[0] : requestParams[1];
  const { accountName, accountCode } = await fetchAccountNameAndAddress(accountAddress);
  const apiCaller = async () => {
    const result = await ethSignMessage(accountCode, signingData);
    if (!result.success) {
      return { success: false, error: result };
    }
    return {
      response: { id, jsonrpc: '2.0', result: result.signature },
      success: true
    };
  };

  launchSignDialog({
    topic,
    id,
    apiCaller,
    dialogContent: {
      signingData,
      currentSession,
      accountName,
      accountAddress,
      chain: params.chainId,
      method: t('walletConnect.signingRequest.method.signMessage')
    }
  });
}

async function ethSignTypedDataHandler({ params, launchSignDialog, topic, id, currentSession }: TEthSignHandlerParams) {
  const requestParams = params.request.params;
  const accountAddress = requestParams[0];
  const data = requestParams[1];
  const typedData = JSON.parse(data);
  const { accountName, accountCode } = await fetchAccountNameAndAddress(accountAddress);
  const apiCaller = async () => {
    // If the typed data to be signed includes its own chainId, we use that, otherwise use the id in the params
    const chainId = typedData.domain.chainId ?
      +typedData.domain.chainId :
      +params.chainId.replace(/^eip155:/, '');
    const result = await ethSignTypedMessage(accountCode, chainId, data);
    if (result.success) {
      const response = { id, jsonrpc: '2.0', result: result.signature };
      return { response, success: true };
    }

    return { success: false, error: result };
  };


  launchSignDialog({
    topic,
    id,
    apiCaller,
    dialogContent: {
      signingData: data,
      currentSession,
      accountName,
      accountAddress,
      chain: params.chainId,
      method: t('walletConnect.signingRequest.method.signTypedData')
    }
  });
}

async function ethSignOrSendTransactionHandler(args: TEthSignHandlerParams, method: string) {
  const isSendAndSign = method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION;

  const { params, launchSignDialog, topic, id, currentSession } = args;
  const requestParams = params.request.params;
  // for ETH_SIGN_TRANSACTION, there's only 1 item in the
  // requestParams[] instaed of 2.
  const accountAddress = requestParams[0].from; // this is our wallet address
  const data = requestParams[0];
  const { accountName, accountCode } = await fetchAccountNameAndAddress(accountAddress);
  const apiCaller = async () => {
    // If the typed data to be signed includes its own chainId, we use that, otherwise use the id in the params
    const chainId = +params.chainId.replace(/^eip155:/, '');
    const result = await ethSignWalletConnectTx(accountCode, isSendAndSign, chainId, data);
    if (result.success) {
      const response = { id, jsonrpc: '2.0', result: isSendAndSign ? result.txHash : result.rawTx };
      return { response, success: true };
    }

    return { success: false, error: result };
  };
  const formattedMethod = isSendAndSign ? t('walletConnect.signingRequest.method.sendTransaction') : t('walletConnect.signingRequest.method.signTransaction');


  launchSignDialog({
    topic,
    id,
    apiCaller,
    dialogContent: {
      signingData: JSON.stringify(data),
      currentSession,
      accountName,
      accountAddress,
      chain: params.chainId,
      method: formattedMethod,
    }
  });
}

