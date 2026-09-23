---
title: 'Inbox'
description: 'Where incoming public application-form submissions are reviewed before they become deals.'
---

The Inbox is where a submission from your fund's public application
form lands for review. Before a submission becomes a deal, it lives
here — accepting it is what actually creates the deal; nothing appears
in Sourcing or Dealflow until then.

Navigate to it from the fund's own sidebar — **Inbox**.

> *This isn't where the application form itself is built — that's a
> separate screen for a different audience, under Fund Configuration.
> This page is for reviewing what people submitted, not designing what
> they're asked.*

## What's in it

Five tabs: Pending, Accepted, Rejected, All, and Drafts. Opening a
submission shows every field from the application form itself, laid out
the same way it was built — including any custom fields the form
collects, not just Capnatix's own built-in ones. A field nobody filled
in shows plainly as "Not filled" rather than being hidden.

Drafts is a different kind of tab from the other four: it's not a
review queue at all, just a read-only list of people who started
filling out the form but haven't submitted yet — autosaved on their
end, and cleared the moment they do submit. There's nothing to accept or
reject here, since there's no submission yet.

## Accepting a submission

Accepting creates the deal and asks you to choose which Sourcing stage
it starts in, pre-filled with the first stage by sequence — the normal
flow restricts you to Sourcing stages and lets you click Accept without
touching the dropdown at all, taking that default.

Whether you get a choice about the acceptance email at all depends on a
fund-level setting. Normally you do — send now, hold for later, or
schedule it, defaulting to hold every time. But a fund can switch
acceptance (and rejection) emails to send automatically instead; when
that's on, there's no choice to make here at all — it just goes out.

## Rejecting a submission

Rejecting doesn't delete anything. The submission stays, just marked
Rejected, with an optional reason you can attach. No deal is ever
created for it. Notifying the applicant works the same way as accepting
— your choice each time, unless the fund has switched rejection emails
to send automatically.

## Who can do what

Reaching the Inbox through the product takes two things together: an
editor-level fund role (view-only isn't enough) and the Inbox itself
being included in your instance's license plan — without both, the nav
item won't show and accepting or rejecting is rejected server-side.

> *Reading the raw list of submissions and drafts is looser than the
> rest of the page: those two endpoints only require being signed in,
> with no fund-role or license check behind them specifically. Treat
> that as an internal implementation detail rather than something to
> rely on — the intent is clearly editor-and-licensed-only, matching
> everything else here.*
