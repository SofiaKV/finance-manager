export interface TransactionEntity {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: string;
  date: Date;
  description: string;
  metadata: object;
  imported: boolean;
  external_id: string;
  transfer_transaction_id: string;
  version: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CategoryEntity {
  id: string;
  user_id: string;
  parent_id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
  is_system: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserEntity {
  id: string;

  email: string;
  password_hash: string;

  name: string;
  timezone: string;
  locale: string;

  email_verified_at: Date;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface AccountEntity {
  id: string;

  user_id: string;

  name: string;
  currency: string;

  initial_balance: number;
  balance: number;

  account_type: string;

  is_active: boolean;

  icon: string | null;
  sort_order: number;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface GoalEntity {
  id: string;

  user_id: string;

  name: string;
  description: string;

  target_amount: number;
  current_saved: number;

  target_date: Date;
  start_date: Date;

  linked_account_ids: object;

  status: string;

  color: string;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BudgetEntity {
  id: string;

  user_id: string;

  name: string;
  period_type: string;

  start_date: Date;
  end_date: Date | null;

  amount: number;

  is_active: boolean;
  alert_threshold: number;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BudgetUsageEntity {
  id: string;

  budget_id: string;

  period_start: Date;
  period_end: Date;

  spent_amount: number;
  income_amount: number;

  transaction_count: number;

  last_calculated_at: Date;

  created_at: Date;
  updated_at: Date;
}
