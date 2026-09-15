---
title: 'Installation'
description: 'Install Capnatix on your own infrastructure with Docker Compose.'
---

Capnatix is self-hosted: everything runs as a set of Docker containers on a
single host you control, behind one published port. This page gets the
stack up and running. Once it's up, continue to
[Configuration](/getting-started/configuration/) to review the environment
in more depth, then [First User Setup](/getting-started/first-user-setup/)
to create your admin login.

## Prerequisites

- A Linux host (or VM) — the install script below installs Docker for you
  if it isn't already there.
- Outbound internet access, to pull images from Docker Hub (`capnatix/*`)
  and `ghcr.io` (the AI proxy image).
- A domain or subdomain pointed at the host, if you're serving it on your
  own hostname rather than a bare IP — you'll set this in
  [Step 2](#2-fill-in-what-only-you-know).

**Sizing.** There's no hard minimum, but as a reference point, Capnatix's
own hosted instances default to 2 vCPU / 8 GB RAM with 100 GB of storage.
That's a reasonable starting point for a single instance — resize as your
data and usage grow.

## 1. Run the install script

```bash
curl -fsSL https://docs.capnatix.com/install.sh | sh -s -- --dir=./capnatix
```

This installs Docker if it isn't already present, then leaves a `capnatix/`
folder behind with exactly two files:

- **`docker-compose.yaml`** — the stack definition.
- **`app.env`** — the environment file, with every secret Capnatix itself
  needs already generated and filled in: the database password, session
  signing key, and a handful of internal service credentials. Each is
  independently random on purpose — several of them deliberately guard
  different trust boundaries, so reusing one value across two of them is a
  real bug class, not just tidiness. You never have to think about this;
  the script already did it.

Prefer to look before you run it? `curl -fsSL https://docs.capnatix.com/install.sh -o install.sh`, read it, then `sh install.sh --dir=./capnatix`. It's also
safe to re-run: it never overwrites either file once it exists, so it
can't desync your secrets from a database that already initialized with
them, or silently discard an edit you've made to `docker-compose.yaml`
(e.g. the TLS block below). If you want a newer release's copy of either
file, remove it yourself first — a re-run does add any *new* variable a
newer template has introduced to `app.env`, appended without touching
what's already there.

## 2. Fill in what only you know

Everything the script *couldn't* know for you is still marked `CHANGE-ME`
in `app.env`. Open it and fill in:

- **`INF_FRONTEND_URL`** — the URL you'll reach this instance at, e.g.
  `https://app.your-domain.com`. Used for CORS and links in outgoing
  email.
- **File storage** — the template defaults `STORAGE_PROVIDER` to `s3`;
  fill in your bucket/credential fields below it, switch to `azure` with
  its own credentials, or change it to `local` for a quick evaluation
  install (files then live on this one host, with nothing else to
  configure).

A few values are left at their template default on purpose, because
they're real external credentials this host has no way to generate for
you — the script only fills in secrets *Capnatix itself* invents:

- **`API_KEY`** — only needed for portfolio-manager backfill; leave it if
  you're not using that.
- **`STORAGE_ACCESS_KEY`/`STORAGE_SECRET_KEY`** — required once you set
  `STORAGE_PROVIDER` to `s3` or `azure` above.

Everything else in the file is either optional (SMTP, legacy-data
migration, the external API — the external API's own `EXTERNAL_API_PG_*`
also needs a one-time database role created, not just these values; see
its comments in `app.env` if you enable it) or already generated — safe
to leave as-is for a first install.

## 3. Start the stack

```bash
cd capnatix
docker compose --env-file app.env up -d
```

This pulls every image and starts Postgres, Redis, the backend, the
frontend, the scheduled-job runner, the analytics engine, the AI proxy
(and its own database), and the public-facing proxy. The `mongo` and
`external-api` services stay off — both are optional and profile-gated
(legacy-data migration and the server-to-server API, respectively), not
needed for a normal install.

## 4. Apply database migrations

```bash
docker compose --env-file app.env exec inf-backend \
  sh -c "cd /app && npx knex migrate:latest"
```

This is a one-time step per upgrade, not something that runs on every
boot — run it again any time you pull a newer image.

## 5. Verify

```bash
docker compose --env-file app.env ps
```

Every service should show as running (Postgres, Redis, and the AI proxy's
own database specifically as `healthy`, once their startup checks pass).
Visit `INF_FRONTEND_URL` (or
the host's IP if you haven't pointed a domain at it yet) — you should see
the Capnatix login screen. There's no account to log in with yet by
design; that's what [First User Setup](/getting-started/first-user-setup/)
is for.

:::note[A note on TLS]
The `proxy` container serves plain HTTP on `PROXY_PORT`. Terminating TLS —
a certificate for your domain — is on you: add a `443` server block with
your certs to the proxy, or put a load balancer or reverse proxy (e.g. a
managed LB, Caddy, or another nginx) in front of it. Do this before
pointing real users at the instance.
:::

## What's next

- [Configuration](/getting-started/configuration/) — a closer look at the
  environment you just set up.
- [First User Setup](/getting-started/first-user-setup/) — create your
  admin account and fund, and log in for the first time.
