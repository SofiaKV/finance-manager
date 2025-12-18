const { randomUUID } = require('crypto');

const API_URL = 'http://localhost:3000/api';

// Helper to generate random data
const randomString = () => Math.random().toString(36).substring(7);
const randomAmount = () => Math.floor(Math.random() * 1000) + 1;

async function request(url, method = 'GET', body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${text}`);
  }
  return response.json();
}

async function runLoadTest() {
  console.log('Starting Load Test...');
  const startTime = Date.now();
  
  const userEmail = `test-${randomString()}@example.com`;
  const userPassword = 'password123';
  const userName = 'Load Test User';

  try {
    // 1. Register
    console.log(`Registering user: ${userEmail}`);
    const regStart = Date.now();
    const regRes = await request(`${API_URL}/auth/register`, 'POST', {
      email: userEmail,
      password: userPassword,
      name: userName
    });
    console.log(`Registration took: ${Date.now() - regStart}ms`);
    
    const token = regRes.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Create Budget
    console.log('Creating budget...');
    const budgetStart = Date.now();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    await request(`${API_URL}/budgets`, 'POST', {
      category: 'Food',
      amount: 5000,
      period: 'MONTHLY',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, headers);
    console.log(`Budget creation took: ${Date.now() - budgetStart}ms`);

    // 3. Create Transactions (Parallel)
    console.log('Creating 50 transactions...');
    const txStart = Date.now();
    const txPromises = [];
    for (let i = 0; i < 50; i++) {
      txPromises.push(request(`${API_URL}/transactions`, 'POST', {
        amount: randomAmount(),
        type: i % 2 === 0 ? 'expense' : 'income',
        category: i % 2 === 0 ? 'Food' : 'Salary',
        date: new Date().toISOString(),
        description: `Transaction ${i}`
      }, headers));
    }
    await Promise.all(txPromises);
    console.log(`50 Transactions creation took: ${Date.now() - txStart}ms`);

    // 4. Get Transactions (Simulate Dashboard load)
    console.log('Fetching transactions (No filters)...');
    const getTxStart = Date.now();
    await request(`${API_URL}/transactions`, 'GET', null, headers);
    console.log(`Fetch all transactions took: ${Date.now() - getTxStart}ms`);

    // 5. Get Transactions with Filter (Simulate Search)
    console.log('Fetching transactions (With Date Filter)...');
    const getTxFilterStart = Date.now();
    const filterStartDate = new Date();
    filterStartDate.setDate(filterStartDate.getDate() - 1);
    await request(`${API_URL}/transactions?startDate=${filterStartDate.toISOString()}`, 'GET', null, headers);
    console.log(`Fetch filtered transactions took: ${Date.now() - getTxFilterStart}ms`);

    // 6. Get Budgets
    console.log('Fetching budgets...');
    const getBudgetsStart = Date.now();
    await request(`${API_URL}/budgets`, 'GET', null, headers);
    console.log(`Fetch budgets took: ${Date.now() - getBudgetsStart}ms`);

  } catch (error) {
    console.error('Load test failed:', error.message);
  }

  console.log(`Total Load Test Time: ${Date.now() - startTime}ms`);
}

runLoadTest();
