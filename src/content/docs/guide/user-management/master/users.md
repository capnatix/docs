---
title: 'Users'
description: 'The instance-wide account list — adding, deactivating, and the real difference between deactivate and delete.'
---

This is every user account on the instance, regardless of which fund (if
any) they belong to — fund membership is separate data, mostly managed
from a fund's own user page rather than here. What you always set here is
each person's account status and their **global** admin flag; per-fund
role assignment (which templates from [Fund
Roles](/guide/user-management/master/roles/) someone holds) is usually a
fund-page action too, with one exception — adding a brand-new user (below)
does it inline, in the same step.

Configure it at **Admin → User Management → Users**.

## What's in it

The table shows Name, Email, global Role (Admin or User — this is the
same flag that gates every other Master Configuration page), Status
(Active, Inactive, or Pending), and Last Login.

**Adding a user** asks for their name, email, and global Role. If you
leave the role as User, you're also required to assign them to at least
one fund with a role template in the same step — so a brand-new user's
first fund assignment can be set up entirely from this page. Choosing
Admin instead skips fund assignment, since a global admin doesn't need
one. A temporary password is generated and emailed to them immediately,
and the account is active right away — they can log in as soon as they
receive it.

**Editing** a user lets you change their name, global Role, and Active/
Inactive status — but not their fund memberships or role templates; that
still happens on the fund's own page. The Edit button is disabled on your
own row — that's a browser-side guard rather than something the server
also enforces, so treat it as guidance, not a hard boundary.

**Reset Password** generates a new temporary password, emails it, forces
a password change on next login, and immediately invalidates that
person's existing sessions — anyone currently logged in as them is
signed out.

## Two ways to add someone to a fund — and they don't behave the same

Adding a brand-new user from this page (above) creates an active account
right away. There's a second path — inviting a new email address
directly from a fund's own user page — that behaves differently for a
first-time invite:

> *Inviting a brand-new email address from a fund's own user page creates
> the account as **Pending**, not Active — but sends the exact same
> "here's your temporary password, log in" email that Admin → Users
> sends for an account that actually can. The invited person can't sign
> in with that password until an instance admin comes here and flips
> their status to Active. Until then, following the email's own
> instructions just fails. This is a known gap between the two invite
> paths, not expected behavior to work around by guessing at it.*

Inviting someone whose email **already exists** as a user, from either
path, doesn't create a duplicate account — the existing user is looked up
and added to (or updated on) the fund in question instead.

## Deactivating vs. deleting — these are not equivalent

Deactivating a user cuts off access immediately — their very next request
is rejected even if they still have a valid, unexpired session, since
every request re-checks whether the account is active. Nothing else
changes: their fund memberships and role assignments stay exactly as
they were, just dormant, and reactivating them restores full access with
no need to reassign anything.

> *Your license caps how many active users you can have, and Add User
> correctly blocks you once you're at that cap. Reactivating someone,
> though, doesn't check the cap at all — you can bring a deactivated
> user back regardless of how many active seats your license allows,
> with no warning that you've gone over.*

Deleting a user is a completely different, and permanent, action —
there's no recovery, no Trash. It also cascades: every one of that
person's fund memberships is removed along with the account itself, so
deleting someone doesn't just end their access, it erases the record of
which funds and roles they ever had. You can't delete yourself or the
instance's last remaining active admin.

> *Deactivate and Delete read like two strengths of the same action, but
> they aren't. Deactivating is the reversible, "pause this person"
> option and preserves everything. Deleting is irreversible and destroys
> their fund-membership history along with the account. If you're not
> certain, deactivate — you can always delete later, but never the other
> way around.*

## Who can do what

Every action on this page — viewing the list, adding, editing,
deactivating, resetting a password, or deleting — requires the
system-level instance-admin flag, with no fund-level path in. The one
related piece of data that's open more broadly is the list of role
template names (not their permissions) used to populate the fund-invite
picker — that's available to any signed-in user managing their own
fund's members, not just instance admins.
