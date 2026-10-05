import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigrations } from '../src/database/migrations.js';
import { closeDatabase } from '../src/database/connection.js';
import { env } from '../src/config/env.js';
import { resetAIProviderCache } from '../src/services/ai/factory.js';

describe('Error Analysis API Integration Suite', () => {
  let app: ReturnType<typeof createApp>;
  let originalProvider: string;

  beforeAll(() => {
    originalProvider = env.AI_PROVIDER;
    (env as any).AI_PROVIDER = 'mock';
    resetAIProviderCache();
    runMigrations();
    app = createApp();
  });

  afterAll(() => {
    (env as any).AI_PROVIDER = originalProvider;
    resetAIProviderCache();
    closeDatabase();
  });

  it('POST /api/analyze fails with 400 when error_text is empty', async () => {
    const response = await request(app).post('/api/analyze').send({
      error_text: '   ',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('POST /api/analyze succeeds with 200 and returns structured analysis & database ID', async () => {
    const payload = {
      error_text: 'TypeError: Cannot read properties of undefined (reading "map")',
      language: 'TypeScript',
      framework: 'React',
    };

    const response = await request(app).post('/api/analyze').send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toMatch(/^anls_/);
    expect(response.body).toHaveProperty('result');
    expect(response.body.result.error_type).toBe('Runtime Error');
    expect(response.body.result).toHaveProperty('solutions');
  });

  it('GET /api/analyses returns recent saved analysis records', async () => {
    const response = await request(app).get('/api/analyses');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/analyses/:id fetches specific analysis details', async () => {
    // 1. Create analysis
    const createRes = await request(app).post('/api/analyze').send({
      error_text: 'SyntaxError: Unexpected token }',
      language: 'JavaScript',
    });

    const createdId = createRes.body.id;

    // 2. Query detail by ID
    const detailRes = await request(app).get(`/api/analyses/${createdId}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.id).toBe(createdId);
    expect(detailRes.body.error_text).toBe('SyntaxError: Unexpected token }');
  });

  it('DELETE /api/analyses/:id deletes an analysis record', async () => {
    // 1. Create analysis
    const createRes = await request(app).post('/api/analyze').send({
      error_text: 'Error: Connection refused',
      language: 'Go',
    });

    const createdId = createRes.body.id;

    // 2. Delete record
    const deleteRes = await request(app).delete(`/api/analyses/${createdId}`);
    expect(deleteRes.status).toBe(200);

    // 3. Confirm 404 on subsequent fetch
    const fetchRes = await request(app).get(`/api/analyses/${createdId}`);
    expect(fetchRes.status).toBe(404);
  });
});
