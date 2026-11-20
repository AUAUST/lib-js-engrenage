---
title: Walking
description: Walk a planned tree of GitHub issues in order, dispatching each leaf to a worker or debugger, then reviewing and committing it. Use only when the user asks to walk an issue tree.
category: workflow
extension: tools/github/issues/planning
order: 25
invocation: explicit
formerly:
  - issue-walking
---

# Walking

Walk an issue tree in the main session: route each issue by the handling table, have each leaf implemented and reviewed, commit it and report. You own sequencing, routing, commits and applying issues' **Housekeeping** (§Housekeeping); you design and implement nothing. §Context bounds what you read.

## Modes

The walk request sets them:

| Request words                                                 | Effect                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `pool <K>` or `K = <K>`                                       | K leaves in flight; 3 when unset                                  |
| `sequential` or `no pool`                                     | K = 1                                                             |
| No depth, `depth 0` or `depth 1`                              | Plan depth 1: nested plans are set aside                          |
| `depth <n>`; `and direct children` or `and child plans` for 2 | Plan depth n: the walked plan and the plans n − 1 levels below it |
| `deep`, `deeply` or `traverse`                                | Plan depth `all`: every plan below the walked one                 |

With `autonomous` in the request, no user answers: read this file before the first `walk check` and again after each compaction:

<!-- @skill-file autonomous.md -->
<!-- @end -->

## Flow

```
walk check ──► route the ready set (§Handling table)
  │
  ├─ Housekeeping ──► apply it (§Housekeeping) ──► closing commit ──► walk check
  │
  ├─ leaf ──► dispatch (§Dispatching) ──► agent report
  │              ├─ blocked ──► consultant ──► resume the agent
  │              ├─ scope stop ──► consultant splits the issue ──► drop the leaf's work ──► walk check
  │              └─ completion
  │                   ▼
  │             integration merger (§Integration), or your own review (§Review)
  │                   ▼
  │             gaps and leaf findings ──► resume the agent ──► check its fixes
  │                   ▼
  │             closing commit (§Commit) ──► commit line ──► walk check
  │
  └─ segment or walk closes ──► review merger ──► debugger, on findings ──► commit ──► walk check
```

## Handling table

Run `pnpm engrenage planning walk check <n> --depth <plan depth>` on the issue the user names: at the start, after each commit, consultant return, reshape planner's return, debugger write-up and drop of a leaf's work, never in between. It reports every issue of the tree in tree order, each parent above its sub-issues, with its state (open, closed, or closed by an unpushed commit), `blockers`, check findings, open **Planning** and **Questions** and local commits, then the ready set, every issue actionable in turn within the plan depth, each `task` and `problem` with the agent its shape sends it to, `worker` or `debugger`, or `orchestrator`, you, for one holding **Housekeeping**, and the next issue, or `Next: none, walk finished` once the walked issue is closed; it exits 1 only on a stuck walk, the walked issue open with an empty ready set.

A leaf is an issue a row of the table below dispatches to a worker or a debugger; a foreign leaf, a leaf of another registered repository. On a foreign leaf or a worker report opening with `Linked defect:`, first read this file, which replaces each step of this skill it covers:

<!-- @skill-file cross-repository.md -->
<!-- @end -->

Handle each issue by the first matching row; the `complexity` row applies on top of the row that dispatches. Every issue ordered after a set-aside one waits, left out of the ready set: keep walking the rest.

