---
title: 'Configuration'
description: 'A closer look at the environment behind a self-hosted Capnatix instance.'
---

[Installation](/getting-started/installation/) gets a working instance up
with the minimum required edits to `app.env` — a domain and file storage.
Everything below is the rest of that file, and the infrastructure around
it: TLS, storage in more depth, scaling, logs, backups, and what the
opt-in features actually need. In-app settings (branding, SMTP, SSO,
license) live under **Guide → Instance Configuration** instead, once
you're logged in — this page is everything you'd otherwise touch before
that point.

## TLS

The `proxy` container only ever serves plain HTTP — its nginx config is
baked into the image at build time, with no certificate or config mount
to extend it. Putting a separate reverse proxy in front, terminating TLS
there, is the only option — not a limitation to work around, just where
this responsibility sits.

[Caddy](https://caddyserver.com/) is a reasonable choice: it requests and
renews a Let's Encrypt certificate automatically, with no manual
certbot/renewal setup. A minimal `Caddyfile` next to `docker-compose.yaml`:

```
app.your-domain.com {
	reverse_proxy proxy:80
}
```

And a compose override, `docker-compose.tls.yaml`, layered on top of the
one `capnatix.sh install` gave you rather than editing it directly:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
volumes:
  caddy-data:
```

Change `PROXY_PORT` in `app.env` to something other than `80` first (e.g.
`8080`) — Caddy needs that port for itself — then start both files
together:

```bash
docker compose -f docker-compose.yaml -f docker-compose.tls.yaml \
  --env-file app.env up -d
```

Caddy reaches the `proxy` service directly over the compose network
(`proxy:80`), regardless of what `PROXY_PORT` is set to.

:::note
`./capnatix.sh start`/`stop` only know about the single
`docker-compose.yaml` `install` gave you. Once you're running with the
TLS override layered on top, use the two-file `docker compose -f ... -f
...` form above directly instead — `capnatix.sh` won't pick up the
override on its own.
:::

## File storage

`STORAGE_PROVIDER` defaults to `s3`, and covers any S3-compatible
provider, not just AWS:

| Provider | `STORAGE_ENDPOINT` |
|---|---|
| AWS S3 | leave blank |
| Cloudflare R2, MinIO, Google Cloud Storage | set to that provider's S3-compatible endpoint URL |

`STORAGE_REGION` can stay `auto` for most providers; set a real AWS
region if you're on S3. `azure` is a separate provider option with its
own `AZURE_STORAGE_CONNECTION_STRING`/`AZURE_STORAGE_CONTAINER` pair, not
read unless `STORAGE_PROVIDER=azure`.

:::note
`MAX_UPLOAD_SIZE_MB` (default `20`) has a ceiling: the `proxy` container's
own nginx config caps every request body at 50 MB regardless. Raising
`MAX_UPLOAD_SIZE_MB` above that has no effect until a custom proxy image
raises the matching `client_max_body_size` too.
:::

## AI features

`LITELLM_MASTER_KEY`, `LITELLM_SALT_KEY`, and `LITELLM_PG_PASS` are
already generated in `app.env` — the AI proxy container runs regardless,
since other services depend on it being reachable. Capnatix ships no
end-user-facing AI feature until an operator actually configures a
provider from **Admin → AI Configuration**, once logged in; nothing
further to do here.

## External API

A separate, server-to-server API (Bearer API-key auth) for integrating
with a self-hosted instance — off by default (`--profile external-api`).
`EXTERNAL_API_PG_USER`/`EXTERNAL_API_PG_PASS` in `app.env` are only half
of what enabling it needs: they authenticate a dedicated, read-only
Postgres role that itself has to be created once, and that step isn't
part of this package yet. If you need this today, reach out rather than
enabling the profile — a key with no matching role just fails to
authenticate.

## Scheduled jobs

`inf-cron` runs a few schedules, all overridable in `app.env`:

| Variable | Default | Runs |
|---|---|---|
| `IRR_BASE_SCHEDULE` | `14 */1 * * *` | Hourly IRR base build |
| `IRR_CALC_SCHEDULE` | `0 */3 * * *` | XIRR calculation, every 3 hours |
| `EMAIL_DISPATCH_SCHEDULE` | `* * * * *` | Outgoing email queue, every minute — not in the template file by default, add the line yourself to override it |

## Scaling

The stateless services can run more than one replica behind `proxy`,
which load-balances across them automatically:

```bash
docker compose --env-file app.env up -d --scale inf-frontend=3 --scale inf-backend=3
```

Postgres, Redis, and the AI proxy's own database aren't meant to be
scaled this way — one of each.

## Logs

```bash
docker compose --env-file app.env logs -f inf-backend
```

Any service name from `docker compose --env-file app.env ps` works the
same way.

## Backups

Nothing here is a packaged Capnatix feature yet — this is a reasonable,
generic approach on top of what Installation set up. The database is
what actually matters; uploaded files matter too if you're on
`STORAGE_PROVIDER=local`.

A live database dump, no downtime — `-T` disables the pseudo-TTY
`exec` allocates by default, which otherwise injects stray carriage
returns into a redirected dump:

```bash
docker compose --env-file app.env exec -T postgres \
  pg_dump -U capnatix capnatix > capnatix-$(date +%F).sql
```

Or a filesystem-level backup of everything stateful, stack stopped.
`capnatix.sh install` created `/data/capnatix` as root, so reading it back
needs `sudo` too — without it, `tar` silently skips whatever it can't
read and still exits looking successful, which is a worse failure than an
error would be:

```bash
./capnatix.sh stop
sudo tar czf capnatix-data-$(date +%F).tar.gz /data/capnatix
./capnatix.sh start
```

