import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = path.join(ROOT, '.env');
const SECRETS_PATH = path.join(ROOT, 'data', '.secrets', 'admin_api_token');

for (const line of fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/) : []) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m || process.env[m[1]] !== undefined) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[m[1]] = v;
}

const fromEnv = (process.env.ADMIN_API_TOKEN || '').trim();
if (fromEnv) {
  console.log(fromEnv);
  console.error('# source: ADMIN_API_TOKEN from .env (accepted by all dashboards: 6001, 6100, 7000, 8090)');
  process.exit(0);
}

let fromFile = '';
try { fromFile = fs.readFileSync(SECRETS_PATH, 'utf8').trim(); } catch {}
if (fromFile) {
  console.log(fromFile);
  console.error('# source: data/.secrets/admin_api_token (auto-generated; ADMIN_API_TOKEN not set in .env)');
  process.exit(0);
}

console.error('# No admin token configured yet.');
console.error('# It is auto-generated on the first admin request (data/.secrets/admin_api_token)');
console.error('# or set ADMIN_API_TOKEN in .env to pin it.');
process.exit(1);
