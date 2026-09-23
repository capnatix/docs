---
title: 'Deal Detail'
description: 'What actually opens when you click into a deal — the real section structure, what edits where, and how it changes as a deal crosses buckets.'
---

Clicking any deal card in Sourcing, Dealflow, or Portfolio opens the same
page, because it's the same underlying record wherever it currently
sits. What you land on is a left-hand rail of sections — a few of them
aren't quite what their labels suggest, so it's worth reading through
once.

> *There's no single "edit mode" for a deal, despite an `/edit` URL
> existing. Profile, Deal, Team, Custom Fields, Form Data, and
> Investors are all editable right on the ordinary page you land on,
> with no lock and no separate step — the `/edit` URL's own Profile and
> Investors links just take you straight back there. The one section
> actually edited on `/edit` is Transactions, behind a real lock (see
> below).*

## The sections

- **Profile** — the page you land on, itself split into sub-tabs:
  - **Profile** — the core company fields.
  - **Deal** — deal economics and your fund's own deal-team assignment.
  - **Team** — company contacts, founders and executives — not your
    fund's own team, despite the name.
  - **Custom Fields** — shown only if the company has any.
  - **Form Data** — shown only if this deal came from an application.
- **Discussions** — a threaded comment/reply thread on the deal.
- **Emails** — a log of email activity tied to this deal. Mostly
  read-only (with delete), but replying from here is its own separate
  permission — someone with that grant can send outbound email as the
  fund, straight from a deal's thread.
- **Drive** — file storage for the deal: upload, share, version
  history. Download links expire after five minutes.
- **Investors** — cap-table participant records.
- **Transactions** — investment rounds and the cap table, read-only
  here.
- **History** — a change-audit log for the Profile fields.

> *Investors and Transactions aren't just empty for a deal that's still
> in Sourcing, still only in Dealflow, or sitting in Watchlist — they're
> hidden from the rail entirely. Whether they show up is decided purely
> by which bucket the deal is currently in (Portfolio makes them
> appear), not by whether any investment has actually been recorded
> yet — a deal freshly moved into Portfolio with nothing entered will
> still show both sections, just empty.*

## Editing the core fields

Profile, Deal, Team, Custom Fields, and Form Data are all edited inline,
right here, with no separate mode and no lock — if two people edit the
same deal at the same time, whoever saves last wins.

> *The "Team" sub-tab is company contacts, not your fund's own deal
> team. Deal Partner, Deal Manager, Portfolio Manager, and Deal
> Originator are assigned from the **Deal** sub-tab instead, and those
> assignments are per fund — the same company can have a different Deal
> Partner in each fund it's linked into, since the assignment is stored
> against the fund-company pairing, not the company alone.*

## Editing the cap table

Transactions is the one section with real editing machinery. Clicking
Edit takes you to a dedicated page behind a pessimistic lock — while
you're on it, nobody else can edit that deal's transactions; they'll see
who's holding the lock instead of an Edit button. Round order can't be
changed once a round exists, since which lots an exit consumes against
already-booked gains depends on it.

## Archiving or removing a deal from here

The stage control next to the company name doubles as the way into
Archive or Watchlist — picking either target opens a small form asking
for a reason (and, for Watchlist, a reminder date) before it takes
effect. This option isn't offered at all once a deal is in Portfolio;
an invested deal doesn't move to Archive or Watchlist from here.

Separately, a menu in the page header handles moving the deal to a
different fund entirely, or removing it from this one — the same
delink-if-in-other-funds-otherwise-Trash behavior, and the same block
against removing a deal that already has investments recorded in this
fund, described on the [Trash](/guide/global-setting/trash/) page.

## Who can do what

> *Every section here is its own permission, checked per pipeline
> bucket the deal is currently in — Profile/Deal/Team/Custom
> Fields/Form Data share one node between them, and Transactions,
> Investors, Discussions, Emails, and Drive each have their own,
> independent of the others. Reading a section you don't have access to
> is rejected as soon as that section tries to load its data — you'll
> see it fail to load, not silently show wrong data. Editing is looser:
> the page itself only asks one coarse question up front, whether
> you're a fund editor at all, before letting you into every section's
> edit interface. If your role template then denies you write access to
> the specific section you're in, nothing says so ahead of time — you
> find out when you try to save and it's rejected. That asymmetry is
> called out directly in the app's own code comments as intentional,
> not an oversight.*
