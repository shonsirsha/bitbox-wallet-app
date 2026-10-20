// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): deterministic demo wallet behind the mock backend.
// Everything is derived from one set of transactions and one price history, so balances,
// the portfolio chart and the summary agree with each other.

import type {
  AccountCode,
  CoinCode,
  CoinUnit,
  TAccount,
  TAccountsBalanceSummary,
  TAmountsByCoin,
  TAmountWithConversions,
  TBalance,
  TChartData,
  TKeystore,
  TTransaction,
  TTransactionStatus,
  TTransactionType,
} from '@/api/account';

export const ROOT_FINGERPRINT = 'f2a91c07';
export const LIGHTNING_FINGERPRINT = 'b7e41d90';
export const DEVICE_ID = 'bitbox02-demo';
export const DEVICE_NAME = 'My BitBox';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const NOW = Date.now();

// Fiat units the demo converts into (USD is the main fiat).
const FX = { USD: 1, EUR: 0.861, CHF: 0.797, GBP: 0.748 } as const;

// ---------------------------------------------------------------------------------------------
// Deterministic randomness

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const gaussian = (rand: () => number) => {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const randomString = (rand: () => number, charset: string, length: number) => {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += charset[Math.floor(rand() * charset.length)];
  }
  return out;
};

const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const HEX = '0123456789abcdef';

// ---------------------------------------------------------------------------------------------
// Formatting, mimicking the backend (apostrophe thousands separator).

const group = (int: string) => int.replace(/\B(?=(\d{3})+(?!\d))/g, '\'');

export const formatFiat = (value: number) => {
  const [int, dec] = Math.abs(value).toFixed(2).split('.');
  return `${value < 0 ? '-' : ''}${group(int as string)}.${dec}`;
};

const trimDecimals = (value: string) => value.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');

// ---------------------------------------------------------------------------------------------
// Coins and price history

type TCoinDef = {
  code: CoinCode;
  unit: CoinUnit;
  name: string;
  decimals: number;
  trimTrailingZeros: boolean;
  priceUSD: number;
  startPriceUSD: number;
  volatility: number;
  blocksPerDay: number;
  confirmationsComplete: number;
  explorerTx: string;
  explorerAddress: string;
  // [days ago, USD price] anchors of the price history, newest last.
  keyframes: [number, number][];
};

const COINS: Record<'btc' | 'ltc' | 'eth' | 'usdc', TCoinDef> = {
  btc: {
    code: 'btc', unit: 'BTC', name: 'Bitcoin', decimals: 8, trimTrailingZeros: false,
    priceUSD: 104_250, startPriceUSD: 41_000, volatility: 0.012, blocksPerDay: 144, confirmationsComplete: 6,
    explorerTx: 'https://mempool.space/tx/', explorerAddress: 'https://mempool.space/address/',
    keyframes: [[1095, 41_000], [900, 52_000], [760, 68_000], [640, 61_000], [520, 72_000], [420, 91_000], [365, 87_500], [300, 82_000], [200, 94_000], [120, 99_000], [60, 97_200], [30, 100_900], [7, 102_700], [0, 104_250]],
  },
  ltc: {
    code: 'ltc', unit: 'LTC', name: 'Litecoin', decimals: 8, trimTrailingZeros: false,
    priceUSD: 91.4, startPriceUSD: 70.5, volatility: 0.015, blocksPerDay: 576, confirmationsComplete: 6,
    explorerTx: 'https://blockchair.com/litecoin/transaction/', explorerAddress: 'https://blockchair.com/litecoin/address/',
    keyframes: [[1095, 70.5], [700, 84], [500, 68], [365, 79], [180, 86], [30, 89.5], [7, 90.2], [0, 91.4]],
  },
  eth: {
    code: 'eth', unit: 'ETH', name: 'Ethereum', decimals: 18, trimTrailingZeros: true,
    priceUSD: 3_862, startPriceUSD: 1_950, volatility: 0.016, blocksPerDay: 7_200, confirmationsComplete: 12,
    explorerTx: 'https://etherscan.io/tx/', explorerAddress: 'https://etherscan.io/address/',
    keyframes: [[1095, 1_950], [800, 2_300], [600, 3_500], [500, 2_900], [400, 2_450], [365, 2_600], [250, 3_100], [120, 3_500], [30, 3_720], [7, 3_800], [0, 3_862]],
  },
  usdc: {
    code: 'eth-erc20-usdc', unit: 'USDC', name: 'USD Coin', decimals: 6, trimTrailingZeros: true,
    priceUSD: 1, startPriceUSD: 1, volatility: 0.0004, blocksPerDay: 7_200, confirmationsComplete: 12,
    explorerTx: 'https://etherscan.io/tx/', explorerAddress: 'https://etherscan.io/address/',
    keyframes: [[1095, 1], [0, 1]],
  },
};

