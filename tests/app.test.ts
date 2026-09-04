import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { sdkVersion } from 'aduoer-wow-sdk';
import { createApp } from '../src/app';

describe('Wow template', () => {
  const app = createApp({ apiToken: 'test-token', exposeOpenApi: true });

  it('返回健康状态和 SDK 版本', async () => {
    const response = await request(app).get('/status').expect(200);
    expect(response.body).toEqual({ status: 'online', version: sdkVersion });
  });

  it('/v1/status 使用 SDK 版本且没有 apiVersion', async () => {
    const response = await request(app)
      .get('/v1/status')
      .set('Authorization', 'test-token')
      .expect(200);

    expect(response.body.data.version).toBe(sdkVersion);
    expect(response.body.data).not.toHaveProperty('apiVersion');
  });

  it('示例 Adapter 返回符合契约的歌曲', async () => {
    const response = await request(app)
      .get('/v1/track?id=hello')
      .set('Authorization', 'test-token')
      .expect(200);

    expect(response.body.data.id).toBe('hello');
  });

  it('示例 Adapter 提供歌曲漫游能力', async () => {
    const status = await request(app)
      .get('/v1/status')
      .set('Authorization', 'test-token')
      .expect(200);
    expect(status.body.data.capabilities).toContain('trackRoam');

    const response = await request(app)
      .get('/v1/track/roam')
      .set('Authorization', 'test-token')
      .expect(200);
    expect(response.body.data).toEqual([expect.objectContaining({ id: 'demo-track' })]);
  });

  it('旧版歌曲漫游地址重定向到新地址', async () => {
    const response = await request(app)
      .get('/v1/track/fm')
      .set('Authorization', 'test-token')
      .expect(308);

    expect(response.headers.location).toBe('/v1/track/roam');
  });

  it('示例 Adapter 返回复数命名的歌词字段', async () => {
    const response = await request(app)
      .get('/v1/track/lyrics?id=hello')
      .set('Authorization', 'test-token')
      .expect(200);

    expect(response.body.data).toEqual({
      lyrics: '[00:00.00]Hello Wow',
      wordLyrics: '',
      translatedLyrics: ''
    });
  });

  it('旧歌词地址重定向到新地址', async () => {
    const response = await request(app)
      .get('/v1/track/lyric?id=hello')
      .set('Authorization', 'test-token')
      .expect(308);

    expect(response.headers.location).toBe('/v1/track/lyrics?id=hello');
  });

  it('公开 SDK OpenAPI', async () => {
    const response = await request(app).get('/openapi.json').expect(200);
    expect(response.body.info.version).toBe(sdkVersion);
    expect(response.body.paths).toHaveProperty('/v1/status');
  });
});
