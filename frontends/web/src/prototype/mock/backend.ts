// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): in-memory stand-in for the Go backend's HTTP API.
// Unknown endpoints answer `null` and are logged once with a `[prototype mock]` prefix.

import configFixture from './fixtures/config.json';
import configDefaultFixture from './fixtures/config-default.json';
import regionCodesFixture from './fixtures/market-region-codes.json';
import {
  DEVICE_ID,
  DEVICE_NAME,
  LIGHTNING,
  LIGHTNING_FINGERPRINT,
  ROOT_FINGERPRINT,
  fiatPrice,
  getAccountState,
  getAccounts,
  getBalance,
  getBalanceSummary,
  getChartData,
  lightningBalance,
} from './demo-data';
import { pushEvent } from './events';

type TQuery = URLSearchParams;
type THandler = (match: RegExpMatchArray, query: TQuery, body?: unknown) => unknown;

// Config is mutable so settings toggled in the UI (hide amounts, dark mode, ...) stick for the session.
const config = structuredClone(configFixture) as typeof configFixture & { frontend: Record<string, unknown> };
config.backend.mainFiat = 'USD';
config.backend.fiatList = ['USD', 'CHF', 'EUR', 'BTC', 'sat'];
config.backend.startInTestnet = false;
config.frontend.guideShown = false;
config.frontend.hideAmounts = false;

// ?lang=de / ?lang=ar: report that language as the user's choice so the app's own i18n applies it.
const langParam = new URLSearchParams(window.location.search).get('lang');
if (langParam) {
  config.backend.userLanguage = langParam;
}

const deviceInfo = {
  initialized: true,
  mnemonicPassphraseEnabled: false,
  name: DEVICE_NAME,
  securechipModel: 'ATECC608B',
  version: '9.24.0',
  bluetooth: null,
};

const accountStatus = { disabled: false, synced: true, offlineError: null, fatalError: false };

