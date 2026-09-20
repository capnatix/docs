---
title: 'Roles'
description: 'Reusable permission templates a fund assigns to its members — not a fixed list, and not the same thing as the global admin flag.'
---

The in-app label for this page is actually **Fund Roles**, and that name
is the more accurate one: what you're managing here are reusable
permission **templates** — a named bundle of capabilities across
Capnatix's permission tree — not roles in the sense of "this person is an
admin." A template only does anything once a fund assigns a member to
it; templates themselves aren't tied to any particular fund, and have no
connection to the separate global admin flag covered on the
[Users](/guide/user-management/master/users/) page.

Configure it at **Admin → User Management → Fund Roles**.

## What's in it

This isn't a fixed list — you can create, edit, and delete templates
freely. Every instance starts with four seeded, built-in templates:

- **Fund Admin** — full control of the fund, including settings and
  member/role management.
- **Deal Lead** — edit Dealflow and Portfolio (including transactions);
  view Sourcing and Reports; no fund settings.
- **Sourcing Analyst** — full access within Sourcing only.
- **Analyst / Viewer** — read-only across the fund.

You can add as many additional custom templates as you want on top of
those four. Every template — built-in or custom — is configured the same
way: a name, a description, and a set of capability grants (View, Add,
Edit, Delete) walked across the full permission tree, node by node.
Templates don't specify which fund they apply to; that binding happens
per-member, from inside a specific fund's own user management page, not
here.

## How a template actually takes effect

A fund member's real, effective permissions are resolved fresh on every
request — read live from whatever template they're currently assigned,
not copied onto their membership at assignment time. That means editing
a template changes behavior immediately for every fund member currently
assigned it, across every fund on the instance, with no separate
propagation step and no confirmation step warning you of the blast
radius before you save. This applies to the four built-in templates just
as much as any custom one — nothing about being "built-in" makes Fund
Admin's permissions immutable, only undeletable (below).

A member can also be given a one-off permission override that replaces
their template's grants entirely for that one person — that override, if
one exists, isn't visible or editable from this page at all.

## Removing a template

The four built-in templates can be edited freely but can never be
deleted — there's no delete option for them at all. A custom template
can be deleted, but if anyone is currently assigned it, you're required
to pick a replacement template first; deleting reassigns every affected
member to that replacement in the same step, rather than leaving anyone
without a role.

## Who can do what

Creating, editing, or deleting a template requires the system-level
instance-admin flag — there's no fund-level permission path in here at
all, the same strict gate as Date/Time and Custom Fields.
