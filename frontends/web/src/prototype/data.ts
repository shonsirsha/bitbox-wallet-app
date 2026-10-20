// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): data hooks for the directions, built on the app's real API modules
// and loading hooks (served by the mock backend in prototype mode).

import { useMemo } from 'react';
import {
  getAccounts,
  getAccountsBalanceSummary,
  getBalance,
  getChartData,
  getTransactionList,
  TAccount,
  TAmountWithConversions,
  TBalance,
  TChartData,
  TTransaction,
} from '@/api/account';
import { getDeviceList } from '@/api/devices';
import { getDeviceInfo, getVersion } from '@/api/bitbox02';
import { useLoad } from '@/hooks/api';
import { isBitcoinBased, isBitcoinOnly, isEthereumBased } from '@/utils/coin';
import type { TChartPoint } from './kit';

export const useAccounts = () => useLoad(getAccounts);

export const useSummary = () => {
  const response = useLoad(getAccountsBalanceSummary);
  return response?.success ? response.accountsBalanceSummary : undefined;
};

export const useChart = () => {
  const response = useLoad(() => getChartData(false));
  return response?.success ? response.data : undefined;
};

// Responses are tagged with their account so a stale one is never shown for another account.
export const useBalance = (code?: string) => {
  const response = useLoad(code ? () => getBalance(code).then(result => ({ code, result })) : null, [code]);
  return response?.code === code && response?.result.success ? response.result.balance : undefined;
};

export const useTransactions = (code?: string) => {
  const response = useLoad(code ? () => getTransactionList(code).then(result => ({ code, result })) : null, [code]);
  return response?.code === code && response?.result.success ? response.result.list : undefined;
};

// Balances of several accounts at once (for sorting and filtering account lists).
export const useBalances = (accounts?: TAccount[]) => {
  const codes = accounts?.map(account => account.code).join(',');
  const results = useLoad(
    accounts ? () => Promise.all(accounts.map(account => getBalance(account.code))) : null,
    [codes],
  );
  return useMemo(() => {
    if (!accounts || !results) {
      return undefined;
    }
    const byCode: Record<string, TBalance> = {};
    results.forEach((result, i) => {
      if (result.success) {
        byCode[(accounts[i] as TAccount).code] = result.balance;
      }
    });
    return byCode;
  }, [accounts, results]);
};

export type TActivityItem = { account: TAccount; tx: TTransaction };

// Transactions of several accounts merged into one feed, newest first.
export const useActivity = (accounts?: TAccount[]) => {
  const codes = accounts?.map(account => account.code).join(',');
  const lists = useLoad(
    accounts ? () => Promise.all(accounts.map(account => getTransactionList(account.code))) : null,
    [codes],
  );
  return useMemo(() => {
    if (!accounts || !lists) {
      return undefined;
    }
    const items: TActivityItem[] = [];
    lists.forEach((list, i) => {
      if (list.success) {
        list.list.forEach(tx => items.push({ account: accounts[i] as TAccount, tx }));
      }
    });
    return items.sort((a, b) => (b.tx.time || '').localeCompare(a.tx.time || ''));
  }, [accounts, lists]);
};

export const useDevice = () => {
  const devices = useLoad(getDeviceList);
  const deviceID = devices ? Object.keys(devices)[0] : undefined;
  const info = useLoad(deviceID ? () => getDeviceInfo(deviceID) : null, [deviceID]);
  const version = useLoad(deviceID ? () => getVersion(deviceID) : null, [deviceID]);
  return {
    loaded: devices !== undefined,
    connected: !!deviceID,
    name: info?.success ? info.deviceInfo.name : 'BitBox02',
    firmware: info?.success ? info.deviceInfo.version : undefined,
    passphrase: info?.success ? info.deviceInfo.mnemonicPassphraseEnabled : undefined,
    upToDate: version ? !version.canUpgrade : undefined,
  };
};

export type TRange = 'week' | 'month' | 'year' | 'all';

export const RANGE_OPTIONS: { value: TRange; label: string }[] = [
  { value: 'week', label: '1W' },
  { value: 'month', label: '1M' },
  { value: 'year', label: '1Y' },
  { value: 'all', label: 'All' },
];

const DAY_SECONDS = 24 * 60 * 60;

export const chartPoints = (chart: TChartData | undefined, range: TRange): TChartPoint[] => {
  if (!chart) {
    return [];
  }
  const source = range === 'week' ? chart.chartDataHourly : chart.chartDataDaily;
  const last = source[source.length - 1];
  const lastTime = typeof last?.time === 'number' ? last.time : 0;
  const from = range === 'month' ? lastTime - 30 * DAY_SECONDS : range === 'year' ? lastTime - 365 * DAY_SECONDS : 0;
  return source
    .filter(point => typeof point.time === 'number' && point.time >= from)
    .map(point => ({ time: point.time as number, value: point.value, label: point.formattedValue }));
};

// Synthesises an amount for a hovered chart point (the chart only carries the fiat value).
export const fiatAmount = (formatted: string, fiat: string): TAmountWithConversions => ({
  amount: formatted,
  unit: 'BTC',
  estimated: false,
  conversions: { [fiat]: formatted },
});

// Account groups in list order: Bitcoin, Ethereum, Litecoin, then ERC20 tokens.
const groupRank = (account: TAccount) => {
  if (account.isToken) {
    return 3;
  }
  if (isBitcoinOnly(account.coinCode)) {
    return 0;
  }
  if (isEthereumBased(account.coinCode)) {
    return 1;
  }
  return isBitcoinBased(account.coinCode) ? 2 : 4;
};

// Accounts grouped by type for display, in the backend's order within each group.
export const orderAccounts = (accounts: TAccount[] | undefined) => (
  accounts ? [...accounts].sort((a, b) => groupRank(a) - groupRank(b)) : undefined
);

// Share of each coin in the portfolio, from the backend's unformatted fiat conversions.
export const allocation = (amounts: (TAmountWithConversions | undefined)[], fiat: string) => {
  const values = amounts.map(amount => Number(amount?.unformattedConversions?.[fiat as 'USD'] || 0));
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  return values.map(value => value / total);
};