type TCoinKey = keyof typeof COINS;

const HISTORY_DAYS = 3 * 365;
const startOfDay = (ts: number) => ts - (ts % DAY);
const HISTORY_START = startOfDay(NOW) - HISTORY_DAYS * DAY;

// Daily prices from HISTORY_START to today: smooth interpolation between the coin's keyframes
// (in log space) plus a little smoothed, seeded noise so the chart looks like a market.
const buildPriceHistory = (coin: TCoinDef, seed: number) => {
  const rand = rng(seed);
  const raw: number[] = [];
  for (let i = 0; i <= HISTORY_DAYS; i++) {
    raw.push(gaussian(rand));
  }
  const smooth = raw.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 3); j <= Math.min(HISTORY_DAYS, i + 3); j++) {
      sum += raw[j] as number;
      count++;
    }
    return sum / count;
  });
  const frames = [...coin.keyframes].sort((a, b) => b[0] - a[0]);
  return smooth.map((noise, i) => {
    const daysAgo = HISTORY_DAYS - i;
    const nextIndex = Math.max(1, frames.findIndex(([ago]) => ago <= daysAgo));
    const [agoA, priceA] = frames[nextIndex - 1] as [number, number];
    const [agoB, priceB] = frames[nextIndex] as [number, number];
    const t = agoA === agoB ? 1 : (agoA - daysAgo) / (agoA - agoB);
    const eased = t * t * (3 - 2 * t);
    const logPrice = Math.log(priceA) + (Math.log(priceB) - Math.log(priceA)) * eased;
    // Noise fades out towards today so the last point is exactly the current price.
    const fade = Math.min(1, daysAgo / 3);
    return Math.exp(logPrice + noise * coin.volatility * fade * 1.6);
  });
};

const PRICE_HISTORY: Record<TCoinKey, number[]> = {
  btc: buildPriceHistory(COINS.btc, 11),
  ltc: buildPriceHistory(COINS.ltc, 23),
  eth: buildPriceHistory(COINS.eth, 37),
  usdc: buildPriceHistory(COINS.usdc, 41),
};

const priceAt = (coin: TCoinKey, ts: number) => {
  const history = PRICE_HISTORY[coin];
  const index = Math.min(history.length - 1, Math.max(0, Math.round((startOfDay(ts) - HISTORY_START) / DAY)));
  if (ts >= startOfDay(NOW)) {
    return COINS[coin].priceUSD;
  }
  return history[index] as number;
};

// ---------------------------------------------------------------------------------------------
// Amounts

const formatCoin = (coin: TCoinKey, value: number) => {
  const def = COINS[coin];
  const fixed = Math.abs(value).toFixed(Math.min(def.decimals, 12));
  return def.trimTrailingZeros ? trimDecimals(fixed) : fixed;
};

