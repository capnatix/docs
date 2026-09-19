---
title: 'Date/Time'
description: 'The instance-wide timezone and date format — what it actually controls across the app, not just exports.'
---

Two settings, both instance-wide (not per-fund, not per-user): **timezone**
and **date format**. Everything stored in Capnatix stays UTC underneath,
always — these settings only change how dates are *displayed* and, for
timezone, where report date-range filters draw their boundaries. Changing
either never rewrites or migrates any stored data.

Configure it at **Admin → Master Configuration → Date/Time**.

## What's in it

- **Timezone** — a searchable list of every IANA timezone the server
  recognizes (hundreds of them, not a short list), each shown with its
  current UTC offset. Default is `Asia/Kolkata`. Whatever you pick is
  normalized to its canonical name on save — for example, selecting the
  older `Asia/Calcutta` alias stores and displays as `Asia/Kolkata`. If
  you're specifically looking for "Kolkata" in the list after having
  already selected it, search will still find it under its canonical name
  even though the underlying platform only lists the deprecated alias —
  it isn't missing.
- **Date format** — one of four fixed options, each shown with a live
  example so you can tell them apart before saving: `DD-MMM-YYYY`
  (default, e.g. `20-Aug-2026`), `DD/MM/YYYY`, `MM/DD/YYYY`, and
  `YYYY-MM-DD`. There's no free-text format entry and no separate 12h/24h
  time-format or first-day-of-week control — only these four date layouts
  exist today.

Both settings fall back to their defaults until an admin explicitly saves a
value — a fresh, untouched instance behaves as if the settings didn't
exist at all.

## Where it actually applies

:::caution
The Date/Time page's own on-screen help text says this only affects report
builder exports (Excel/CSV) and that "screen dates elsewhere in the app
still follow each viewer's own browser timezone." That was true when the
page first shipped, but a follow-up change the next day wired the setting
into most of the app's own date displays without the help text being
updated to match — the in-app copy is stale. Don't rely on it; the real
scope is below.
:::

In practice, both settings now drive most dates you see in the product:
report builder previews and exports, kanban deal cards, deal list columns,
investor tables and profiles, IC meeting prep, and the transaction report,
among others.

A small number of screens are **deliberately** left out because they're
system, audit, or vendor-metadata surfaces rather than fund data: Single
Sign-On, SMTP, Trash, Users, session locks, the public application form,
the top bar, and license pages all keep their own fixed or browser-local
date formatting on purpose.

A few other spots aren't on that intentional-exclusion list but still
don't follow the setting — most likely missed rather than deliberate,
tracked separately rather than something to work around here: the
"recorded by … on …" line on an IC meeting's final decision, the "set by …
on …" line on IC meeting reminders, and a couple of dates on the
Connections and AI Configuration admin pages.

## Who can do what

Reading the current timezone and date format is completely open — it's
bundled into the same endpoint the login screen and public application
form use before anyone is signed in, so there's no permission check on it
at all. Saving a change is the opposite: it requires the system-level
instance-admin flag on your account, the same one that gates every other
Master Configuration page. Unlike Managed Lists, there's no separate
fund-level permission path into it — holding an admin or editor role on
any fund does not let you change this setting.
