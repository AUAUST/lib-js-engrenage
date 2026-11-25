# Main session

`planning §…` names the planning skill's sections, a bare `§…` this file's.

## Requests

Handle each request of the user by its kind:

| Request                                                         | Handling                                                                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Code change                                                     | Write it into the issue owning it. Implement only when the user explicitly asks you to leave planning for that piece of work            |
| Agent instructions or project context for the current structure | Apply now, under Instruction maintenance, so workers start with the correct context                                                     |
| Instructions for a change not yet made                          | Add the instruction change to the task making that change, in the form Writing sets for issues, its behavior wanted under **Done when** |

## Outer pass

Lay the groundwork in breadth: the plan, the tree, and each item's context, valid enough for a planner or the walk's consultant to deepen the item alone.

1. **Goal.** State the concern behind the request, the target outcome resolving it and what done means for the whole plan. Create the plan issue as soon as the goal is clear.
2. **Load.** Load the open-issue index (issue-drafts rule › Filing). Read the project maps the goal needs (issue-drafts rule › Owners), the backlog categories, `@debt` markers, discarded solutions and missing capabilities covering what the goal touches.
3. **Implications.** Find everything the goal touches (domains, entry points, models, conventions, contracts, call sites, issues, backlog entries, debt markers) and how the plan relates to each: extends, supersedes, conflicts with or depends on it.
4. **Design.** Write into the plan its **Done when**, the Model sections and the **Decisions** several items share (issue-drafts rule › Bodies). A fact two items would each decide belongs here.
5. **Items.** Create, split, order and link each item as soon as its need is settled. Give it its header, its **Context** with the reach **Implications** found, its **Prerequisites**, its **Done when**, and under **Planning** the design left to settle.
6. **Reconcile.** Extend an overlapping issue instead of creating one, mark duplicates, relate the issues the plan supersedes, and track the backlog entries it takes up.

Every path, name and reference the issues state matches reality or is an explicit decision to change it.

## Waves

Then handle each item by the first matching row:

| Item                                                                      | Handling                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| All its design rests on code another open item writes                     | Leave it under **Planning** for the walk's consultant (`issue-tree.md` › Deepening an item)                  |
| Over one agent's worth, or provides or relies on a Model-section contract | An inner planner (§Inner dispatch): it splits the item or grounds the contract in code, outside this context |
| Any other                                                                 | Deepen it yourself by `issue-tree.md` › Deepening an item                                                    |

Report each item as ready, with its inner planner, or left under **Planning** with the items it waits on.

## Inner dispatch

Read this file before the first inner dispatch, for parallel agents, the brief lines, thoroughness stops and the findings a report names:

<!-- @shared-file dispatching.md -->
<!-- @end -->

Once the groundwork holds:

- the plan has no **Planning** or **Questions**, and the user confirmed its **Goal**, **Done when**, Model sections and **Decisions**;
- every item states its **Context** and, under **Planning**, what is left to design;
- every fact more than one item would decide is in the plan;
- every draft is published.

1. Run inner planners side by side only as `dispatching.md` › Parallel agents allows for agents costing an analyser's run, at most K when the user's request sets `pool <K>`, dispatching the next item as each reports. Dispatch a new `planner` per item §Waves sends to one, in the background and in the main checkout, briefed `inner` with `Issue: <owner>/<repo>#<n>` as the first line and the plan number. A segment whose members share their design is one item; group no other items: every turn re-reads a planner's whole context, so its cost grows faster than its items.
2. Batch the inner planners' questions to the user, apply their plan findings yourself, and resume every inner planner whose item an answer or a plan change affects, already deepened or not, each resume counting as a planner in flight.
3. Once every inner planner has reported, review the items they deepened under `issue-tree.md` › Readiness.
