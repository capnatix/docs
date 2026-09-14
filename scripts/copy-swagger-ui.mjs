// Copies swagger-ui-dist's standalone browser bundle into public/vendor,
// so api.astro can load it as plain same-origin <script>/<link> tags — no
// bundler-import step, matching how swagger-ui-dist ships these files
// specifically for direct static hosting (its own "standalone" preset).

import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.join(process.cwd(), 'node_modules', 'swagger-ui-dist');
const OUT = path.join(process.cwd(), 'public', 'vendor', 'swagger-ui');

const FILES = ['swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css'];

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const file of FILES) {
    await cp(path.join(SRC, file), path.join(OUT, file));
  }
  console.log(`[copy-swagger-ui] copied ${FILES.length} file(s) to public/vendor/swagger-ui/`);
}

main().catch((err) => {
  console.error('[copy-swagger-ui] failed:', err.message);
  process.exit(1);
});
