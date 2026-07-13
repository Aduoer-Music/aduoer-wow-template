import 'dotenv/config';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

if (!process.env.WOW_API_TOKEN) {
  throw new Error('WOW_API_TOKEN is required');
}

const app = createApp();
const server = app.listen(port, host, (error?: Error) => {
  if (error) throw error;
  console.log(`Wow origin listening on http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
