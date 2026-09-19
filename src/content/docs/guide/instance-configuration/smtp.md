---
title: 'SMTP'
description: 'Configure outgoing email — invites, password resets, and notifications — and what happens if you never set it up.'
---

Every invite you send, every password reset, every notification your
team and your investors are waiting on — all of it leaves through here.
Skip this and none of it actually breaks; it just goes quiet, logged to
a server console nobody's watching instead of landing in an inbox.

Configure it at **Admin → Master Configuration → Integrations → Email
(SMTP)**.

## Fields

- **Host** — required.
- **From Address** — required.
- **Port** — optional, defaults to `587`. `465` is treated as implicit
  SSL; anything else uses STARTTLS. There's no separate TLS-mode toggle —
  the port you enter decides it.
- **Username** — optional, defaults to `emailapikey` (the literal
  username ZeptoMail's SMTP relay expects, if that's your provider).
- **From Name** — optional, defaults to `Capnatix Platform`.
- **Password** — write-only: it's encrypted at rest and never sent back
  to the browser, so the field always looks empty even when a password is
  saved. Leaving it blank on a later save keeps the existing one; you
  only need to fill it in to set or change it.

## This overrides the environment variables, not merges with them

If you set `SMTP_*` in `app.env` during
[installation](/getting-started/installation/), this page's settings take
over completely the moment you save a host here — not layered on top,
not merged field by field. The badge on this page shows which source is
currently active. This is meant as a one-way migration: `SMTP_*` gets you
running before anyone's logged in to configure anything; this page is
where you're expected to land.

## Send a test email

The **Send test email** button does a real send, not a dry run — it
checks the recipient's domain can actually receive mail first, then
sends through your saved configuration. "Success" means the mail server
*accepted* the message, not that it reached an inbox; a bounce or spam
placement afterward wouldn't show up here. It only works once a password
is saved — without one, it tells you so instead of pretending to send.

## What actually goes through this

Standard transactional email (invites, password resets, OTP codes) and
the platform's own "no-reply" sends both use this configuration. What
doesn't: if a teammate has connected their own Gmail or Outlook account
for sending replies, those go out through that person's own account via
Google/Microsoft directly — never through this SMTP config, configured
or not.

:::caution
If SMTP is never configured, most transactional email doesn't fail —
it silently logs to the server console instead of sending, with no error
anywhere in the app. An invite or password-reset email that "never
arrived" is the first symptom most people actually notice. Set this up
before you invite anyone.
:::
