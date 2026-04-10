export const COIN_ATOMS = 100000000;
export const BYTES_PER_KILOBYTE = 1000;
export const FEE_RATE_UNIT_LABEL = 'NINTONDO/kB';
export const DISPLAY_FEE_RATE_PRECISION = 4;

// Nyancoin/Nintondo node policy:
// - recommended wallet / block minimum fee: 0.01 NINTONDO/kB
// - minimum relay fee: 0.001 NINTONDO/kB
export const RECOMMENDED_MIN_FEE_RATE = 1000;
export const MIN_RELAY_FEE_RATE = 100;
export const INCREMENTAL_RELAY_FEE_RATE = 10;

// Mobile presets mapped from Nyancoin/Nintondo node style presets:
// MINIMUM = 1x, MORE = 2x, WOW = 5x of the recommended minimum fee.
export const DEFAULT_SLOW_FEE_RATE = RECOMMENDED_MIN_FEE_RATE;
export const DEFAULT_MEDIUM_FEE_RATE = RECOMMENDED_MIN_FEE_RATE * 2;
export const DEFAULT_FAST_FEE_RATE = RECOMMENDED_MIN_FEE_RATE * 5;

export const FAST_CONFIRMATION_TARGET_BLOCKS = 1;
export const MEDIUM_CONFIRMATION_TARGET_BLOCKS = 6;
export const SLOW_CONFIRMATION_TARGET_BLOCKS = 24;

export const FAST_CONFIRMATION_LABEL = '1m';
export const MEDIUM_CONFIRMATION_LABEL = '6m';
export const SLOW_CONFIRMATION_LABEL = '24m';

export const FAST_CONFIRMATION_ETA = 'ETA: In ~1 minute';
export const MEDIUM_CONFIRMATION_ETA = 'ETA: In ~6 minutes';
export const SLOW_CONFIRMATION_ETA = 'ETA: In ~24 minutes';

const trimTrailingZeroes = (value: string): string => value.replace(/\.?0+$/, '');

export const feeRateToDisplayValue = (feeRate: number): number => (feeRate * BYTES_PER_KILOBYTE) / COIN_ATOMS;

export const formatFeeRate = (feeRate: number): string => {
  if (!Number.isFinite(feeRate)) return '0';
  return trimTrailingZeroes(feeRateToDisplayValue(feeRate).toFixed(DISPLAY_FEE_RATE_PRECISION));
};

export const formatFeeRateWithUnit = (feeRate: number): string => `${formatFeeRate(feeRate)} ${FEE_RATE_UNIT_LABEL}`;

export const rawFeeRateToDisplayInput = (feeRate: number | string | null | undefined): string => {
  if (feeRate === null || feeRate === undefined || feeRate === '') return '';
  const numericFeeRate = Number(feeRate);
  if (!Number.isFinite(numericFeeRate)) return '';
  return formatFeeRate(numericFeeRate);
};

export const displayFeeRateToRawFeeRate = (displayFeeRate: number): number =>
  Math.max(0, Math.round((displayFeeRate * COIN_ATOMS) / BYTES_PER_KILOBYTE));

export const sanitizeFeeRateInput = (value: string): string => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const [wholePart = '', ...fractionChunks] = normalized.split('.');
  const fractionalPart = fractionChunks.join('').slice(0, DISPLAY_FEE_RATE_PRECISION);

  if (normalized.includes('.')) {
    return `${wholePart || '0'}.${fractionalPart}`;
  }

  return wholePart;
};

export const parseDisplayedFeeRate = (value: string): number | null => {
  if (!value) return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return numericValue;
};

export const rawFeeRateToNodeFeeRate = (feeRate: number): number => feeRate * BYTES_PER_KILOBYTE;

export const nodeFeeRateToRawFeeRate = (feeRatePerKilobyte: number): number =>
  Math.max(0, Math.round(feeRatePerKilobyte / BYTES_PER_KILOBYTE));