export const amountWithConversions = (coin: TCoinKey, value: number, priceUSD: number): TAmountWithConversions => {
  const usd = value * priceUSD;
  const btc = usd / COINS.btc.priceUSD;
  const conversions = {
    USD: formatFiat(usd),
    EUR: formatFiat(usd * FX.EUR),
    CHF: formatFiat(usd * FX.CHF),
    GBP: formatFiat(usd * FX.GBP),
    BTC: (coin === 'btc' ? value : btc).toFixed(8),
    sat: String(Math.round((coin === 'btc' ? value : btc) * 1e8)),
  };
  const unformattedConversions = {
    USD: usd.toFixed(2),
    EUR: (usd * FX.EUR).toFixed(2),
    CHF: (usd * FX.CHF).toFixed(2),
    GBP: (usd * FX.GBP).toFixed(2),
    BTC: conversions.BTC,
    sat: conversions.sat,
  };
  return {
    amount: formatCoin(coin, value),
    unit: COINS[coin].unit,
    conversions,
    unformattedConversions,
    estimated: false,
  };
};

// The backend sends an empty unit for the fee of incoming transactions.
const emptyAmount = (): TAmountWithConversions => ({ amount: '', unit: '' as unknown as CoinUnit, estimated: false });

// ---------------------------------------------------------------------------------------------
// Accounts

const keystore = (): TKeystore => ({
  watchonly: false,
  rootFingerprint: ROOT_FINGERPRINT,
  name: DEVICE_NAME,
  lastConnected: new Date(NOW - 2 * 60 * 1000).toISOString(),
  connected: true,
});

type TAccountDef = {
  code: AccountCode;
  name: string;
  coin: TCoinKey;
  number: number;
  parent?: AccountCode;
  seed: number;
};

const ETH_CODE = `v0-${ROOT_FINGERPRINT}-eth-0`;

// User-chosen account names that differ from the coin names, as real wallets usually look.
const ACCOUNT_DEFS: TAccountDef[] = [
  { code: `v0-${ROOT_FINGERPRINT}-btc-0`, name: 'Savings', coin: 'btc', number: 0, seed: 101 },
  { code: `v0-${ROOT_FINGERPRINT}-btc-1`, name: 'Daily spending', coin: 'btc', number: 1, seed: 202 },
  { code: ETH_CODE, name: 'Business', coin: 'eth', number: 0, seed: 303 },
  { code: `${ETH_CODE}-eth-erc20-usdc`, name: 'Payroll reserve', coin: 'usdc', number: 0, parent: ETH_CODE, seed: 404 },
  { code: `v0-${ROOT_FINGERPRINT}-ltc-0`, name: 'Donations', coin: 'ltc', number: 0, seed: 505 },
];

export const getAccountDef = (code: AccountCode) => ACCOUNT_DEFS.find(def => def.code === code);

// ---------------------------------------------------------------------------------------------
// Transactions

type TTxSpec = {
  ts: number;
  type: TTransactionType;
  value: number; // coin amount moved (excluding fee); for send_to_self the amount sent to self
  fee: number;
  note?: string;
  status?: TTransactionStatus;
  confirmations?: number;
};

const monthsAgo = (months: number, day: number) => {
  const date = new Date(NOW);
  date.setUTCMonth(date.getUTCMonth() - months, day);
  date.setUTCHours(9 + (months % 8), (months * 7) % 60, 0, 0);
  return date.getTime();
};

