---
title: 'User Role Mapping'
description: 'Who can access this fund and which role template they hold — separate from where templates themselves are defined.'
---

This is where a fund controls its own membership: who can get in, and
which role template (defined instance-wide on
[Fund Roles](/guide/user-management/master/roles/)) each person holds
while they're here. It doesn't define templates itself, and it doesn't
manage accounts platform-wide — that's
[Users](/guide/user-management/master/users/). This page just maps
people to templates, for one fund.

Configure it at the fund's own **Settings → Users**.

## What's in it

A single list, split into a "Pending Invites" section (only shown if any
exist) and an "Active" section. Each row shows the person, a status
badge where relevant, and a role-template dropdown you can change
directly — there's no separate save step, and no confirmation before it
takes effect. Like everywhere else permissions are resolved in Capnatix,
a template change applies live, from that person's very next request; no
re-login needed. There's no bulk action of any kind — everything here is
one person at a time.

## Adding someone

One "Invite User" flow handles both adding someone who already has a
Capnatix account and inviting a brand-new email, and the UI makes clear
which one you're doing. Pick a role template first, then search: if what
you type matches an existing account, clicking it adds them to the fund
immediately with no email sent and no new account created. Only when
what you've typed is a valid email that matches nobody does a separate
"Invite — creates a new Pending account" option appear, visually distinct
from a normal match.

> _Inviting a brand-new email creates their account as Pending, and the
> page tells you so directly: "Pending users can't log in until an admin
> resets their password via Admin → Users." There's no resend or
> status-check action here — once you've sent the invite, this page has
> nothing more to offer; finishing activation means leaving it entirely
> for the separate Admin → Users screen._

## Removing someone

Removing a member is immediate and unconditional — there's no backend
check for open work first, just a plain are-you-sure toggle in the UI.
It's a hard delete from this fund's membership, not something you can
undo by anything short of re-adding them, and re-adding starts fresh
with no memory of their old role template.

> _Removing someone from a fund only ends their access to it — it
> doesn't touch anything that already names them elsewhere, like being
> listed as a deal's Partner or Portfolio Manager. That assignment
> stays exactly as it was, now silently pointing at someone who can no
> longer open the deal, with nothing on this page to tell you it
> happened._

## Permission overrides you can't see

A member's role template isn't the only thing that can shape their
access — there's also a per-member override that can replace a
template's grants entirely for one person. It exists at the data layer
and this page's own API can technically set one, but nothing in the
product's interface, on this page or anywhere else, ever actually sends
one. In practice it's unreachable outside a direct API call. Worse,
there's no way to tell from this page whether a given row is even
affected by one — the information is fetched but never shown, so the
dropdown you see may not tell the whole story of what that person can
actually do.

## Who can do what

> _This page hides itself entirely from anyone without the global
> instance-admin flag — regardless of what fund-level permission they
> hold. The permission node that actually gates writing to fund
> membership is fund-scoped, and the seeded Fund Admin template grants
> it — but that only matters for a direct API call, since the page
> itself never lets a non-instance-admin see it in the first place. A
> Fund Admin delegated the ability to manage their own fund's members,
> the way the permission system is designed to allow, can't actually do
> so through the product today._

Reading the member list, separately, has no dedicated permission check
at all beyond ordinary fund membership — any member of the fund, holding
any template, can read the full list via the API even without
`fund_settings.users` access themselves.
