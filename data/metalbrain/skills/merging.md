---
title: Merging
description: Review what a walk landed across its leaves, integrating each concurrent leaf onto the walked branch and reviewing each segment at its close. Use only when a skill you follow or the user asks for a merger.
category: workflow
extension: tools/github/issues/planning
order: 27
invocation: explicit
agent:
  name: merger
  description: Merger that rebases a walked leaf onto the walked branch and reviews it against its issue and its siblings, or reviews a closed segment or plan against its siblings and the code around it, fixing only mechanical, behaviour-neutral edits inside the diff. Dispatch it only when a skill you follow or the user asks for a merger; otherwise do the work yourself.
  model: opus
  effort: medium
  budget: standard
  freshness: 2
  tools:
    - Bash
    - Read
    - Edit
    - Write
    - Skill
    - ToolSearch
---

# Merging

Review what a walk landed across its leaves, the issues the walker dispatched to a worker or a debugger, and report every finding; fix only what §Findings puts within the fix radius.

## Modes

| Mode        | Runs                                                                                                               | Its findings go to                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Integration | Per leaf, resumed for each leaf of a segment: rebase, then a review against its issue and siblings                 | Leaf findings: the leaf's agent; plan findings: the consultant |
| Review      | At each segment's and nested plan's close and at the walk's end, on the range landed since the previous review run | Plan findings: the consultant; the rest: a debugger            |

Read this file before your first review, in either mode: integration mode reviews each leaf by its criteria, and both modes list and sort findings by it:

<!-- @shared-file review.md -->
<!-- @end -->

## Brief

- **Integration**: the plan and segment; the leaf's issue; its checkout (its worktree, or the main checkout); its dispatch base, on a `Base: <sha>` line; the walked branch's `HEAD` commit; the commit range other leaves landed since the dispatch base (empty at K = 1 and when no other leaf landed); the actions the leaf's report leaves undone; for a new merger mid-segment, the previous one's carry-over.
- **Review**: the plan and segment, or the plan whose close runs the review; the commit range landed since the previous review run, the carry-over of that run and of the integration runs since.

- Read the issues and plan sections the brief names, and the landed commits.
- Treat the carry-over as findings already handled: never report them again.

## Rebase

In integration mode only, and only when the briefed landed range is not empty. Work in the briefed worktree: run every command from it and edit its files by their absolute paths, never the main checkout.

1. Set the uncommitted rest aside with `git stash push --include-untracked`.
2. Rebase the leaf's commits onto the briefed `HEAD` commit, then restore the rest with `git stash pop`.
3. Resolve each conflict: regenerate a generated file with `pnpm engrenage sync`, keep both sides of an append-only agent log, and merge a hand-written file so both sides' intent holds.
4. When a hand-written conflict needs a choice neither side's issue settles, run `git rebase --abort`, restore the rest, and report the conflict with each side's intent.

- Create no commit beyond the ones the rebase rewrites.

## Integration

- Read the leaf's diff against its dispatch base, or the briefed `HEAD` commit after a rebase, and the code around each hunk; leave twin searches, jscpd and whole-file reads to the review run.
- Review it by `review.md`, its siblings being the landed range and the leaves you integrated earlier in this run, and against release or project requirements a sibling meets.
- Close each light gap yourself as a mechanical fix, never a leaf finding: a missing changeset, with the bump and summary the changesets rule sets; a missing `@debt` marker or JSDoc the lint asks for; an action the instructions already decide that the leaf's report leaves undone, once you confirm its trigger holds. Report a light gap a permission refuses you as undone, never as a question.

## Review

The range base is the range's first parent.

- Read whole every file the range changes; search beyond them only for twins of what the range adds, by name and shape, in the changed domains and the domains they import.
- When the project has jscpd, run `pnpm engrenage jscpd:new <range base>` once, and verify each clone it lists as a lead.
- Compare each leaf of the range with the rest of the range: duplicated helpers, tests or fixtures; diverging names, patterns or choices for one concern; code one leaf added that another could reuse; release or project requirements one leaf meets and a sibling misses.
- In each changed module, look for helpers two modules now need, helpers duplicating an export of a dependency or another domain, and near-twins to merge; check that each function still serves its module's concern and role, and that no concern is handled two ways.
- Read the code around each change for bugs, and for improvements the change makes worth doing.
- At a plan's close, check each clause of its **Done when** against the code: one not holding is a plan finding.

## Findings

- Leave to the commit gate whatever it enforces, and run no worktree gate: the walker's gates, its commit gate and the leaf's stop gate, check your fixes.
- Base each finding on a defect or on a project rule no tool enforces, and name it.
- A finding lies in the reviewed files when its fix stays in the files the leaf's diff (integration) or the range (review) changes, or extracts a helper they share into their domain, and changes no stated contract.
- A fix is within the fix radius when it is mechanical, changes no behaviour and stays inside the leaf's diff; a new file the project requires for the leaf counts as inside it.

Sort each finding by the first matching row:

| Finding                                                           | Integration                          | Review                              |
| ----------------------------------------------------------------- | ------------------------------------ | ----------------------------------- |
| A plan finding (`review.md`)                                      | A plan finding                       | A plan finding                      |
| Its fix within the fix radius                                     | Fix it                               | A finding                           |
| In the reviewed files and the leaf's issue                        | A leaf finding                       | A finding                           |
| In the reviewed files, outside the leaf's issue                   | A carry-over line for the review run | A finding                           |
| A likely or proven bug beyond the reviewed files                  | A backlog entry                      | A backlog entry                     |
| Any other finding located in the code, beyond the reviewed files  | A `@debt` marker at its site         | A `@debt` marker at its site        |
| Not located: a missing abstraction, drift across domains, tooling | A backlog entry                      | A backlog entry                     |
| A solution you weighed and set aside                              | A line under the agent-records rule  | A line under the agent-records rule |

- Edit only your mechanical fixes, debt markers, the backlog and the agent logs, in the tree you review; never edit an issue or commit.

## Report

Report for the run or the leaf, under Writing › Reports:

- The conflicts you resolved, each with its resolution, or the aborted rebase and the conflict that stopped it.
- **Carry-over**, for the walker and the next run: the fixes you applied, light gaps included, the leaf findings (integration) or the findings (review), the plan findings, then the carry-over lines for the review run, each with its file, the defect or rule, and the expected change.
- The debt markers, backlog entries and discarded-solutions lines you added.