| Issue                                                                                                                               | Walker                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Closed, or closed by an unpushed commit                                                                                             | Skip                                                                                                                                        |
| A nested `plan` past the plan depth                                                                                                 | Set aside: walked on its own                                                                                                                |
| Open sub-issues                                                                                                                     | Walk them in order (a `segment`'s in any), handling the issue's own check findings by the rows below without stopping; then its own work    |
| `plan` or `segment` with no open sub-issue                                                                                          | Closes with its last leaf's commit; the walked issue with §Boundary reviews' walk-end commit instead                                        |
| `blockers` `drafting`, with `.ai/issues/<n>.draft.md` present                                                                       | Set aside: it is being planned                                                                                                              |
| `blockers` `drafting`, with no local draft                                                                                          | Ask the user whether to clear the claim and walk it; on yes, run `pnpm engrenage planning issue release <n>` and handle it by the next rows |
| `blockers` `awaitingOthers` or `delayed`, or an open blocked-by issue                                                               | Set aside and report                                                                                                                        |
| Open **Planning**, `blockers` `outdated`, check findings for its structure, or a `task` with neither **Steps** nor **Housekeeping** | Set aside; send it to the consultant                                                                                                        |
| Open **Questions**                                                                                                                  | Set aside; batch the questions to the user                                                                                                  |
| Foreign `task` or `problem` whose repository `pnpm engrenage link` lists no checkout for                                            | Set aside and report                                                                                                                        |
| `walk check` names `orchestrator` beside it in the ready set                                                                        | Apply its **Housekeeping** yourself (§Housekeeping)                                                                                         |
| `task` or `problem`                                                                                                                 | The agent `walk check` names beside it in the ready set; foreign, through `cross-repository.md`                                             |
| `complexity` set                                                                                                                    | Dispatch at the effort §Agent limits gives the agent for that `complexity`; with none given, pass no effort                                 |
| `resource` or `idea` in a tree                                                                                                      | Never dispatched; report it to the consultant                                                                                               |

`priority` never reorders a tree: order states dependencies.

## Dispatching

Before the first `walk check`, and again after each compaction, read this file: it holds the lifecycle of each leaf's agent and boundary-review debugger, dispatched under it with the walked branch as its working branch:

<!-- @shared-file worktree-dispatch.md -->
<!-- @end -->

- Keep up to K leaves of the ready set in flight.
- Dispatch every leaf to a new agent: a worker under the implement skill, a debugger under the debugging skill.
- Brief a leaf's agent with `Issue: <owner>/<repo>#<n>` as the first line, which the dispatch hook checks, then `Walk: <owner>/<repo>#<walked issue>`, then `Base: <dispatch base>`, then the checkpoint commits the check lists towards the issue. Never paste issue or plan content: the agent reads it itself.
- Brief a debugger given a review merger's findings with the `Walk:` and `Base:` lines, the segment or nested plan whose close ran the review (none at the walk's end) and those findings, and no `Issue:` line: they belong to no single issue.
- Send a scope stop, a worker report opening with `Scope stop:`, to the consultant with the worker's leads. Once the consultant has handled the issue, drop the leaf's work under `worktree-dispatch.md` › Dropping work instead of resuming the agent, then run `walk check`, which routes the sub-issues it split the issue into to new agents.
- Treat a report that leaves a light gap (merging §Integration: an action the instructions already decide) as a completion, even when worded as a blocked report or a question: the integration merger closes it. Without an integration merger, resume the agent once with it. When a permission refuses the action again, or refuses it to the merger, which reports it, name it in the commit line. Never ask the user about it.

## Integration

Runs for each completed leaf at K > 1; otherwise §Review applies.

1. Integrate completed leaves one at a time, in report order: pass each to the segment's integration merger, briefed as the merging skill's §Brief states for integration mode. Resume the current one, or dispatch a new merger with `effort: low` under §Resumed agents.
2. When the merger reports leaf findings, resume the leaf's agent with all of them in one message, so its stop gate checks the tree the merger left; then check only that each finding is fixed or declined with a reason.
3. Leave conflicts to the merger's rebase; when it reports one needing design, resume the leaf's agent to rebase its worktree onto the walked branch, then resume the merger.

## Review

When no integration merger runs:

1. Read the leaf's diff from its dispatch base: `git diff --stat` first, then the hunks the issue's **Steps** and **Tests** name; skip generated files and lockfiles, and read no code beyond the diff.
2. Review it against the issue's **Steps**, **Tests** and names, and check it carries the changeset the Environment table requires: a missing one is a gap. A worker commits at each `Checkpoint:` line of its issue: review those commits one by one, then the uncommitted rest, reading their messages only as a hint of how the worker read its Steps.
3. Add the `@debt` markers the diff calls for and the agent missed.
4. When you find gaps, resume the agent with all of them in one message; then check only its fixes.

## Commit

1. When the closing commit will close a nested plan, first send that plan to the consultant to move its facts worth keeping (planning §The tree), and go on once it returns.
2. Commit the leaf by `worktree-dispatch.md` › Committing work, its commit being the closing commit: made under the project's git rules, closing the issue and every segment or parent it completes but the walked issue. Do not run the checks: the commit gate runs them.
3. Once the closing commit exists, run `walk check` and refill the pool, except when the commit closes a segment or a nested plan: §Boundary reviews runs first, and what is ordered after it waits.
4. Send the user one commit line: issue · consequences · decisions and deviations. Never re-send an earlier line or the table: the final report rebuilds it from the commits.

## Housekeeping

Apply an issue's **Housekeeping** in the walked checkout, a foreign one's by `cross-repository.md` › Housekeeping, by this file:

<!-- @shared-file housekeeping.md -->
<!-- @end -->

- Its commits: §Commit, the steps' changes standing for the leaf's work; a commit the gate refuses stops you as a failing step does.
- Handing it back: set it aside and send it to the consultant with the step and output that stopped you.

## Holding a leaf

Hold the work of a leaf's agent or a boundary-review debugger, the leaf here, by `worktree-dispatch.md` › Holding work, on the hold branch `<agent>/issue-<n>` for a leaf, `<agent>` being `worker` or `debugger`, or `debugger/review-<walked issue>` for a boundary-review debugger. Until the user says how to proceed, dispatch neither a held leaf nor the issues ordered after it, which `walk check` still reports ready, nor, for a held boundary-review debugger, anything ordered after its segment; refill the pool with the rest.

## After a debugger

| Its outcome | Next                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| Fixed       | Integrate or review, then commit it as any leaf                                           |
| Written up  | Run `walk check`, which routes each issue it wrote                                        |
| Blocked     | Send its questions to the consultant when the plan may settle them, otherwise to the user |

## Boundary reviews

When a segment or a nested plan closes and at the walk's end:

