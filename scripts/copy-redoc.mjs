// Copies redoc's standalone browser bundle into public/vendor, so api.astro
// can load it as a plain same-origin <script> tag — no bundler-import step,
// matching how redoc ships this file specifically for direct static hosting.

import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.join(process.cwd(), 'node_modules', 'redoc', 'bundles', 'redoc.standalone.js');
const OUT_DIR = path.join(process.cwd(), 'public', 'vendor', 'redoc');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await cp(SRC, path.join(OUT_DIR, 'redoc.standalone.js'));
  console.log('[copy-redoc] copied redoc.standalone.js to public/vendor/redoc/');
}

main().catch((err) => {
  console.error('[copy-redoc] failed:', err.message);
  process.exit(1);
});
