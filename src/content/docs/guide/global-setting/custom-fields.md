---
title: 'Custom Fields'
description: 'Instance-wide custom fields on companies — what they cover, where they actually show up, and where they do not.'
---

Custom fields let you capture data Capnatix doesn't model out of the box —
defined once, available to every fund. They apply to **companies** only:
since Capnatix tracks a deal and a portfolio company as the same underlying
record (just moved between stages as it progresses), a custom field is
available everywhere a company shows up, sourcing through portfolio.

Configure it at **Admin → Master Configuration → Custom Fields**.

:::note
There's a similarly-named but unrelated feature — **Settings → Asset
Types**' "custom columns" — that lets a fund add extra text/number/date
columns to its own transaction tables, scoped to one asset type (Equity,
Debt, Gold) in that one fund, purely for data capture and never used in
any calculation. That's a completely different system from this page:
this page is instance-wide fields on companies; that one is per-fund
columns on transactions.
:::

## What's in it

Nine field types: Text, Number, URL, Email, Paragraph, Dropdown, Date,
File Upload, and Company IDs (a repeatable id-type/value list, not a
plain field). A field's key is generated from its label when you create
it and can't be changed afterward — renaming the label later is always
safe, since stored values are keyed on the key, not the label. Everything
else (type, required, placeholder, dropdown options) can be edited any
time.

There's no per-fund version of this page — creating, editing, and
deleting field definitions only happens here, instance-wide.

## Where values actually show up

Fully wired: the Custom Fields tab on a company's detail page, the
application/intake form designer (so a custom field can be collected at
the point a deal comes in), and kanban deal cards — including as a
numeric aggregate metric if the field is a number.

Not wired, despite being visible elsewhere in the same views:

- **Not a column in the plain deal table/list view.** Custom fields
  render on kanban cards, but the equivalent table/list view of the same
  deals doesn't show them.
- **Not filterable or sortable.** The Sourcing/Dealflow/Portfolio filter
  bar and the deal list's sort options are both fixed, built-in lists —
  no custom field ever appears in either.
- **Not included in Deal Export.** Neither the fund-level nor the
  platform-level Deal Export report adds custom fields as columns. (Two
  unrelated legacy fields — company state and country — happen to live in
  the same underlying storage as custom field values and do appear in
  exports, which can look like custom-field export support from the
  outside; it isn't.)
- **Investors can't carry custom fields at all.** This page's fields
  attach to companies only — there's no equivalent for investor/LP
  records.

## Removing or changing a field

Deleting a field definition **never touches the values already stored
against companies** — they're preserved but simply stop appearing
anywhere, since nothing renders a key that's no longer in the catalog.
There's no cleanup or migration tool, so if you later recreate a field
with the same label (and therefore a new key), the old data doesn't come
back under it.

Editing a dropdown's option list doesn't touch existing values either. If
a company's stored value is no longer one of the current options, the
company's edit view still shows it — appended as an extra option outside
the maintained list — rather than silently blanking it, but it'll look
out of place until someone manually reselects a real option.

:::caution
Nothing stops you from creating a custom field whose key collides with a
handful of reserved names Capnatix already uses in the same underlying
storage — `country`, `state`, `short_description`, and `__layout` (used
internally for field ordering). Doing so won't error; it'll silently
corrupt that system value instead. Avoid those four as custom field keys
specifically — in practice this means avoiding labels like "Country" or
"State" that would auto-generate one of those keys.
:::

## Who can do what

Creating, editing, or deleting a field **definition** requires the
system-level instance-admin flag — there's no fund-level permission path
in at all here, unlike Managed Lists, where a narrow fund permission can
reach the instance-wide list. Reading the current field definitions is
open to any signed-in user, since forms and company views need them to
render.

Setting a field's **value** on a specific company is different: any fund
member with edit access to that company's profile can fill it in — the
same permission that lets them edit the company's other profile fields.
That check happens server-side, but a field marked "Required" is only
enforced in the browser — a direct API call can still save the company
with that field left empty.
