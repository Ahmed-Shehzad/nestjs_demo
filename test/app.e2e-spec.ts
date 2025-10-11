import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure app same as main.ts
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '2',
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v2/users (GET) - should return paginated users list', () => {
    return request(app.getHttpServer())
      .get('/api/v2/users')
      .expect(200)
      .expect((res) => {
        const body = res.body as Record<string, unknown>;
        expect(body).toHaveProperty('isSuccess');
        expect(body).toHaveProperty('value');
        expect(body.isSuccess).toBe(true);

        const value = body.value as Record<string, unknown>;
        expect(value).toHaveProperty('data');
        expect(value).toHaveProperty('links');
        expect(value).toHaveProperty('meta');
        expect(Array.isArray(value.data)).toBe(true);
      });
  });

  it('/api/v2/users (GET) - should handle pagination parameters', () => {
    return request(app.getHttpServer())
      .get('/api/v2/users?page=1&limit=5')
      .expect(200)
      .expect((res) => {
        const body = res.body as Record<string, unknown>;
        expect(body.isSuccess).toBe(true);

        const value = body.value as Record<string, unknown>;
        const meta = value.meta as Record<string, unknown>;
        expect(meta.currentPage).toBe(1);
        expect(meta.itemsPerPage).toBe(5);
      });
  });
});
