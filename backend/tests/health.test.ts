import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigrations } from '../src/database/migrations.js';
import { closeDatabase } from '../src/database/connection.js';

describe('Health Endpoint Integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    runMigrations();
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  it('GET /api/health returns 200 OK with database health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('services');
    expect(response.body.services).toHaveProperty('database', 'ok');
    expect(response.headers).toHaveProperty('x-request-id');
  });

  it('GET /api/unknown-endpoint returns 404 NOT_FOUND', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
