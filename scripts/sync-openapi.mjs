import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const source = require.resolve('aduoer-wow-sdk/openapi.json');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'docs/public/openapi.json');

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
console.log(`Synced ${source} -> ${destination}`);
