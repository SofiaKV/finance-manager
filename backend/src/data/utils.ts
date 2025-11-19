import { TransactionType } from '../types';

export const mapEntityTransactionTypeToEnum = (
  type: string,
): TransactionType => {
  if (type === 'expense') {
    return TransactionType.EXPENSE;
  }
  return TransactionType.INCOME;
};
