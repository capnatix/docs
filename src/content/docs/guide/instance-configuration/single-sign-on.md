---
title: 'Single Sign On'
description: 'Let your team sign in with Google or Microsoft — what it changes, and what it deliberately doesn''t.'
---

Once this is on, your team signs in with the same Google or Microsoft
account they already use for everything else — no separate password to
create, remember, or eventually leak. It's additive, not a replacement:
password login keeps working for everyone who already has one, exactly
as before.

Configure it at **Admin → Integrations → Single Sign-On** — a separate
top-level section from Master Configuration, alongside Email (SMTP) and
AI Configuration.

Despite the name, this is specifically **Google Workspace and Microsoft
365 sign-in** (OpenID Connect) — not SAML, and not a generic OIDC issuer
you can point at any identity provider. Google and Microsoft each get
their own tab, their own fields, and their own redirect URI — treat them
as two independent setups, not one form with a provider switch.

## Google Workspace

- **Client ID** and **Client Secret** — from your Google Cloud OAuth app.
  The secret is write-only and encrypted at rest, the same way the SMTP
  password is — the field always looks empty even after you've saved one.
- **Allowed Domain** — required to turn Google on. Restricts sign-in to
  one Google Workspace domain; there's no open sign-in mode.
- **Redirect URI** — `<your instance URL>/api/auth/oauth/google/callback`,
  shown read-only. Add it to your Google Cloud app's authorized redirect
  URIs; you don't set it yourself.

**Setup steps**, in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Open **APIs & Services → Credentials**.
2. **Create Credentials → OAuth client ID**, application type **Web
   application**.
3. Add the Redirect URI above to the app (platform: **Web**).
4. Enable the **Gmail API** (APIs & Services → Library → Gmail API).
5. On the **OAuth consent screen**, add the scopes: `openid`, `email`,
   `profile`, and `gmail.readonly`.
6. Copy the **Client ID** and **Client secret** into the form, and set
   your Workspace domain (the app's own hint calls this step optional —
   it isn't; Google won't turn on without it).

## Microsoft 365

- **Client ID** and **Client Secret** — from your Microsoft Entra (Azure
  AD) app registration. Same write-only, encrypted-at-rest handling as
  Google's.
- **Tenant ID** — required to turn Microsoft on. Restricts sign-in to one
  Azure tenant; there's no open or multi-tenant sign-in mode.
- **Redirect URI** — `<your instance URL>/api/auth/oauth/microsoft/callback`
  — a **different URL from Google's**, shown read-only. Add it to your
  Entra app registration.

**Setup steps**, in [Microsoft Entra admin center](https://entra.microsoft.com):

1. Open **App registrations → New registration**.
2. Add the Redirect URI above to the app (platform: **Web**).
3. **API permissions → Add a permission → Microsoft Graph → Delegated**:
   add `openid`, `email`, `profile`, `Mail.Read`, and `offline_access`.
4. **Certificates & secrets → New client secret** — copy the secret
   *value* immediately; Microsoft won't show it again.
5. From **Overview**, copy the **Application (client) ID** and
   **Directory (tenant) ID**.
6. Paste the Client ID, secret, and Tenant ID into the form.

For either provider, saving with the provider turned on only requires
the Client ID and the domain/tenant restriction — it doesn't block you
from saving without a Client Secret. Sign-in itself won't actually work
until a secret is set, though, so treat all three as required in
practice.

## Test connection

Checks that your **already-saved** Client ID and Secret are valid, by
probing the provider's own token endpoint — it doesn't perform a real
sign-in, and works even before you've enabled the provider. Save first:
this tests what's on file, not whatever you've just typed into the form
but haven't saved yet.

## New users and roles

The first time someone signs in via SSO, if their email doesn't already
have an account, one is created automatically — there's no separate
invite step, as long as their email is on your allowed domain/tenant.
That new account gets the base **user** role and **no fund access** —
a fund admin still has to grant Editor/Viewer access on the funds they
need, same as any other new user.

> **If your identity provider ever breaks:** _an account that has only
> ever signed in via SSO has no password at all — by design, "forgot
> password" deliberately won't work for it either (this stops someone
> bypassing your identity provider's own security, it isn't a bug). If
> Google or Microsoft becomes unreachable, or someone's access there is
> revoked, another instance admin can still get them back in from
> **Admin → Users → Reset Password**, which sets a real password for
> them regardless of SSO state. That path only requires **some** working
> admin account, though — if every instance admin is SSO-only and your
> identity provider is down, recovery needs direct server access instead
> of the UI. Keep at least one admin account with a real password as a
> safety net._
