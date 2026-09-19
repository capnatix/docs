---
title: 'Branding'
description: 'Set your instance name, tagline, and logo — where they show up, and where they deliberately don''t.'
---

**Admin → Master Configuration → Branding** sets three things for the whole
instance: a name, a tagline, and a logo. It's instance-wide, not per-fund —
each fund has its own separate logo (set from the fund itself), shown
wherever that fund is in context. This page is about the instance-level
one, shown everywhere a visitor hasn't picked a fund yet.

## Fields

- **App Name** — up to 60 characters. Defaults to "Capnatix" if left blank.
- **Tagline** — up to 120 characters. Defaults to "Portfolio Management
  System" if left blank.
- **Logo** — any image, up to 512KB. Uploading downsizes it to 256px on
  the longest side and converts it to PNG automatically before saving.
  Clear it back to the default by removing it.

You can save any one of the three without affecting the other two — there's
no "fill in everything or nothing" requirement.

Only an instance admin can change branding; there's no fund-level
permission that reaches this page.

## Where it shows up

- The **login screen**.
- The **browser tab** — title and favicon.
- **Outgoing email** — the logo (or, if none is set, the app name as
  plain text) in every transactional email's header.
- The **public application form and IC portal footer** — under the
  fund's own logo, not replacing it.
- **Link previews** — when someone shares a link to your instance, the
  title and preview image come from here.

:::note
It does **not** appear in the authenticated app's own header once you're
logged in — that shows the current fund's own logo instead, a separate
setting on the fund itself. Instance branding also isn't included in
Excel or PDF exports.
:::
