---
title: 'Trash'
description: 'Where a deal goes when it is removed from its last fund — what actually lands here, and what restore does and does not guarantee.'
---

Trash holds **companies only** — nothing else in Capnatix (investors,
transactions, users, funds) ever ends up here. Specifically, it holds
deals that were removed from the *last* fund they belonged to.

Configure it at **Admin → Master Configuration → Trash**.

## What lands here

Removing a deal from a fund behaves differently depending on how many
funds it's currently in:

- If the deal is in **two or more funds**, removing it from one just
  unlinks it from that fund — the deal stays live everywhere else. It
  never touches Trash.
- Only when the fund you're removing it from is the deal's **only**
  remaining fund does it actually get soft-deleted into Trash.
- A deal that already has investments recorded in a fund (any
  transaction or investor tied to it there) can't be removed from that
  fund at all — the action is blocked outright, with guidance to mark it
  Closed instead.

:::note
There's a second, unrelated "soft delete" in Capnatix — removing a deal
from a fund's Kanban view via its own delete action just hides it into
that fund's Archive/Watchlist bucket (a `display` flag). That's a
completely different mechanism from Trash and doesn't touch the
`deleted_at` column this page reads. Only the "last fund" removal
described above lands a deal here.
:::

## Restoring

Restore puts a deal back exactly where it was — same fund, same stage,
same everything. Trashing and restoring only ever flip two columns on the
company record; nothing about the deal itself (stage, custom fields,
contacts, documents, discussions) is touched by either action, so there's
nothing to reconstruct.

:::caution
That guarantee depends on the fund itself still existing. If the fund a
deal was trashed from is later deleted while the deal is still sitting in
Trash, restoring it still "succeeds" — but the deal comes back with no
fund link at all. It won't appear on any fund's board, since every list
view is reached through a fund link, and you'd need to manually add it to
a fund again to make it visible anywhere.
:::

:::caution
The subtitle on this page, and the toast you see when a deal is trashed,
both say "recoverable for 30 days." In practice nothing enforces that —
there's no scheduled job that purges or expires anything sitting in
Trash. A trashed deal stays here indefinitely until someone manually
restores it. This is a real gap between what the product says and what
it does, tracked as INVOS-929, not something to plan around as if a
30-day window actually exists.
:::

## While a deal is in Trash

A trashed deal disappears from nearly everywhere — Kanban boards, deal
search, dashboards, and Deal Export reports all exclude it. The one
deliberate exception is IC meetings: if the deal was already on a
meeting's agenda before being trashed, it stays there, badged as deleted
rather than removed outright — and the IC Portal that external committee
members use to review a meeting keeps showing it too, since a past
meeting's record is meant to stay intact regardless of what happens to
the deal afterward.

## Who can do what

Trashing a deal isn't done from this page at all — it happens from
inside a fund, via that fund's own "Remove deal" action, and it's
available to any fund user with edit access to deal management and to
the deal's profile in that fund. It isn't an instance-admin action.

Viewing this Trash list and restoring from it, on the other hand, is
instance-admin only — the same strict gate as Date/Time and Custom
Fields, not the fund-permission-reaches-everything pattern seen on
Managed Lists and IC Members. So while trashing something is something
ordinary fund users can do as a side effect of their normal work, getting
it back out requires an instance admin.
