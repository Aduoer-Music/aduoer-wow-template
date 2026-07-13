import express, { type Express } from 'express';
import { createWowRouter, openApiDocument, sdkVersion } from 'aduoer-wow-sdk';
import { adapter } from './adapter';

export interface AppOptions {
  apiToken?: string;
  corsAllowOrigin?: string;
  exposeOpenApi?: boolean;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const apiToken = options.apiToken ?? process.env.WOW_API_TOKEN;
  const corsAllowOrigin = options.corsAllowOrigin ?? process.env.CORS_ALLOW_ORIGIN ?? '*';

  app.disable('x-powered-by');
  app.use((request, response, next) => {
    response.set({
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': corsAllowOrigin,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    request.method === 'OPTIONS' ? response.status(204).end() : next();
  });
  app.use(express.json({ limit: '1mb' }));

  app.get('/status', (_request, response) => {
    response.json({ status: 'online', version: sdkVersion });
  });

  if (options.exposeOpenApi ?? process.env.NODE_ENV !== 'production') {
    app.get('/openapi.json', (_request, response) => response.json(openApiDocument));
  }

  app.use(createWowRouter({
    resolveContext: ({ authorization }) => {
      if (!apiToken || authorization !== apiToken) return null;
      return {
        adapter,
        qualityMap: [{ key: 'standard', label: '标准音质' }]
      };
    }
  }));

  app.use((_request, response) => {
    response.status(404).json({ code: 404, message: 'API endpoint not found', data: null });
  });

  return app;
}
