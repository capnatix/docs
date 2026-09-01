# docs

Public site for [docs.capnatix.com](https://docs.capnatix.com), built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and
deployed via GitHub Actions to GitHub Pages (see
`.github/workflows/deploy.yml`).

This repo is public. `capnatix/capnatix` (the application repo) is private,
so anything an end user or a self-hosting operator needs to download —
without repo access — lives here instead.

## Running locally

Requires Node (see `.nvmrc` for the exact version; `nvm use` picks it up
automatically).

```bash
npm install
npm run dev       # http://localhost:4321
```

Other scripts:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built dist/ locally
```

## What's here

- **`src/content/docs/index.mdx`** — the landing page (Starlight splash
  template).
- **`src/pages/releases.astro`** + **`public/assets/releases.js`** — the
  Releases & downloads page. The page shell is a Starlight custom page;
  `releases.js` renders this repo's own GitHub Releases, fetched
  client-side and unauthenticated from the public REST API
  (`GET /repos/capnatix/docs/releases`). There is no committed per-release
  content; the page is a live view of whatever releases exist here.

  `releases.js` was written under INVOS-640 with specific, deliberate
  security properties (no `innerHTML`, `browser_download_url` used
  verbatim, suffix-matched asset names, `sessionStorage` caching wrapped in
  `try/catch`). Treat any change to it as a security-relevant change, not a
  styling tweak — see the INVOS-697 Plane ticket for why it's kept as a
  plain script in `public/` rather than rewritten as a component.
- **`src/styles/capnatix.css`** — Starlight theme overrides (brand colors,
  the release-card component styles used by `releases.js`). See the
  INVOS-697 Plane ticket before adding to this file — its scope is
  deliberately narrow and each token override there documents the contrast
  ratio it preserves.
- **`docs/decisions/`** — architecture decision records for this repo.

Stage 3 (per-feature help content, as Markdown under `src/content/docs/`)
and stage 4 (API reference) are tracked separately (INVOS-697) and are not
built out here — this repo currently ships only the Starlight scaffold plus
the two pages above.

## How releases get published here

Every `capnatix/capnatix` release (`.github/workflows/release.yml`,
`package-extension` job) mirrors three assets to a same-tagged release in
*this* repo, using a fine-grained PAT scoped to this repo only
(`DOCS_REPO_TOKEN`, held in `capnatix/capnatix`'s repo secrets):

- the packaged Chrome/Chromium extension zip
- `docker-compose.prod.yaml`
- `env.prod.example`

The mirror is **assets only** — releases created here carry no release notes
and no source changelog, deliberately. The docker-compose file and env
template in a given release are version-matched to that release's
application images; the extension zip is version-matched to whichever
backend image was built from the same release (the backend bakes in a link
to its own release's zip on this repo, not a floating "latest" link).

A release appearing here with no assets, or missing an expected asset, means
the mirror step in `capnatix/capnatix`'s workflow failed for that release —
check that workflow run, not this repo, first.

## Deploying

Deploys run automatically on every push to `main` via
`.github/workflows/deploy.yml` (also buildable, but not deployable, on pull
requests, and re-runnable manually via `workflow_dispatch`). The workflow
needs the repo's GitHub Pages source set to "GitHub Actions" (Settings →
Pages → Build and deployment) — see the INVOS-697 Plane ticket for why that
one-time switch can't be automated from within the workflow.
