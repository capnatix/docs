# docs

Public static site for [docs.capnatix.com](https://docs.capnatix.com), served
via GitHub Pages directly from this repo's `main` branch (source: `/`, no
build step, `.nojekyll` disables Jekyll processing).

This repo is public. `capnatix/capnatix` (the application repo) is private,
so anything an end user or a self-hosting operator needs to download —
without repo access — lives here instead.

## What's here

- **`index.html`** — a thin landing page.
- **`releases/index.html`** + **`assets/releases.js`** — the Releases &
  downloads page. It renders this repo's own GitHub Releases, fetched
  client-side and unauthenticated from the public REST API
  (`GET /repos/capnatix/docs/releases`). There is no committed per-release
  content and no build step; the page is a live view of whatever releases
  exist here.
- **`assets/site.css`** — shared styling for both pages.

Plain static HTML/CSS/JS only — no framework, no bundler, no `package.json`.
Adopting a docs framework (e.g. Astro Starlight) is tracked separately
(INVOS-697) and is not done here.

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
