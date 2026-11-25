---
title: Planning
description: Plan work as a tree of GitHub issues (a plan, ordered items, and segments grouping independent ones) without implementing it, as a rolling wave that makes ready the items whose foundation exists and leaves the rest to deepen once the work they build on lands. Use proactively in the main session when the user asks to plan, scope, break down or design work, or to create, restructure or review planned issues, so its questions reach the user directly.
---

# Planning

Turn a goal into a tree of GitHub issues specifying the end state: each issue states its outcome and the contracts others rely on, never the procedure, and the worker walking it designs the code. What is not settled yet stays visible under **Planning** or **Questions**.

## Role

You build and maintain the issue tree. Create and edit issue drafts as the conversation settles things, without asking first. Before writing or reviewing any issue, read `.claude/rules/issues.md`, `.claude/rules/issue-drafts.md` and this file, which holds the issue types, splitting, ordering, deepening an item and readiness:

<!-- @shared-file issue-tree.md -->
<!-- @end -->

Edit nothing but issues, context files, the backlog and the agent records, apart from code the user explicitly asked you to implement and instructions under Instruction maintenance.

## Modes

| Mode         | Started by                          | Scope                               | Runs              | Asks through                         | Publishes                                                                                                             |
| ------------ | ----------------------------------- | ----------------------------------- | ----------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Main session | The user                            | The tree                            | `main-session.md` | The user                             | By the issue-drafts rule's default                                                                                    |
| Inner        | A planning session, briefed `inner` | The briefed item and its sub-issues | §Inner pass       | The planning session, in your report | Each issue once ready or left with only **Questions**: a planner stopped midway loses none of the issues it published |

Started by the user, read this file first:

<!-- @skill-file main-session.md -->
<!-- @end -->

## Decisions and questions

An issue edit undoes a wrong guess before any worker builds on it, so your own questions get latitude. The user's requests and answers get none: analyse each one through the plan and the code before writing it, and pause on every costly reach, however the request words it.

- Count as costly any reach that changes the plan's **Compass**, **Done when**, Model sections or **Decisions**. Splitting, merging and reordering items under them is not costly (issue-drafts rule › Size).
- When pausing on a request's reach, name the issues and decisions it rewrites, and compare it with a change confined to the concern the request raises.
- Record each costly reach the user confirms in the plan's **Decisions** with the alternative it overrode.
- Write what no open question affects without waiting for answers.

Investigate every question in the code, configuration, history, documentation, dependencies and issues it touches, by the analysis method in these files, and work out its candidate answers, before handling it below:

<!-- @shared-file analysis.md -->
<!-- @end -->

<!-- @shared-file request-analysis.md -->
<!-- @end -->

### Latitude

| Mode         | Settle yourself                                                                 | Never settle                                                                      |
| ------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Main session | What investigation settles or makes reasonably clear, balanced options included | Changes to the plan's **Compass**, **Done when**, Model sections or **Decisions** |
| Inner        | The same, within your scope                                                     | Also what the plan, a sibling or a shared contract owns                           |

Handle each question, after investigation:

- **Within your latitude**: decide it, write it into the issue as decided, and list it in your reply so the user can correct it.
- **Beyond it**: ask through your mode's channel, batched with your findings, as the decision protocol words questions, and change neither the plan nor the code meanwhile.
- **Still open once the item's need is settled**: create the issue with what is known, the rest under **Questions** with your findings and candidate answers.
- **Answered**: fold the answer into the body as decided and remove the question.

## Nested plans

Extract a part of a plan into its own plan when the Roadmap grows too long to scan or the part is clearly distinct from the rest. Do it when obvious; otherwise propose it with the part's scope.

- A nested plan works on its own: its compass, design and decisions cover its part without reading the plans that reference it.
- Move into it every fact only its part uses; link with their gist the facts it shares with other plans.
- Other plans treat it as a task: one Roadmap entry, never expanded, with a gist stating what it contributes there.

## Inner pass

Deepen the item by `issue-tree.md` › Deepening an item.

As an inner planner:

- Edit only the briefed item and its sub-issues. A finding against the plan, a sibling or a shared contract goes into your report with a recommendation: the planning session owns it.
- Report the issues you published, each decision you settled, the batched questions and the plan findings.

## Architecture review

When the user or your brief asks, review the plan's structure by this file; offer it when the work adds a package, environment or namespace, or moves a domain across them:

<!-- @shared-file architecture-review.md -->
<!-- @end -->

## How workers read issues

Read the implement and walking skills only when an issue's wording depends on how a worker or the walker handles it, never while a plan's design is open.

## Steps migration

Transitional: delete this section, with the consultant skill's, once no open issue holds **Steps**.

- **The user asks to convert the issues holding Steps or `Checkpoint:` lines.** Dispatch one `consultant` per parent holding some, and one for the standalone ones, each briefed with `Steps sweep: <refs>` as its first line, by the dispatching file `main-session.md` names. Show the user each draft's diff from its report, then resume those drafts and publish the ones the user approves yourself.
- **Meeting an issue holding Steps or `Checkpoint:` lines.** Edit nothing in it and leave it set aside; report it to whoever started you as a Steps-migration breakage, for them to record, which a Steps sweep converts.
