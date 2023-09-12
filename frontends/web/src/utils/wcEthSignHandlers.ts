import { SessionTypes } from '@walletconnect/types';
import { EIP155_SIGNING_METHODS } from '../routes/account/walletconnect/utils';
import { ethSignMessage, ethSignTypedMessage, getEthAccountCodeAndNameByAddress } from '../api/account';

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
    onReturnedAddress: (address: string) => void;
    onSaveApiCaller: (apiCaller: () => Promise<any>) => void;
    launchSignDialog: (topic: string, id: number, message: string, currentSession: SessionTypes.Struct) => void;
};

const fetchAccountCodeByAddress = async (address: string) => {
  const accountDetail = await getEthAccountCodeAndNameByAddress(address);
  if (!accountDetail.success) {
    console.log('Failed in fetching account code'); //silently fails
    return;
  }
  return accountDetail.code;
};

export async function handleWcEthSignRequest(method: string, args: TEthSignHandlerParams) {
  switch (method) {
  case EIP155_SIGNING_METHODS.ETH_SIGN:
    await ethSignHandler(args);
    break;
  case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    await personalSignHandler(args);
    break;
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
  case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
    await ethSignTypedDataHandler(args);
    break;
  default:
    console.log(`${method} is unsupported`);
  }
}

/**
     * Wallet Connect's ETH_SIGN gives the params as [address, message]
     * while PERSONAL_SIGN gives them as [message, address]
*/

async function ethSignHandler({ params, onReturnedAddress, launchSignDialog, topic, id, currentSession, onSaveApiCaller }: TEthSignHandlerParams) {
  const requestParams = params.request.params;
  const accountAddress = requestParams[0];
  const message = requestParams[1];
  const accountCode = await fetchAccountCodeByAddress(accountAddress);
  if (!accountCode) {
    return;
  }
  const apiCaller = async () => {
    const result = await ethSignMessage(accountCode, message);
    if (!result.success) {
      return { success: false, error: result };
    }
    return {
      response: { id, jsonrpc: '2.0', result: result.signature },
      success: true
    };
  };
  onSaveApiCaller(apiCaller);
  onReturnedAddress(accountAddress);
  launchSignDialog(topic, id, message, currentSession);
}

async function personalSignHandler({ params, onReturnedAddress, launchSignDialog, topic, id, currentSession, onSaveApiCaller }: TEthSignHandlerParams) {
  const requestParams = params.request.params;
  const accountAddress = requestParams[1];
  const message = requestParams[0];
  const accountCode = await fetchAccountCodeByAddress(accountAddress);
  if (!accountCode) {
    return;
  }
  const apiCaller = async () => {
    const result = await ethSignMessage(accountCode, message);
    if (!result.success) {
      return { success: false, error: result };
    }
    return {
      response: { id, jsonrpc: '2.0', result: result.signature },
      success: true
    };
  };
  onSaveApiCaller(apiCaller);
  onReturnedAddress(accountAddress);
  launchSignDialog(topic, id, message, currentSession);
}

async function ethSignTypedDataHandler({ params, onReturnedAddress, launchSignDialog, topic, id, currentSession, onSaveApiCaller }: TEthSignHandlerParams) {
  const requestParams = params.request.params;
  const accountAddress = requestParams[0];
  const data = requestParams[1];
  const typedData = JSON.parse(data);
  const accountCode = await fetchAccountCodeByAddress(accountAddress);
  if (!accountCode) {
    return;
  }
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
  onSaveApiCaller(apiCaller);
  onReturnedAddress(accountAddress);
  launchSignDialog(topic, id, JSON.stringify(data), currentSession);
}

