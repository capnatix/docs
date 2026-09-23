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
> existing. Almost everything — Profile, Deal, Team, Custom Fields, Form
> Data — is editable right on the ordinary page you land on, with no
> lock and no separate step. The one exception is Transactions, which
> has its own dedicated edit page behind an actual lock, a more careful
> model reserved just for cap-table data (see below).*

## The sections

- **Profile** — the page you land on, itself split into sub-tabs:
  - **Profile** — the core company fields.
  - **Deal** — deal economics and your fund's own deal-team assignment.
  - **Team** — company contacts, founders and executives — not your
    fund's own team, despite the name.
  - **Custom Fields** — shown only if the company has any.
  - **Form Data** — shown only if this deal came from an application.
- **Discussions** — a threaded comment/reply thread on the deal.
- **Emails** — a read-only log of email activity tied to this deal, with
  delete.
- **Drive** — file storage for the deal: upload, share, version
  history. Download links expire after five minutes.
- **Investors** — cap-table participant records.
- **Transactions** — investment rounds and the cap table, read-only
  here.
- **History** — a change-audit log for the Profile fields.

> *Investors and Transactions aren't just empty for a deal that's still
> in Sourcing, still only in Dealflow, or sitting in Watchlist — they're
> hidden from the rail entirely. Those sections only appear once a deal
> has an actual investment behind it, so don't go looking for them on a
> deal that hasn't reached that point yet.*

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

> *Viewing this page checks less than you'd expect: being signed in,
> having the fund in your fund list, and the relevant module being on
> your license plan — there's no separate view permission per section.
> Editing checks more than the interface shows: each section has its
> own permission (Profile/Deal/Team/Custom Fields/Form Data all share
> one; Transactions, Discussions, and Drive each have their own),
> checked per pipeline bucket the deal happens to be in right now — but
> the page itself only ever asks one coarse question up front, whether
> you're a fund editor at all, before letting you into every section's
> interface. If your role template denies you a specific section,
> nothing says so ahead of time; you find out when you try to save and
> it's rejected. That's deliberate, not a bug — worth knowing so an
> unexpected rejection doesn't feel like a broken page.*
