import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import * as BlueElectrum from '../blue_modules/BlueElectrum';
import { useStorage } from './context/useStorage';

// Nintondo has 1-minute blocks — poll every 60s when pending txs exist
const POLL_INTERVAL_MS = 60_000;
// Transactions with fewer than 2 confirmations are considered pending
const PENDING_THRESHOLD = 2;

/**
 * Polls for confirmation count updates on pending transactions.
 * Fires immediately on foreground resume, and every 60 s while pending txs exist.
 * Uses a lightweight multiGetTransactionByTxid call instead of a full wallet resync.
 */
const useConfirmationRefresh = () => {
  const { wallets, saveToDisk } = useStorage();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isRefreshingRef = useRef(false);

  // Collect txids of all pending transactions across all wallets
  const getPendingTxids = useCallback((): string[] => {
    const txids = new Set<string>();
    for (const wallet of wallets) {
      for (const tx of wallet.getTransactions()) {
        if ((tx.confirmations ?? 0) < PENDING_THRESHOLD) {
          txids.add(tx.txid);
        }
      }
    }
    return [...txids];
  }, [wallets]);

  const refreshConfirmations = useCallback(async () => {
    if (isRefreshingRef.current) return;
    const pendingTxids = getPendingTxids();
    if (pendingTxids.length === 0) return;

    isRefreshingRef.current = true;
    try {
      await BlueElectrum.waitTillConnected();
      const txData = await BlueElectrum.multiGetTransactionByTxid(pendingTxids, true);

      let changed = false;
      for (const wallet of wallets) {
        // Update confirmations in-place on stored transaction arrays
        const buckets = [
          ...Object.values((wallet as any)._txs_by_external_index ?? {}),
          ...Object.values((wallet as any)._txs_by_internal_index ?? {}),
        ];
        for (const pc of (wallet as any)._receive_payment_codes ?? []) {
          for (const pcBucket of Object.values((wallet as any)._txs_by_payment_code_index?.[pc] ?? {})) {
            buckets.push(pcBucket);
          }
        }
        for (const bucket of buckets) {
          for (const tx of bucket as any[]) {
            const fresh = txData[tx.txid];
            if (fresh && fresh.confirmations !== undefined && fresh.confirmations !== tx.confirmations) {
              tx.confirmations = fresh.confirmations;
              changed = true;
            }
          }
        }
        // Also update legacy single-address wallets
        if ((wallet as any)._txs_by_external_index === undefined) {
          for (const tx of wallet.getTransactions()) {
            const fresh = txData[tx.txid];
            if (fresh && fresh.confirmations !== undefined && fresh.confirmations !== tx.confirmations) {
              tx.confirmations = fresh.confirmations;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        await saveToDisk();
      }
    } catch {
      // Best-effort — silently skip on connection error
    } finally {
      isRefreshingRef.current = false;
    }
  }, [wallets, getPendingTxids, saveToDisk]);

  // Start or stop the polling interval based on whether pending txs exist
  const syncInterval = useCallback(() => {
    const hasPending = getPendingTxids().length > 0;
    if (hasPending && !intervalRef.current) {
      intervalRef.current = setInterval(refreshConfirmations, POLL_INTERVAL_MS);
    } else if (!hasPending && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [getPendingTxids, refreshConfirmations]);

  // Handle foreground resume: fire immediately, then re-evaluate interval
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        refreshConfirmations();
        syncInterval();
      }
      appStateRef.current = nextState;
    };

    const sub = AppState.addEventListener('change', handleAppState);
    syncInterval(); // initial setup on mount

    return () => {
      sub.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshConfirmations, syncInterval]);

  // Re-evaluate interval when wallet list changes (e.g. new unconfirmed tx arrives)
  useEffect(() => {
    syncInterval();
  }, [wallets, syncInterval]);
};

export default useConfirmationRefresh;
