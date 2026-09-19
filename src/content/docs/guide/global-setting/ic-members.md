---
title: 'IC Members'
description: 'The instance-wide Investment Committee roster — and how it actually flows into who can vote on a deal.'
---

An Investment Committee (IC) member here doesn't have to be a Capnatix
user at all — this is a standalone roster of people (name + email) who
can be brought onto a fund's IC, whether or not they ever log in. Someone
with no Capnatix account can still be added, assigned to meetings, and
vote through an emailed link, entirely outside the normal login flow.

Configure it at **Admin → Master Configuration → IC Members**.

:::note
This is one of three layers, not the whole picture. This page manages a
single **instance-wide roster** — everyone who could potentially serve on
any fund's IC. A fund then explicitly **associates** roster members it
wants on its own IC, from that fund's own Settings → IC Members page.
Only once someone is associated with a fund can that fund **assign** them
to a specific meeting, which is what actually makes them a voter. Adding
someone here doesn't put them on any fund's IC by itself — it just makes
them selectable.
:::

## What's in it

A simple roster: Name, Email, and Active/Inactive status. You can add up
to 10 people at once through the same form. Optionally, a roster entry
can be linked to an existing Capnatix user account — but that link is
never automatic and never required; most of the value here is supporting
people who aren't platform users at all (an external advisor, an LP
observer) alongside people who are. Email must be a valid address and is
unique instance-wide, case-insensitively — you can't add the same email
twice even with different capitalization.

There's no delete button, only Deactivate/Reactivate — a roster entry is
never hard-removed, on purpose (see below).

## Not a reference list — this actually drives voting

Despite living under a fairly quiet "Master Configuration" label, this
roster is the root of a real, functional chain: instance roster → fund
association → meeting assignment → who receives a voting token → whose
vote the decision engine actually counts. Deactivating someone here, or a
fund removing its association with them, genuinely changes who can be
picked for that fund's *future* meetings — it isn't just informational.

What it does **not** do is reach backward: deactivating a roster entry,
or a fund dissociating from someone, never touches a meeting they're
already assigned to. Eligibility only governs who *can be added* to a
meeting going forward; once someone is on a meeting, they stay a valid
voter there regardless of what happens to the roster or fund association
afterward. Every past assignment and vote is preserved exactly as it was
cast.

## Removing someone

Deactivating a roster entry here (there's no true delete) doesn't warn
you about anything, because it can't retroactively affect any meeting —
by design, it only stops that person from being newly selectable.

Removing a fund's *association* with someone (from that fund's own
Settings → IC Members page, not this one) is different: it's a real
removal of that fund's link to them, and it does check first — if the
person is assigned to any upcoming, not-yet-locked meeting for that fund,
you'll see a warning listing those meetings before you confirm. The
removal itself is never blocked, though, even if they're on an upcoming
meeting; the check is there to inform the decision, not prevent it.

## Who can do what

This instance-wide roster is **not** gated by the system-level
instance-admin flag the way Date/Time and Custom Fields are. Instead, it
uses the same permission node — "Manage IC Members" — checked across
**any fund** the user belongs to: holding that permission on even one
small fund is enough to view, add, edit, or deactivate entries in the
**shared, instance-wide** roster, the same style of surprise as Managed
Lists. Associating or dissociating a roster member from a *specific*
fund, and assigning them to a *specific* meeting, are both checked
against that one fund only — a user with the permission on Fund A can't
touch Fund B's associations or meeting assignments even though they can
see and edit the shared roster itself.