const TX_SPECS: Record<AccountCode, (rand: () => number) => TTxSpec[]> = {
  // Long-term savings: monthly buys in, a few larger moves out.
  [`v0-${ROOT_FINGERPRINT}-btc-0`]: (rand) => {
    const specs: TTxSpec[] = [];
    for (let m = 30; m >= 1; m--) {
      specs.push({ ts: monthsAgo(m, 25), type: 'receive', value: 0.009 + rand() * 0.014, fee: 0, note: 'Monthly savings' });
    }
    specs.push({ ts: monthsAgo(22, 3), type: 'send_to_self', value: 0.0821, fee: 0.0000412, note: 'Consolidate UTXOs' });
    specs.push({ ts: monthsAgo(17, 14), type: 'send', value: 0.0485, fee: 0.0000286 });
    specs.push({ ts: monthsAgo(11, 8), type: 'send', value: 0.0312, fee: 0.0000154, note: 'Tax payment' });
    specs.push({ ts: monthsAgo(6, 19), type: 'send_to_self', value: 0.1503, fee: 0.0000231 });
    specs.push({ ts: monthsAgo(2, 4), type: 'send', value: 0.0214, fee: 0.0000098 });
    specs.push({ ts: NOW - 37 * 60 * 1000, type: 'receive', value: 0.0052, fee: 0, status: 'pending', confirmations: 0 });
    return specs;
  },
  // Spending: frequent small payments, refilled now and then.
  [`v0-${ROOT_FINGERPRINT}-btc-1`]: (rand) => {
    const specs: TTxSpec[] = [];
    const notes = ['Hosting', 'Groceries', '', 'Coffee beans', '', 'Book', 'Concert tickets', '', 'Dinner', 'Domain renewal'];
    for (let m = 14; m >= 0; m -= 2) {
      specs.push({ ts: monthsAgo(m, 2), type: 'receive', value: 0.008 + rand() * 0.006, fee: 0, note: 'Top-up' });
    }
    for (let i = 0; i < 22; i++) {
      const ts = NOW - (2 + i * 19 + rand() * 9) * DAY;
      specs.push({ ts, type: 'send', value: 0.0004 + rand() * 0.0031, fee: 0.0000021 + rand() * 0.000006, note: notes[i % notes.length] });
    }
    specs.push({ ts: NOW - 5 * HOUR, type: 'send', value: 0.00084, fee: 0.0000035, note: 'Lunch', status: 'pending', confirmations: 0 });
    return specs;
  },
  [ETH_CODE]: (rand) => [
    { ts: monthsAgo(26, 11), type: 'receive', value: 0.82, fee: 0 },
    { ts: monthsAgo(19, 6), type: 'receive', value: 0.5 + rand() * 0.1, fee: 0 },
    { ts: monthsAgo(14, 21), type: 'send', value: 0.12, fee: 0.00042 },
    { ts: monthsAgo(9, 2), type: 'receive', value: 0.25, fee: 0 },
    { ts: monthsAgo(7, 17), type: 'send', value: 0.18, fee: 0.0021, status: 'failed' },
    { ts: monthsAgo(3, 9), type: 'send', value: 0.07, fee: 0.00031 },
    { ts: monthsAgo(1, 27), type: 'receive', value: 0.031, fee: 0 },
  ],
  [`${ETH_CODE}-eth-erc20-usdc`]: () => [
    { ts: monthsAgo(12, 4), type: 'receive', value: 1500, fee: 0 },
    { ts: monthsAgo(8, 15), type: 'receive', value: 2000, fee: 0 },
    { ts: monthsAgo(5, 1), type: 'send', value: 650, fee: 0 },
    { ts: monthsAgo(2, 22), type: 'send', value: 400, fee: 0 },
  ],
  [`v0-${ROOT_FINGERPRINT}-ltc-0`]: () => [
    { ts: monthsAgo(28, 9), type: 'receive', value: 3.5, fee: 0 },
    { ts: monthsAgo(15, 13), type: 'receive', value: 1.25, fee: 0 },
    { ts: monthsAgo(4, 30), type: 'send', value: 0.5439, fee: 0.0000226 },
  ],
};

const blockAge = (coin: TCoinKey, ts: number) => Math.max(1, Math.floor(((NOW - ts) / DAY) * COINS[coin].blocksPerDay));

const ownAddress = (coin: TCoinKey, rand: () => number) => {
  switch (coin) {
  case 'btc':
    return `bc1q${randomString(rand, BECH32, 38)}`;
  case 'ltc':
    return `ltc1q${randomString(rand, BECH32, 38)}`;
  default:
    return `0x${randomString(rand, HEX, 40)}`;
  }
};

