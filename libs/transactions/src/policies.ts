import type { Transaction } from './types';

export interface OnTransactionDeletedPolicy {
  onDeleted(tx: Transaction): Promise<void>;
}