const GET: [RegExp, THandler][] = [
  [/^version$/, () => '4.52.0'],
  [/^testing$/, () => false],
  [/^dev-servers$/, () => false],
  [/^config$/, () => config],
  [/^config\/default$/, () => configDefaultFixture],
  [/^native-locale$/, () => langParam || navigator.language || 'en-US'],
  [/^number-format$/, () => null],
  [/^online$/, () => true],
  [/^using-mobile-data$/, () => false],
  // The current app (variant 0) follows the prototype's theme setting (dark by default).
  [/^detect-dark-theme$/, () => {
    let setting: string | null = null;
    try {
      setting = window.localStorage.getItem('prototype-theme-v2');
    } catch {
      // Storage blocked: fall back to the default.
    }
    if (setting === 'light') {
      return false;
    }
    return setting === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  }],
  [/^update/, () => ({ revision: 1, update: null })],
  [/^aopp$/, () => ({ state: 'inactive', errorCode: '', accounts: null, accountCode: '', address: '', displayAddress: '', addressID: '', callback: '', message: '', xpubRequired: false })],
  [/^bluetooth\/state$/, () => ({ bluetoothAvailable: false, bluetoothUnauthorized: false, scanning: false, peripherals: [] })],
  [/^banners\/.+$/, () => null],

  // Keystores and devices: one unlocked BitBox02 with a single wallet.
  [/^keystores$/, () => [{ type: 'hardware' }]],
  [/^keystore\/[^/]+\/features$/, () => ({ success: true, features: { supportsSendToSelf: true } })],
  [/^keystore\/show-backup-banner\/[^/]+$/, () => ({ success: true, fiat: 'USD', threshold: '1\'000.00' })],
  [/^keystore-name/, () => ({ success: true, keystoreName: DEVICE_NAME })],
  [/^devices\/registered$/, () => ({ [DEVICE_ID]: 'bitbox02' })],
  [/^devices\/[^/]+\/bundled-firmware-version$/, () => '9.24.0'],
  [/^devices\/bitbox02\/[^/]+\/status$/, () => 'initialized'],
  [/^devices\/bitbox02\/[^/]+\/info$/, () => ({ success: true, deviceInfo })],
  [/^devices\/bitbox02\/[^/]+\/version$/, () => ({
    currentVersion: '9.24.0', canUpgrade: false, canGotoStartupSettings: true, canBackupWithRecoveryWords: true,
    canCreate12Words: true, canBIP85: true, canChangePassword: true,
  })],
  [/^devices\/bitbox02\/[^/]+\/attestation$/, () => true],
  [/^devices\/bitbox02\/[^/]+\/channel-hash$/, () => ({ hash: '', deviceVerified: true })],
  [/^devices\/bitbox02\/[^/]+\/passphrase$/, () => ({ id: '', phase: '', revision: 0 })],
  [/^devices\/bitbox02\/[^/]+\/root-fingerprint$/, () => ({ success: true, rootFingerprint: ROOT_FINGERPRINT })],
  [/^devices\/bitbox02\/[^/]+\/check-sdcard$/, () => false],
  [/^devices\/bitbox02\/[^/]+\/backups\/list$/, () => ({ success: true, backups: [] })],

  // Accounts
  [/^accounts$/, () => getAccounts()],
  [/^accounts\/balance-summary$/, () => ({ success: true, accountsBalanceSummary: getBalanceSummary() })],
  [/^chart-data/, () => ({ success: true, data: getChartData() })],
  [/^supported-coins$/, () => [
    { coinCode: 'btc', name: 'Bitcoin', canAddAccount: true, suggestedAccountName: 'Bitcoin 3' },
    { coinCode: 'ltc', name: 'Litecoin', canAddAccount: true, suggestedAccountName: 'Litecoin 2' },
    { coinCode: 'eth', name: 'Ethereum', canAddAccount: true, suggestedAccountName: 'Ethereum 2' },
  ]],
  [/^account\/([^/]+)\/status$/, () => accountStatus],
  [/^account\/([^/]+)\/balance$/, ([, code]) => {
    const balance = getBalance(code as string);
    return balance ? { success: true, balance } : { success: false };
  }],
  [/^account\/([^/]+)\/transactions$/, ([, code]) => {
    const state = getAccountState(code as string);
    return state ? { success: true, list: state.transactions } : { success: false };
  }],
  [/^account\/([^/]+)\/transaction$/, ([, code], query) => {
    const state = getAccountState(code as string);
    const transaction = state?.transactions.find(tx => tx.internalID === query.get('id')) || null;
    return { success: true, transaction };
  }],
  [/^account\/([^/]+)\/fee-targets$/, () => ({
    feeTargets: [
      { code: 'low', feeRateInfo: '2 sat/vB' },
      { code: 'economy', feeRateInfo: '3 sat/vB' },
      { code: 'normal', feeRateInfo: '6 sat/vB' },
      { code: 'high', feeRateInfo: '11 sat/vB' },
    ],
    defaultFeeTarget: 'normal',
  })],
  [/^account\/([^/]+)\/has-secure-output$/, () => ({ hasSecureOutput: true, optional: false })],
  [/^account\/([^/]+)\/used-addresses$/, () => ({ success: true, addresses: [] })],
  [/^account\/([^/]+)\/utxos$/, () => ({ success: true, utxos: [] })],
  [/^coins\/([^/]+)\/fiat-prices$/, ([, coin]) => fiatPrice(coin as string) || null],

  // Lightning
  [/^lightning\/account$/, () => ({ rootFingerprint: LIGHTNING_FINGERPRINT, code: LIGHTNING.code, num: 0 })],
  [/^lightning\/balance$/, () => ({ success: true, data: { ...lightningBalance(), fundingLimit: { limitSat: 5_000_000, marginSat: 50_000 } } })],
  [/^lightning\/list-payments$/, () => ({ success: true, data: [] })],
  [/^lightning\/sdk-status$/, () => ({ success: true, data: 'ready' })],

  // Marketplace and swap (enough for the current UI to render)
  [/^market\/region-codes$/, () => regionCodesFixture],
  [/^market\/vendors\/.+$/, () => ({ vendors: ['moonpay', 'pocket', 'btcdirect', 'bitrefill'] })],
  [/^swap\/status$/, () => ({ available: true, connectedKeystore: 'multi' })],
  [/^bitsurance\/url$/, () => 'https://www.bitsurance.eu/?wallet=bitbox&version=1&lang=en'],
];

const POST: [RegExp, THandler][] = [
  // No screen lock configured: the backend answers every authentication with auth-ok.
  [/^(authenticate|force-auth)$/, () => {
    setTimeout(() => pushEvent('auth', { typ: 'auth-result', result: 'authres-ok' }), 30);
    return null;
  }],
  [/^config$/, (_match, _query, body) => {
    Object.assign(config, body);
    return null;
  }],
];

const warned = new Set<string>();

const route = (table: [RegExp, THandler][], method: string, endpoint: string, body?: unknown) => {
  const [path = '', search = ''] = endpoint.split('?');
  const query = new URLSearchParams(search);
  for (const [pattern, handler] of table) {
    const match = path.match(pattern) || endpoint.match(pattern);
    if (match) {
      return { handled: true, result: handler(match, query, body) };
    }
  }
  if (!warned.has(`${method} ${path}`)) {
    warned.add(`${method} ${path}`);
    console.warn(`[prototype mock] unhandled ${method}`, endpoint);
  }
  return { handled: false, result: undefined };
};

export const handleGet = (endpoint: string) => {
  const { result } = route(GET, 'GET', endpoint);
  return result ?? null;
};

export const handlePost = (endpoint: string, body?: unknown) => {
  const { handled, result } = route(POST, 'POST', endpoint, body);
  // Mutations are stubs: report success so flows can continue.
  return handled ? result : { success: true };
};