const externalAddress = (coin: TCoinKey, rand: () => number) => {
  if (coin === 'btc' && rand() > 0.6) {
    return `bc1p${randomString(rand, BECH32, 58)}`;
  }
  return ownAddress(coin, rand);
};

const buildTransactions = (def: TAccountDef): TTransaction[] => {
  const rand = rng(def.seed);
  const specs = (TX_SPECS[def.code]?.(rand) || []).sort((a, b) => b.ts - a.ts);
  const feeCoin: TCoinKey = def.coin === 'usdc' ? 'eth' : def.coin;
  return specs.map((spec): TTransaction => {
    const txID = def.coin === 'btc' || def.coin === 'ltc'
      ? randomString(rand, HEX, 64)
      : `0x${randomString(rand, HEX, 64)}`;
    const priceNow = COINS[def.coin].priceUSD;
    const priceThen = priceAt(def.coin, spec.ts);
    const feePriceThen = priceAt(feeCoin, spec.ts);
    const isBitcoinLike = def.coin === 'btc' || def.coin === 'ltc';
    const vsize = isBitcoinLike && spec.type !== 'receive' ? 141 + Math.floor(rand() * 120) : 0;
    const status = spec.status || 'complete';
    const deducted = spec.type === 'receive'
      ? 0
      : spec.type === 'send_to_self'
        ? spec.fee
        : spec.value + (feeCoin === def.coin ? spec.fee : 0);
    return {
      txID,
      internalID: txID,
      numConfirmations: spec.confirmations ?? blockAge(def.coin, spec.ts),
      numConfirmationsComplete: COINS[def.coin].confirmationsComplete,
      type: spec.type,
      status,
      amount: amountWithConversions(def.coin, spec.value, priceNow),
      amountAtTime: amountWithConversions(def.coin, spec.value, priceThen),
      deductedAmountAtTime: amountWithConversions(def.coin, deducted, priceThen),
      fee: spec.type === 'receive' ? emptyAmount() : amountWithConversions(feeCoin, spec.fee, feePriceThen),
      time: new Date(spec.ts).toISOString(),
      addresses: [spec.type === 'send' ? externalAddress(def.coin, rand) : ownAddress(def.coin, rand)],
      note: spec.note || '',
      vsize,
      size: vsize ? vsize + 79 : 0,
      weight: vsize * 4,
      feeRateInfo: vsize && spec.fee ? `${(spec.fee * 1e8 / vsize).toFixed(1)} sat/vB` : '',
      gas: isBitcoinLike ? 0 : (def.coin === 'usdc' ? 65_000 : 21_000),
      nonce: isBitcoinLike ? null : Math.floor(rand() * 90),
    };
  });
};

// Signed effect of a transaction on the account balance at its time (only confirmed or pending).
const balanceDelta = (tx: TTransaction, coin: TCoinKey, spec: { fee: number; value: number }) => {
  if (tx.status === 'failed') {
    // A failed transaction still burns the fee on Ethereum.
    return coin === 'eth' ? -spec.fee : 0;
  }
  switch (tx.type) {
  case 'receive':
    return spec.value;
  case 'send_to_self':
    return -spec.fee;
  default:
    return -(spec.value + (coin === 'usdc' ? 0 : spec.fee));
  }
};

type TAccountState = {
  def: TAccountDef;
  account: TAccount;
  transactions: TTransaction[];
  available: number;
  incoming: number;
  // Balance after each transaction (oldest first), for the chart.
  history: { ts: number; balance: number }[];
};

