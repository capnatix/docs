---
title: 'Fund Setup'
description: 'Create, edit, and delete funds from Admin — each one scopes its own companies, investors, and reports.'
---

A **fund** is the scoping unit for everything else in Capnatix — companies,
investors, transactions, and reports all belong to exactly one fund. Manage
them from **Admin → Master Configuration → Funds**.

## Creating a fund

Click **Add New Fund** and fill in:

- **Fund Name** — the only required field.
- **Fund Slug** — not a field you fill in; a 3-character code is generated
  automatically from the name as you type, and shown as a preview.
  It appears in every URL for this fund and **cannot be changed later**.
  The rule:
  - **Three or more words** → the first letter of the first three words
    (`IAN Angel Network` → `IAN`, `Local Dev Fund` → `LDF`).
  - **One or two words** → the words joined together and cut to 3
    characters (`Growth Fund` → `GRO`, not `GF`; `Babydeck` → `BAB`).
  - Anything shorter than 3 characters after that is padded with `X`
    (`AB` → `ABX`).
  - If a name produces a code that's already taken, the next one tried
    keeps your first letter(s) and varies the rest — you may occasionally
    see a slug that doesn't obviously match your fund name if an earlier
    fund already claimed the natural one.
- **Description** — optional, shown alongside the fund name in lists.
- **Fund Manager** — optional and purely informational: it's shown next to
  the fund and has no effect on permissions or notifications. Any user can
  be picked, whether or not they otherwise have access to this fund; leave
  it as "— None —" if you don't need it.
- **Currency** and **Type** (Angel Network / VC Fund) — both are also
  informational/display-only today; neither changes any behavior elsewhere
  in the app.

Creating a fund also seeds it with a default deal-pipeline stage list,
default watchlist/archive reasons, and the standard email templates — and
adds you to it as a **Fund Admin**, so you have full access immediately.

:::note
How many funds you can create is capped by your license.
:::

## Editing a fund

Click the pencil icon on a fund to change its name, description, currency,
type, or fund manager at any time. The one thing you can never change is
the **slug** — an edit that tries to change it is rejected.

## Deleting a fund

Click the trash icon to delete a fund. There's no undo, and no separate
archive step today — this is a permanent delete, not a soft-delete you can
reverse. Most of a fund's data (pipeline stages, users, labels, email
templates, and more) is deleted along with it automatically.

:::caution
If the fund still has companies, transactions, or discussions attached
through certain older data paths, deletion can fail with a raw
database error instead of a clear "this fund still has data" message.
If that happens, it isn't safe to assume the fund — or its data — was
left untouched; check before retrying.
:::
