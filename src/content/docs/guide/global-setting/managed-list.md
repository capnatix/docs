---
title: 'Managed List'
description: 'The shared dropdown options behind company type, sector, security type, and more — one place, every fund.'
---

Most of the dropdown options across Capnatix — company type, sector,
industry, security type, tax ID type, and more — come from one shared
place. Add a value here once, and it's available in that dropdown for
every fund; remove one, and it's gone everywhere, without touching a
single fund's own settings.

Configure it at **Admin → Master Configuration → Managed Lists**.

:::note
There's a second, unrelated feature that also gets called "managed
lists" — the tags/labels you attach to companies and investors from
inside a fund. That one lives on the fund itself and has nothing to do
with this page. This page is instance-wide dropdown options; that one is
per-fund labeling.
:::

## What's in it

21 categories, grouped the same way the page itself groups them:

- **Common** — Country, Currency
- **Company** — Business Model, Company ID Type, Company Stage, Company
  Type, Contact Role, Gender, Industry, Offering, Revenue Model, Sector,
  Source Type, Social Account Type
- **Transactions** — Debt Security Type, Equity Security Type, Sale Type
- **Investors** — Investor Entity Type, Investor Status, Investor Stage,
  Tax ID Type

You can add or remove **values** within any of these — you can't create
an entirely new category from this page.

## Adding a value

Each value has a display name and, for Currency, a symbol — everything
else (its internal key, sort position) is handled for you. The only
validation is that the value can't already exist in that category
(case-insensitive); there's no length limit.

## Removing a value

Removing a value never touches data that already used it — existing
records keep whatever string was already stored, they just won't be
offered as a dropdown option going forward. For most Company-group
categories (Company Type, Industry, Company Stage, Sector, and others in
that group), you can instead **replace** a value as you remove it, which
rewrites every existing record using the old value to the new one
instead of leaving it orphaned. Categories outside that group — Currency,
security types, investor fields — don't support that rewrite; removing a
value there only removes the option itself.

**Currency is a special case**: you can't remove one that's still in use
by any fund, company, or funding round — the removal is blocked outright
rather than left to a replace step.

## Who can do what

Reaching this admin page at all requires an instance admin. Underneath
that, the add/remove actions themselves are gated separately: a Fund
Admin can remove values, and a Deal Lead or Sourcing Analyst can add
them (from the quick-add option where these fields appear while editing
a company, not from this page) — so values can grow from day-to-day use
across funds, even though only an instance admin ever sees this
consolidated view of all of them.

:::caution
Two categories exist in this list but don't actually drive the dropdown
their name suggests: **Investor Status** and the **Fund Type** field on
Fund Setup are both hardcoded in the app, not read from here. Editing
either one on this page has no visible effect anywhere.
:::
