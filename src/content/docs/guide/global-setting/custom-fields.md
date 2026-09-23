---
title: 'Custom Fields'
description: 'Instance-wide custom fields on companies — what they cover, where they actually show up, and where they do not.'
---

Custom fields let you capture data Capnatix doesn't model out of the box —
defined once, available to every fund. They apply to **companies** only:
since Capnatix tracks a deal and a portfolio company as the same underlying
record (just moved between stages as it progresses), a custom field is
available everywhere a company shows up, from Sourcing through Portfolio.

Configure it at **Admin → Master Configuration → Custom Fields**.

> _There's a similarly-named but unrelated feature — **Settings → Asset
> Types**' "custom columns" — that lets a fund add extra text/number/date
> columns to its own transaction tables, scoped to one asset type
> (Equity, Debt, Gold) in that one fund, purely for data capture and
> never used in any calculation. That's a completely different system
> from this page._

## What's in it

Nine field types: Text, Number, URL, Email, Paragraph, Dropdown, Date,
File Upload, and Company IDs (a repeatable id-type/value list, not a
plain field). A field's key is generated from its label — lowercased,
with anything that isn't a letter, digit, or underscore collapsed to `_`
— when you create it, and can't be changed afterward. Renaming the label
later is always safe, since stored values are keyed on the key, not the
label; label and key can drift apart from that point on. Everything else
(type, required, placeholder, dropdown options) can be edited any time.

There's no per-fund version of this page — creating, editing, and
deleting field definitions only happens here, instance-wide.

## Where values actually show up

Fully wired: the Custom Fields tab on a company's **edit** page (there's
no read-only rendering of custom fields on the plain detail/view page —
you need edit access to see them at all), the [Application
Form](/guide/fund-configuration/application-form/) designer (so a
custom field can be collected at the point a deal comes in, reviewed on
the [Inbox](/guide/fund-operations/inbox/) page), and kanban deal cards
— including as a numeric aggregate metric if
the field is a number.

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
There's no cleanup or migration tool for this. One consequence worth
knowing: because the key is a deterministic function of the label,
recreating a field with the *exact same label* regenerates the same key
— so the old, seemingly-gone values reappear under the recreated field,
which may be surprising if you expected a truly fresh field rather than
whatever stale data was left behind under that key.

Editing a dropdown's option list doesn't touch existing values either.
If a company's stored value is no longer one of the current options, the
company's edit view still shows it, appended as an extra option outside
the maintained list, rather than silently blanking it. It'll look out of
place, though, until someone manually reselects a real option.

> *Nothing stops you from creating a custom field whose key collides
> with a handful of reserved names Capnatix already uses in the same
> underlying storage — `country`, `state`, `short_description`, and
> `__layout` (used internally for field ordering). Doing so won't error;
> it'll silently corrupt that system value instead. Avoid those four as
> custom field keys specifically — in practice this means avoiding
> labels like "Country" or "State" that would auto-generate one of those
> keys. This is a real gap in the product, not a documentation nuance,
> not something to work around here.*

## Who can do what

Creating, editing, or deleting a field **definition** requires the
system-level instance-admin flag. There's no fund-level permission path
in here at all, unlike Managed Lists, where a narrow fund permission can
reach the instance-wide list. Reading the current field definitions is
open to any signed-in user, since forms and company views need them to
render.

Setting a field's **value** on a specific company is different: any fund
member with edit access to that company's profile can fill it in — the
same permission that lets them edit the company's other profile fields,
and that check is enforced server-side. A field marked "Required" is a
separate check, and a weaker one: it's only enforced in the browser, so
a direct API call can still save the company with that field left empty.
