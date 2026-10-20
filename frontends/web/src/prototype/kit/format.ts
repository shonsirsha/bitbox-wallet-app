// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): display-only formatting of backend-provided values.
// No amount arithmetic here: the backend already formats amounts and conversions as strings.

import type { TAmountWithConversions } from '@/api/account';
import { formatLocalizedAmount } from '@/components/amount/amount';

const separators = (locale: string) => {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find(part => part.type === 'group')?.value ?? ',',
    decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
  };
};

const FIAT_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };

export type TFormattedAmount = {
  prefix: string; // e.g. "$" or "CHF "
  integer: string;
  decimals: string; // including the decimal separator, may be ""
  unit: string; // suffix unit for coin amounts, e.g. "BTC"
};

// BitBox groups bitcoin decimals by three after the first two (0.00 197 050), like the current app.
const groupSatDecimals = (decimals: string) => {
  if (decimals.length !== 8) {
    return decimals;
  }
  return `${decimals.slice(0, 2)} ${decimals.slice(2, 5)} ${decimals.slice(5)}`;
};

export const formatCoinAmount = (amount: TAmountWithConversions, locale: string): TFormattedAmount => {
  const { group, decimal } = separators(locale);
  const [integer = '0', decimals = ''] = amount.amount.split('.');
  const isSatGrouped = ['BTC', 'LTC'].includes(amount.unit);
  const shownDecimals = isSatGrouped ? groupSatDecimals(decimals) : decimals.slice(0, 8);
  return {
    prefix: '',
    integer: formatLocalizedAmount(integer, group, decimal),
    decimals: shownDecimals ? `${decimal}${shownDecimals}` : '',
    unit: amount.unit,
  };
};

export const formatFiatAmount = (formatted: string, fiat: string, locale: string): TFormattedAmount => {
  const { group, decimal } = separators(locale);
  const localized = formatLocalizedAmount(formatted.replace(/^-/, ''), group, decimal);
  const index = localized.lastIndexOf(decimal);
  const symbol = FIAT_SYMBOLS[fiat];
  return {
    prefix: symbol ?? `${fiat} `,
    integer: index > 0 ? localized.slice(0, index) : localized,
    decimals: index > 0 ? localized.slice(index) : '',
    unit: '',
  };
};

export const fiatOf = (amount: TAmountWithConversions | undefined, fiat: string) => amount?.conversions?.[fiat as 'USD'];

export const middleEllipsis = (value: string, keep = 8) => (
  value.length > keep * 2 + 3 ? `${value.slice(0, keep)}…${value.slice(-keep)}` : value
);

const DAY = 24 * 60 * 60 * 1000;

export const dayKey = (iso: string | null) => (iso ? new Date(iso).toDateString() : 'pending');

export const formatDayLabel = (iso: string | null, locale: string, month: 'long' | 'short' = 'long') => {
  if (!iso) {
    return 'Pending';
  }
  const date = new Date(iso);
  const today = new Date();
  const diff = Math.round((new Date(today.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / DAY);
  if (diff === 0) {
    return 'Today';
  }
  if (diff === 1) {
    return 'Yesterday';
  }
  const sameYear = date.getFullYear() === today.getFullYear();
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month, ...(sameYear ? {} : { year: 'numeric' }) }).format(date);
};

export const formatMonthLabel = (iso: string | null, locale: string) => {
  if (!iso) {
    return 'Pending';
  }
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(iso));
};

export const formatTime = (iso: string | null, locale: string) => (
  iso ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : ''
);

export const formatShortDate = (iso: string | null, locale: string) => (
  iso ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : ''
);

export const formatDateTime = (iso: string | null, locale: string) => (
  iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : ''
);

export const formatPercent = (value: number | null | undefined, locale: string) => {
  if (value === null || value === undefined || !isFinite(value)) {
    return '';
  }
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2, minimumFractionDigits: 2, signDisplay: 'exceptZero' }).format(value);
};
