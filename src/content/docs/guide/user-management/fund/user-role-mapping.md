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
what you've typed is a valid email that matches no addable account does
a separate "Invite — creates a new Pending account" option appear,
visually distinct from a normal match.

> *An instance admin's email counts as "matches nobody" here too, since
> admins never appear in the addable-account list — so typing one shows
> the same Invite option a genuinely new email would. Clicking it doesn't
> work, though: it's rejected with "Admins have global access — no need
> to assign," a dead end the UI gives no hint of beforehand.*

Inviting a brand-new email creates their account as Pending, and the
page tells you so directly — though its own wording points at the wrong
fix: "Pending users can't log in until an admin resets their password
via Admin → Users." Resetting their password alone doesn't activate
them; what actually does is a separate action on that same screen,
covered on the [Users](/guide/user-management/master/users/) page,
flipping their status from Inactive to Active. There's no resend or
status-check action here — once you've sent the invite, finishing
activation means leaving this page entirely.

## Removing someone

Removing a member is immediate and unconditional — there's no backend
check for open work first, just a plain are-you-sure toggle in the UI.
It's a hard delete from this fund's membership, not something you can
undo by anything short of re-adding them, and re-adding starts fresh
with no memory of their old role template.

> *Removing someone from a fund only ends their access to it — it
> doesn't touch anything that already names them elsewhere, like being
> listed as a deal's Partner or Portfolio Manager. That assignment
> stays exactly as it was, now silently pointing at someone who can no
> longer open the deal, with nothing on this page to tell you it
> happened.*

## Permission overrides you can't see

The per-member permission override mentioned on
[Fund Roles](/guide/user-management/master/roles/) is, technically,
this page's own API to set — but nothing in the product's interface
ever actually sends one, on this page or anywhere else, so in practice
it's reachable only via a direct API call. This page makes that harder
to notice, not easier: it fetches whether a given member has one but
never shows it, so the role-template dropdown you see may not tell the
whole story of what that person can actually do.

## Who can do what

> *The "Users" link in fund settings shows for everyone, but opening it
> blocks anyone without the global instance-admin flag with a plain
> "Admin access required" message — regardless of what fund-level
> permission they hold. The permission node that actually gates writing
> to fund membership is fund-scoped, and the seeded Fund Admin template
> grants it — but that only matters for a direct API call, since this
> page's content stays blocked for a non-instance-admin either way. A
> Fund Admin delegated the ability to manage their own fund's members,
> the way the permission system is designed to allow, can't actually do
> so through the product today.*

Reading the member list, separately, has no dedicated permission check
at all beyond ordinary fund membership — any member of the fund, holding
any template, can read the full list via the API even without
`fund_settings.users` access themselves.
