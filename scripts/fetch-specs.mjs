// Build-time fetch of every release's OpenAPI spec.
//
// GitHub release-asset downloads (release-assets.githubusercontent.com) send
// no CORS headers, so the browser can never fetch a spec directly from
// api-explorer.js. This script runs server-side at build time instead (no
// CORS restriction applies to a plain server-side fetch) and bakes each
// spec into public/specs/<tag>/openapi.yaml, served same-origin from then on.
//
// Idempotent — always re-fetches the current release list and overwrites.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPO = 'capnatix/docs';
const OUT_DIR = path.join(process.cwd(), 'public', 'specs');
const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function main() {
  const releases = await fetchJson(
    `https://api.github.com/repos/${REPO}/releases?per_page=100`
  );

  const withSpec = releases
    .filter((r) => Array.isArray(r.assets) && r.assets.some((a) => a.name === 'openapi.yaml'))
    .map((r) => ({
      tag: r.tag_name,
      prerelease: r.prerelease === true,
      published_at: r.published_at || r.created_at || null,
      specAsset: r.assets.find((a) => a.name === 'openapi.yaml'),
    }))
    // Newest first — GitHub already returns releases newest-first, but sort
    // explicitly rather than assume that ordering holds forever.
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  if (withSpec.length === 0) {
    console.warn('[fetch-specs] no release carries an openapi.yaml asset yet — nothing to fetch');
  }

  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];
  for (const release of withSpec) {
    const specRes = await fetch(release.specAsset.url, {
      headers: { ...headers, Accept: 'application/octet-stream' },
    });
    if (!specRes.ok) {
      console.warn(`[fetch-specs] ${release.tag}: spec download failed (${specRes.status}), skipping`);
      continue;
    }
    const dir = path.join(OUT_DIR, release.tag);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'openapi.yaml'), Buffer.from(await specRes.arrayBuffer()));
    manifest.push({ tag: release.tag, prerelease: release.prerelease, published_at: release.published_at });
    console.log(`[fetch-specs] ${release.tag}: wrote public/specs/${release.tag}/openapi.yaml`);
  }

  await writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
  console.log(`[fetch-specs] wrote public/specs/index.json (${manifest.length} version(s))`);
}

main().catch((err) => {
  console.error('[fetch-specs] failed:', err.message);
  process.exit(1);
});