const parse = (amount: string) => Number(amount.replace(/'/g, '')) || 0;

const buildAccountState = (def: TAccountDef): TAccountState => {
  const coin = COINS[def.coin];
  const transactions = buildTransactions(def);
  let available = 0;
  let incoming = 0;
  const history: { ts: number; balance: number }[] = [];
  [...transactions].reverse().forEach(tx => {
    const spec = { value: parse(tx.amount.amount), fee: parse(tx.fee.amount) };
    const delta = balanceDelta(tx, def.coin, spec);
    if (tx.status === 'pending' && tx.type === 'receive') {
      incoming += delta;
      return;
    }
    available += delta;
    history.push({ ts: new Date(tx.time as string).getTime(), balance: available });
  });
  const account: TAccount = {
    keystore: keystore(),
    active: true,
    coinCode: coin.code,
    coinUnit: coin.unit,
    code: def.code,
    name: def.name,
    isToken: !!def.parent,
    coinName: coin.name,
    blockExplorerTxPrefix: coin.explorerTx,
    blockExplorerAddressPrefix: coin.explorerAddress,
    accountNumber: def.number,
    ...(def.coin === 'eth' ? { activeTokens: [{ tokenCode: 'eth-erc20-usdc' as const, accountCode: `${ETH_CODE}-eth-erc20-usdc` }] } : {}),
    ...(def.coin === 'usdc' ? { contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } : {}),
  };
  return { def, account, transactions, available, incoming, history };
};

export const ACCOUNT_STATES: TAccountState[] = ACCOUNT_DEFS.map(buildAccountState);

export const getAccountState = (code: AccountCode) => ACCOUNT_STATES.find(state => state.def.code === code);

export const getAccounts = (): TAccount[] => ACCOUNT_STATES.map(state => state.account);

export const getBalance = (code: AccountCode): TBalance | undefined => {
  const state = getAccountState(code);
  if (!state) {
    return undefined;
  }
  const price = COINS[state.def.coin].priceUSD;
  return {
    hasAvailable: state.available > 0,
    available: amountWithConversions(state.def.coin, state.available, price),
    hasIncoming: state.incoming > 0,
    incoming: amountWithConversions(state.def.coin, state.incoming, price),
  };
};

// ---------------------------------------------------------------------------------------------
// Lightning (separate account in the backend)

export const LIGHTNING = {
  code: `v0-${LIGHTNING_FINGERPRINT}-ln-0`,
  sats: 215_400,
};

const lightningBtc = () => LIGHTNING.sats / 1e8;

// ---------------------------------------------------------------------------------------------
// Summary and chart

const holdingsAt = (state: TAccountState, ts: number) => {
  let balance = 0;
  for (const point of state.history) {
    if (point.ts > ts) {
      break;
    }
    balance = point.balance;
  }
  return balance;
};

const portfolioValueAt = (ts: number, priceFor: (coin: TCoinKey, ts: number) => number) => (
  ACCOUNT_STATES.reduce((sum, state) => sum + holdingsAt(state, ts) * priceFor(state.def.coin, ts), 0)
  + lightningBtc() * priceFor('btc', ts) * (ts > NOW - 200 * DAY ? 1 : 0)
);

export const totalUSD = () => portfolioValueAt(NOW, (coin) => COINS[coin].priceUSD);

export const getBalanceSummary = (): TAccountsBalanceSummary => {
  const byCoin = new Map<TCoinKey, number>();
  ACCOUNT_STATES.forEach(state => byCoin.set(state.def.coin, (byCoin.get(state.def.coin) || 0) + state.available));
  const coinsBalance: TAmountsByCoin = {};
  const coinsTotalBalance: TAccountsBalanceSummary['coinsTotalBalance'] = [
    {
      coinCode: 'lightning',
      coinName: 'Lightning',
      formattedAmount: amountWithConversions('btc', lightningBtc(), COINS.btc.priceUSD),
    },
  ];
  byCoin.forEach((value, coin) => {
    const formattedAmount = amountWithConversions(coin, value, COINS[coin].priceUSD);
    coinsBalance[COINS[coin].code] = formattedAmount;
    coinsTotalBalance.push({ coinCode: COINS[coin].code, coinName: COINS[coin].name, formattedAmount });
  });
  const keystoreTotal = ACCOUNT_STATES.reduce((sum, state) => sum + state.available * COINS[state.def.coin].priceUSD, 0);
  return {
    keystoresBalance: {
      [ROOT_FINGERPRINT]: { fiatUnit: 'USD', total: formatFiat(keystoreTotal), coinsBalance },
    },
    coinsTotalBalance,
  };
};

const hourlyPrice = (coin: TCoinKey, ts: number) => {
  // Small deterministic intraday wiggle on top of the daily price.
  const base = priceAt(coin, ts);
  const wiggle = Math.sin(ts / HOUR / 3.7 + coin.length) * 0.006 + Math.sin(ts / HOUR / 11.3) * 0.009;
  return coin === 'usdc' ? base : base * (1 + wiggle * (ts > NOW - HOUR ? 0 : 1));
};

export const getChartData = (): TChartData => {
  const firstTs = Math.min(...ACCOUNT_STATES.flatMap(state => state.history.map(point => point.ts)));
  const daily: TChartData['chartDataDaily'] = [];
  for (let ts = startOfDay(firstTs); ts <= startOfDay(NOW); ts += DAY) {
    const value = portfolioValueAt(ts + DAY - 1, priceAt);
    daily.push({ time: (ts / 1000) as TChartData['chartDataDaily'][number]['time'], value, formattedValue: formatFiat(value) });
  }
  const hourly: TChartData['chartDataHourly'] = [];
  const hourStart = NOW - (NOW % HOUR) - 7 * DAY;
  for (let ts = hourStart; ts <= NOW; ts += HOUR) {
    const value = portfolioValueAt(ts, hourlyPrice);
    hourly.push({ time: (ts / 1000) as TChartData['chartDataHourly'][number]['time'], value, formattedValue: formatFiat(value) });
  }
  const total = totalUSD();
  // Price-only return of today's holdings over each range.
  const performance = (from: number) => {
    const holdingsNow = (coin: TCoinKey) => ACCOUNT_STATES
      .filter(state => state.def.coin === coin)
      .reduce((sum, state) => sum + state.available, 0) + (coin === 'btc' ? lightningBtc() : 0);
    const valueWith = (ts: number) => (Object.keys(COINS) as TCoinKey[])
      .reduce((sum, coin) => sum + holdingsNow(coin) * priceAt(coin, ts), 0);
    return valueWith(NOW) / valueWith(from) - 1;
  };
  return {
    chartDataMissing: false,
    chartDataDaily: daily,
    chartDataHourly: hourly,
    chartFiat: 'USD',
    chartPerformance: {
      week: { moneyWeightedReturn: performance(NOW - 7 * DAY), startTimestamp: Math.floor((NOW - 7 * DAY) / 1000) },
      month: { moneyWeightedReturn: performance(NOW - 30 * DAY), startTimestamp: Math.floor((NOW - 30 * DAY) / 1000) },
      year: { moneyWeightedReturn: performance(NOW - 365 * DAY), startTimestamp: Math.floor((NOW - 365 * DAY) / 1000) },
      all: { moneyWeightedReturn: performance(firstTs), startTimestamp: null },
    },
    chartTotal: total,
    formattedChartTotal: formatFiat(total),
    chartIsUpToDate: true,
    lastTimestamp: NOW,
  };
};

export const fiatPrice = (coinCode: string): TAmountWithConversions | undefined => {
  const key = (Object.keys(COINS) as TCoinKey[]).find(coin => COINS[coin].code === coinCode);
  if (!key) {
    return undefined;
  }
  return amountWithConversions(key, 1, COINS[key].priceUSD);
};

export const lightningBalance = () => {
  const amount = amountWithConversions('btc', lightningBtc(), COINS.btc.priceUSD);
  return { hasAvailable: true, available: amount, hasIncoming: false, incoming: amountWithConversions('btc', 0, COINS.btc.priceUSD) };
};
