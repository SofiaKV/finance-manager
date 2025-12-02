// test/finance.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthResponse, Budget } from '../src/types';
import { SuperTestResponse } from './test-utils';

describe('FinanceManager E2E', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('реєстрація → логін → створення бюджету → список бюджетів', async () => {
    const server = app.getHttpServer();

    const email = 'e2e@example.com';
    const password = 'password123';

    //Реєстрація
    const registerRes = await request(server)
      .post('/auth/register')
      .send({ email, password });

    expect([201, 400]).toContain(registerRes.status);

    // Логін
    const loginRes: SuperTestResponse<AuthResponse> = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const token: string = loginRes.body.token;
    expect(token).toBeDefined();

    // Створення бюджету
    const createRes: SuperTestResponse<Budget> = await request(server)
      .post('/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'Food',
        amount: 500,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      })
      .expect(201);

    const createdBudget = createRes.body;
    expect(createdBudget.id).toBeDefined();

    // Отримання списку бюджетів
    const listRes = await request(server)
      .get('/budgets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdBudget.id,
          category: 'Food',
          amount: 500,
        }),
      ]),
    );
  });
});
