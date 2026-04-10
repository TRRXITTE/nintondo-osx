import * as BlueElectrum from '../blue_modules/BlueElectrum';
import { DEFAULT_FAST_FEE_RATE, DEFAULT_MEDIUM_FEE_RATE, DEFAULT_SLOW_FEE_RATE, RECOMMENDED_MIN_FEE_RATE } from './feeRate';

export enum NetworkTransactionFeeType {
  FAST = 'Fast',
  MEDIUM = 'MEDIUM',
  SLOW = 'SLOW',
  CUSTOM = 'CUSTOM',
}

export class NetworkTransactionFee {
  static StorageKey = 'NetworkTransactionFee';

  public fastestFee: number;
  public mediumFee: number;
  public slowFee: number;

  constructor(fastestFee = DEFAULT_FAST_FEE_RATE, mediumFee = DEFAULT_MEDIUM_FEE_RATE, slowFee = DEFAULT_SLOW_FEE_RATE) {
    this.fastestFee = fastestFee;
    this.mediumFee = mediumFee;
    this.slowFee = slowFee;
  }
}

export default class NetworkTransactionFees {
  static async recommendedFees(): Promise<NetworkTransactionFee> {
    try {
      const isDisabled = await BlueElectrum.isDisabled();
      if (isDisabled) {
        throw new Error('Electrum is disabled. Dont attempt to fetch fees');
      }
      const response = await BlueElectrum.estimateFees();
      // Keep wallet/block fee floors aligned with the Nyancoin/Nintondo recommended minimum fee.
      const fast = Math.max(response.fast, DEFAULT_FAST_FEE_RATE);
      const medium = Math.max(response.medium, DEFAULT_MEDIUM_FEE_RATE);
      const slow = Math.max(response.slow, RECOMMENDED_MIN_FEE_RATE);

      if (fast === medium) {
        // exception, if fees are equal lets bump priority fee slightly so actual priority tx is above the rest
        return new NetworkTransactionFee(fast + 10, medium, slow);
      }
      return new NetworkTransactionFee(fast, medium, slow);
    } catch (err) {
      console.warn(err);
      return new NetworkTransactionFee();
    }
  }
}