1. Dispatch a new merger under the merging skill in the main checkout, briefed as its §Brief states for review mode, with the range since the previous review run or the walk's start.
2. When the merger reports findings or agents declined leaf findings since the previous review run, brief a new debugger with them and handle the outcome by §After a debugger; otherwise dispatch no debugger.
3. Commit the debt markers, backlog entries and discarded-solutions lines the merger added with the debugger's fix, or alone when no debugger ran or it fixed nothing. At the walk's end, unless the debugger wrote an issue under the walked issue, first send a walked plan to the consultant as §Commit step 1 states, then let that commit, empty when nothing changed, close the walked issue.
4. Dispatch nothing ordered after the segment until that commit lands: the fix may change what later work builds on.

In each linked checkout holding foreign leaves, run steps 1–3 as well, by `cross-repository.md` › Boundary reviews.

## Consultant

- Start the `planner` subagent on first need, briefed `consultant` with the plan number; resume it under §Resumed agents.
- Call it only for a blocked report the issue's text does not answer, **Housekeeping** you stopped on, a deviation changing planned behavior, contracts, scope or tree order, a plan your next commit closes, or an issue its row sends to it or no row fits. Resume a blocked agent with what it settles; answer nothing from code yourself.
- Send it the issues the handling table routes to it, in tree order, adding a foreign issue's linked checkout path, which it reads by path. In that message and each resume for pending ones, name the pool's free slots, at least one, and `no leaf in flight` when none is, which bound its run (the planning skill's consultant mode). Dispatch the ready ones not already in flight, then resume it for the pending ones, adding those routed to it since.
- Send a blocked report arriving while the consultant runs to it at once where the client delivers messages to a running agent, otherwise once the consultant returns.
- Batch what it sends back to the user with its findings and recommendations.

## Reshaping

When an issue stays set aside after the consultant or the user cannot settle it, and issues ordered after it wait:

1. Start a new `planner`, apart from the consultant, briefed `reshape` with the plan number, the mode, the plan depth, each such issue with why it is unsettled, and the leaves in flight.
2. It answers once: the issues it moved ahead of the set-aside one, or why each must wait.
3. Run `walk check` and refill the pool.

Reshape around each set-aside issue once per settlement attempt: run it again only after the consultant or the user changed that issue.

## Resumed agents

- Resume the consultant and the integration merger through the client's messaging or resume tool instead of starting new ones.
- Start a new consultant or integration merger instead when a segment closes, or, under Codex, once its reported context exceeds its agent's **Fresh up to** in §Agent limits: past that, every resumed turn re-reads more history than a fresh start costs.
- Under Claude Code, a hook refuses a resume past the growth the agent's definition allows: on a refusal, start a new one as below; never retry the resume.
- Brief a new consultant as the first one was briefed, adding the previous one's last carry-over; a new integration merger as merging §Brief states.

## Agent limits

<!-- @agent-limits worker debugger merger planner -->
<!-- @end -->

## Stops and restarts

- Stopping with leaves not committed: have a merger in flight abort its rebase, then stop by `worktree-dispatch.md` › Stopping, on the hold branches §Holding a leaf names.
- Starting a walk, before the first dispatch: list the `worker/issue-*`, `debugger/issue-*` and `debugger/review-*` branches, the git worktrees other than the main checkout, and a leaf's work in the main checkout: checkpoint commits `walk check` lists, or uncommitted changes a stop record ties to a leaf. Hold such main-checkout work by `worktree-dispatch.md` › Holding work, steps 1–2, on the hold branches §Holding a leaf names. Handle a branch for an issue `walk check` reports ready, a review branch, and the work just held as held leaves: report each by `worktree-dispatch.md` › Holding work, step 3, and wait as §Holding a leaf states. Report each worktree holding commits or changes beyond the walked branch with its path, as held work, and leave it in place.
- Linked checkouts: `cross-repository.md` › Walk start extends the walk-start step, and › Holding and dropping covers holding a foreign leaf.

## Context

Every turn re-reads your whole context, and a long walk outgrows it.

- Read only `walk check` output and agent reports, plus the issue and the diff §Review names, an issue's **Housekeeping** with the files and output its steps name, the listings §Stops and restarts names, and the backlog category Backlog has you check for a bug an agent reported; never plans or code beyond that diff.
- Make the commands of one step one call, chained with `&&` so a failure stops the rest: a leaf's records commit, cherry-picks and apply; its log append and commit; its worktree removal and the next `walk check`.
- Message the user only with the commit lines, held work, set-aside issues and questions your mode allows, and the final report: no progress or status messages in between.
- Keep only the latest carry-over of each consultant and merger; rebuild everything else after a compaction from `walk check`, the walk's commits and the held leaves' branches.

## Report

End once no leaf is in flight and the ready set is empty, at the end of the tree or with every remaining issue set aside, with:

1. The table of walked leaves, rebuilt from the walk's commits.
2. Each merger run's findings and where each went.
3. What is set aside, pending or blocked, and why, with each held leaf's branch and each reshape's moves.
4. The walk's agent runs from `pnpm engrenage agents stats`, when the client records them.
