---
title: 'Deal Sourcing'
description: 'Sourcing and Dealflow — two stages of the same pipeline, sharing identical mechanics but not identical tooling.'
---

Sourcing and Dealflow are two of Capnatix's deal-pipeline buckets —
earlier and later stages of the same pipeline, not two different
systems. A deal is a single company record the whole way through;
moving it from Sourcing to Dealflow (or on to Portfolio) is nothing
more than changing which stage it's parked in.

Navigate to either from the fund's own sidebar — **Sourcing** and
**Dealflow**.

> *This page doesn't cover how a deal first arrives — that's the
> [Inbox](/guide/fund-operations/inbox/), where public application-form
> submissions are reviewed before becoming a deal — or how the
> application form itself is built, which is a separate concern under
> Fund Configuration.*

## What's the same

Both buckets render through the exact same kanban board, the same card
layout, and the same drag-and-drop mechanics — nothing about a Sourcing
card is structurally different from a Dealflow card, only what an admin
has chosen to display on the card slots per bucket can differ. Moving a
deal from Sourcing into Dealflow — or between any two buckets — is
literally just dragging its card to a different stage column, or
editing its Stage field directly. There's no dedicated "promote" step,
and no requirement that any particular field be filled in first.

## What's actually different

The two pages don't default to the same view: Sourcing opens as a plain
list; Dealflow opens as a kanban board. Either page lets you switch, and
your choice is remembered separately per page.

> *The list views aren't actually the same set of columns today,
> despite looking like they should be — Sourcing's list (shared with
> Watchlist and Archive) shows quite a few more fields than Dealflow's
> does, things like industry, source type, which application form a
> deal came from, and both valuation fields. This is a known,
> unintentional gap rather than a design choice, and is expected to
> close; if a field you rely on in Sourcing's list disappears when you
> switch to Dealflow, that's why.*

## Permission notes worth knowing

> *"+ Add Company" is visible to any fund editor on either page, but
> the permission that actually governs whether you're allowed to add
> one in that specific bucket is checked separately, only once you
> submit — it's possible to see and click the button and still be
> rejected. This is a known gap between what the button shows and what
> it's allowed to do, not intended behavior to plan around.*

> *Moving a deal between stages is checked against the bucket it's
> currently in, not the one you're moving it into. In practice, edit
> rights in Sourcing are enough to drag a deal all the way into
> Dealflow, even without a separate Dealflow edit grant — also a known
> gap, expected to be closed by checking the destination bucket too.*

## Who can do what

Viewing either board requires both the corresponding module being on
your instance's license plan and your role template granting view
access to that specific bucket. Adding a deal or moving one between
stages needs edit (or, for creating one, add) on the relevant bucket —
though, as above, a cross-bucket move only checks the bucket a deal is
leaving, never the one it's entering.
