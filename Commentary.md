## 1. Аналіз Frontend (Lighthouse, Web Vitals)

Кроки для запуску:

Встановити Lighthouse CI CLI (якщо ще не встановлено):

```bash
npm install -g @lhci/cli
```

Запустити сам додаток:

```bash
docker compose up --build
```

Запустити аналіз з папки frontend:

```bash
cd frontend
npm run lighthouse
```
Це запустить додаток у режимі preview та виконає серію тестів Lighthouse, зберігши звіт.

## 2. Тест навантаження та Профайлінг

Я створив скрипт навантажувального тестування load-test.js у корені проекту. Він не потребує встановлення додаткових бібліотек (використовує вбудований fetch).

**Сценарій тесту:**

1. Реєстрація нового користувача.
2. Створення бюджету.
3. Створення 50 транзакцій (паралельно).
4. Завантаження всіх транзакцій (імітація Dashboard).
5. Пошук транзакцій за датою (імітація фільтрації).
6. Завантаження бюджетів.

**Як запустити:**

Спочатку:

```bash
docker compose down
docker compose up -d postgres
```

1. **Запустити сервер з профайлером:**
Для аналізу CPU та пам'яті найкраще використовувати вбудований інспектор Node.js.
```bash
# У папці backend
npm run start:debug
```
*Після запуску відкрити Chrome, перейдіть за адресою chrome://inspect, натисніть "Open dedicated DevTools for Node" та почніть запис у вкладці "Profiler" або "Memory".*

2. **Запустіть тест навантаження (в іншому терміналі):**
```bash
# У корені проекту
node load-test.js
```
3. **Зупиніть запис профайлера** після завершення тесту та проаналізуйте графік (Flame Chart).

## 3. Аналіз запитів до БД та коду

Ось декілька знайдених проблем:

**Проблема №1: Фільтрація в пам'яті**

У файлі transactions.service.ts:

```js
async getTransactions(userId: string, filters: TransactionFilters) {
  // 1. Витягуються ВСІ транзакції користувача з БД
  let transactions = await this.transactionDao.getTransactionsByUserId(userId);

  // 2. Фільтрація відбувається тут, у Node.js
  if (filters.startDate) { ... }
}
```

Чому це погано: Якщо у користувача 10,000 транзакцій, сервер завантажить їх усі в пам'ять, а потім відфільтрує. Це призведе до величезного споживання RAM та CPU при зростанні бази.
Рішення: Перенести WHERE умови у SQL запит в TransactionDao.

**Проблема №2: Індекси**

У schema.sql індекси створені коректно:

- idx_transactions_user_id, idx_transactions_date, idx_transactions_category_id існують.
- Але через те, що фільтрація відбувається в коді (див. п.1), ці індекси (крім user_id) не використовуються для фільтрації, що робить їх марними для прискорення пошуку.
Рекомендація:
Змініть TransactionDao.getTransactionsByUserId так, щоб він приймав параметри фільтрації та будував динамічний SQL запит (використовуючи Knex Query Builder), наприклад:

```js
// Приклад правильного підходу
query.where('user_id', userId);
if (filters.startDate) query.andWhere('date', '>=', filters.startDate);
```

**Проблема №3: "N+1" та Агрегація в коді (Сервіс Бюджетів)**

У budgets.service.ts:

```js
async getBudgets(userId) {
  const budgets = await this.budgetDao.getBudgetsByUserId(userId);
  // 1. Знову завантажуються ВСІ транзакції
  const transactions = await this.transactionDao.getTransactionsByUserId(userId);

  // 2. Подвійний цикл у пам'яті для підрахунку витрат
  return budgets.map((budget) => {
    const spent = transactions.filter(...).reduce(...); // Дуже повільно!
    return { ...budget, spent };
  });
}
```

*Оптимізувати BudgetDao: Використати SQL JOIN та GROUP BY для підрахунку витраченого бюджету прямо в запиті (одним запитом замість обробки в пам'яті).*

**Проблема №4: Агрегація:**
Підрахунок суми витрат (SUM(amount)) має виконуватися базою даних, яка робить це в сотні разів швидше за Node.js.