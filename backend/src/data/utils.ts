import { TransactionType } from '@fm/transactions';

export const mapEntityTransactionTypeToEnum = (
  type: string,
): TransactionType => {
  if (type === 'expense') {
    return TransactionType.EXPENSE;
  }
  return TransactionType.INCOME;
};
