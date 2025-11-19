CREATE TABLE users (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(), 

    email            text NOT NULL UNIQUE,   
    password_hash    text NOT NULL,          

    name             text,                  
    timezone         text NOT NULL DEFAULT 'UTC',  
    locale           text NOT NULL DEFAULT 'en',  

    email_verified_at timestamp with time zone,    

    created_at       timestamp with time zone NOT NULL DEFAULT now(),
    updated_at       timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at       timestamp with time zone     
);

CREATE TABLE accounts (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id          uuid NOT NULL REFERENCES users(id),

    name             varchar(100) NOT NULL,     
    currency         varchar(3) NOT NULL,    

    initial_balance  numeric,            
    balance          numeric(15, 2) NOT NULL DEFAULT 0,

    account_type     text NOT NULL CHECK (account_type IN 
                        ('cash', 'checking', 'savings', 'credit', 'investment')),

    is_active        boolean NOT NULL DEFAULT true,

    icon             text,                    
    sort_order       integer,                 

    created_at       timestamp with time zone NOT NULL DEFAULT now(),
    updated_at       timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at       timestamp with time zone     
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

CREATE TABLE categories (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id     uuid REFERENCES users(id),    
    parent_id   uuid REFERENCES categories(id),

    name        varchar(100) NOT NULL,
    type        text NOT NULL CHECK (type IN ('income', 'expense')),

    color       text NOT NULL,
    icon        text,

    is_system   boolean NOT NULL DEFAULT false,
    sort_order  integer,

    created_at  timestamp with time zone NOT NULL DEFAULT now(),
    updated_at  timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at  timestamp with time zone
);

CREATE INDEX idx_categories_user_id   ON categories(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_type      ON categories(type);

CREATE TABLE transactions (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id                  uuid NOT NULL REFERENCES users(id),
    account_id               uuid NOT NULL REFERENCES accounts(id),
    category_id              uuid REFERENCES categories(id),

    amount                   numeric(15,2) NOT NULL, 
    type                     text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),

    date                     timestamp with time zone NOT NULL,

    description              varchar(500),
    metadata                 jsonb,
    imported                 boolean NOT NULL DEFAULT false,

    external_id              text,                               
    transfer_transaction_id  uuid REFERENCES transactions(id),   

    version                  integer NOT NULL DEFAULT 0,         

    created_at               timestamp with time zone NOT NULL DEFAULT now(),
    updated_at               timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at               timestamp with time zone
);

CREATE INDEX idx_transactions_user_id      ON transactions(user_id);
CREATE INDEX idx_transactions_account_id   ON transactions(account_id);
CREATE INDEX idx_transactions_category_id  ON transactions(category_id);
CREATE INDEX idx_transactions_type         ON transactions(type);
CREATE INDEX idx_transactions_date         ON transactions(date);

CREATE TABLE budgets (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id         uuid NOT NULL REFERENCES users(id),

    name            varchar(100) NOT NULL,
    period_type     text NOT NULL CHECK (period_type IN ('monthly', 'weekly', 'yearly', 'custom')),

    start_date      date NOT NULL,
    end_date        date,                 

    amount          numeric(15,2) NOT NULL, 

    is_active       boolean NOT NULL DEFAULT true,
    alert_threshold integer NOT NULL DEFAULT 100, 

    created_at      timestamp with time zone NOT NULL DEFAULT now(),
    updated_at      timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at      timestamp with time zone
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);

CREATE TABLE budget_categories (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    budget_id        uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id      uuid NOT NULL REFERENCES categories(id),

    allocated_amount numeric(15,2) NOT NULL,

    created_at       timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE budget_categories
    ADD CONSTRAINT budget_categories_budget_category_uniq
    UNIQUE (budget_id, category_id);

CREATE INDEX idx_budget_categories_budget_id   ON budget_categories(budget_id);
CREATE INDEX idx_budget_categories_category_id ON budget_categories(category_id);

CREATE TABLE budget_usage (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    budget_id         uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,

    period_start      date NOT NULL,
    period_end        date NOT NULL,

    spent_amount      numeric(15,2) NOT NULL DEFAULT 0,
    income_amount     numeric(15,2),      

    transaction_count integer NOT NULL DEFAULT 0,

    last_calculated_at timestamp with time zone,

    created_at        timestamp with time zone NOT NULL DEFAULT now(),
    updated_at        timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_usage_budget_period
    ON budget_usage(budget_id, period_start);

CREATE TABLE goals (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id           uuid NOT NULL REFERENCES users(id),

    name              varchar(100) NOT NULL,
    description       text,

    target_amount     numeric(15,2) NOT NULL,
    current_saved     numeric(15,2) NOT NULL DEFAULT 0,

    target_date       date,
    start_date        date NOT NULL,

    linked_account_ids jsonb,  

    status            text NOT NULL CHECK (
                        status IN (
                            'not_started',
                            'in_progress',
                            'achieved',
                            'failed',
                            'paused'
                        )
                      ),

    color             text,  

    created_at        timestamp with time zone NOT NULL DEFAULT now(),
    updated_at        timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at        timestamp with time zone
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

CREATE TABLE reports (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id            uuid NOT NULL REFERENCES users(id),

    report_type        text NOT NULL CHECK (
                           report_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')
                       ),

    period_start       date NOT NULL,
    period_end         date NOT NULL,

    total_income       numeric(15,2) NOT NULL,
    total_expense      numeric(15,2) NOT NULL,
    net_income         numeric(15,2) NOT NULL,

    per_category       jsonb,
    per_account        jsonb,

    transaction_count  integer NOT NULL,

    created_at         timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_user_id 
    ON reports(user_id);

CREATE INDEX idx_reports_user_period 
    ON reports(user_id, period_start);

CREATE TABLE audit_logs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id      uuid NOT NULL REFERENCES users(id),

    entity_type  text NOT NULL CHECK (
                    entity_type IN ('transaction', 'account', 'budget', 'goal')
                 ),
    entity_id    uuid NOT NULL,

    action       text NOT NULL CHECK (
                    action IN ('create', 'update', 'delete', 'restore')
                 ),

    old_values   jsonb,
    new_values   jsonb,

    ip_address   text,
    user_agent   text,

    created_at   timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id
    ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at);


CREATE TABLE notifications (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id     uuid NOT NULL REFERENCES users(id),

    type        text NOT NULL CHECK (
                    type IN (
                        'budget_alert',
                        'goal_achieved',
                        'goal_deadline',
                        'import_complete',
                        'system'
                    )
                ),

    title       varchar(200) NOT NULL,
    message     text NOT NULL,

    metadata    jsonb,               

    is_read     boolean NOT NULL DEFAULT false,
    channel     text NOT NULL CHECK (
                    channel IN ('in_app', 'email', 'push')
                ),

    read_at     timestamp with time zone,
    created_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE TABLE sessions (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id        uuid NOT NULL REFERENCES users(id),

    refresh_token  text NOT NULL,     
    device_info    text,                  
    ip_address     text,

    expires_at     timestamp with time zone NOT NULL,
    last_used_at   timestamp with time zone,
    created_at     timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id
    ON sessions(user_id);

CREATE INDEX idx_sessions_refresh_token
    ON sessions(refresh_token);

CREATE INDEX idx_sessions_expires_at
    ON sessions(expires_at);

INSERT INTO categories (id, user_id, parent_id, name, type, color, icon, is_system, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), NULL, NULL, 'Зарплата', 'income', '#00C853', '💰', TRUE, 1, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Фріланс', 'income', '#00C853', '💼', TRUE, 2, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Інвестиції', 'income', '#00C853', '📈', TRUE, 3, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Подарунки', 'income', '#00C853', '🎁', TRUE, 4, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Коригування балансу', 'income', '#00C853', '⚖️', TRUE, 5, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Інше (дохід)', 'income', '#00C853', '➕', TRUE, 6, now(), now()),

  (gen_random_uuid(), NULL, NULL, 'Їжа', 'expense', '#E53935', '🍔', TRUE, 7, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Транспорт', 'expense', '#E53935', '🚗', TRUE, 8, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Розваги', 'expense', '#E53935', '🎉', TRUE, 9, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Житло', 'expense', '#E53935', '🏠', TRUE, 10, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Комунальні', 'expense', '#E53935', '💡', TRUE, 11, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Здоров''я', 'expense', '#E53935', '⚕️', TRUE, 12, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Освіта', 'expense', '#E53935', '📚', TRUE, 13, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Одяг', 'expense', '#E53935', '👔', TRUE, 14, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Подорожі', 'expense', '#E53935', '✈️', TRUE, 15, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Коригування балансу', 'expense', '#E53935', '⚖️', TRUE, 16, now(), now()),
  (gen_random_uuid(), NULL, NULL, 'Інше (витрати)', 'expense', '#E53935', '➖', TRUE, 17, now(), now());
