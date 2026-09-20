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

> *There's a second, unrelated feature that also gets called "managed
> lists" — the tags/labels you attach to companies and investors from
> inside a fund. That one lives on the fund itself and has nothing to do
> with this page. This page is instance-wide dropdown options; that one
> is per-fund labeling.*

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
offered as a dropdown option going forward. For some Company-group
categories (Company Type and Industry among them), you can instead
**replace** a value as you remove it, which rewrites every existing
record using the old value to the new one instead of leaving it
orphaned — but not every category in that same group supports it (Contact
Role, for one, doesn't). The page doesn't distinguish the two: the
replace option is offered for every category regardless, and silently
does nothing to existing records when the category underneath doesn't
actually support it — no error, no warning. If you're relying on the
replace step, verify the rewrite actually happened rather than trusting
the UI went through with it.

**Currency is a special case**: you can't remove one that's still in use
by any fund, company, or funding round — the removal is blocked outright
rather than left to a replace step.

## Who can do what

Reaching this admin page itself requires an instance admin — that's a
UI-level gate, not a difference in what the underlying data allows.
Adding and removing values is checked separately, per action, against
whatever fund-level roles a user holds — **anywhere**, not the fund
whose data you're currently touching. A Fund Admin of one small fund can
remove or replace a Currency or Company Type value that every other
fund's data also depends on; a Deal Lead or Sourcing Analyst on one fund
can add a new value while editing a company that belongs to a different
fund entirely, via the quick-add option where these fields appear
in-context (not from this page). Treat any of those roles, on any single
fund, as enough to reach every category here — because it is.

> ***Investor Status*** *exists as a category here, and the page's own
> copy says changes apply immediately everywhere that list is used — but
> the actual investor status dropdown is hardcoded elsewhere in the app
> and never reads from this list at all. Editing it here has no visible
> effect anywhere. This is a real gap in the product, not a
> documentation nuance — a known issue, not something to work around
> here.*
