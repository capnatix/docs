---
title: 'Single Sign On'
description: 'Let your team sign in with Google or Microsoft — what it changes, and what it deliberately doesn''t.'
---

Once this is on, your team signs in with the same Google or Microsoft
account they already use for everything else — no separate password to
create, remember, or eventually leak. It's additive, not a replacement:
password login keeps working for everyone who already has one, exactly
as before.

Configure it at **Admin → Master Configuration → Integrations →
Single Sign-On**.

Despite the name, this is specifically **Google Workspace and Microsoft
365 sign-in** (OpenID Connect) — not SAML, and not a generic OIDC issuer
you can point at any identity provider.

## Fields (per provider)

- **Client ID** and **Client Secret** — from your Google/Microsoft app
  registration. The secret is write-only and encrypted at rest, the same
  way the SMTP password is — the field always looks empty even after
  you've saved one.
- **Allowed Domain** (Google) / **Tenant ID** (Microsoft) — required.
  This is what actually restricts sign-in to your own organization;
  there's no open or multi-tenant mode.
- **Redirect URI** — shown read-only, derived from `INF_FRONTEND_URL`.
  Copy this into your app registration; you don't set it yourself.

Both a Client ID/Secret and the domain/tenant restriction are required
before you can turn the provider on.

## Test connection

Checks that your Client ID and Secret are valid by probing the
provider's own token endpoint — it doesn't perform a real sign-in, and
works even before you've enabled the provider, so you can verify
credentials before going live.

## New users and roles

The first time someone signs in via SSO, if their email doesn't already
have an account, one is created automatically — there's no separate
invite step, as long as their email is on your allowed domain/tenant.
That new account gets the base **user** role and **no fund access** —
a fund admin still has to grant Editor/Viewer access on the funds they
need, same as any other new user.

:::caution[If your identity provider ever breaks]
An account that has only ever signed in via SSO has no password at all —
by design, "forgot password" deliberately won't work for it either
(this stops someone bypassing your identity provider's own security,
it isn't a bug). If Google or Microsoft becomes unreachable, or someone's
access there is revoked, another instance admin can still get them back
in from **Admin → Users → Reset Password**, which sets a real password
for them regardless of SSO state. That path only requires *some* working
admin account, though — if every instance admin is SSO-only and your
identity provider is down, recovery needs direct server access instead
of the UI. Keep at least one admin account with a real password as a
safety net.
:::
