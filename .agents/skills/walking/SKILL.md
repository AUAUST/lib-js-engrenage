---
name: walking
description: Walk a planned tree of GitHub issues in order, dispatching each
  leaf to a worker or debugger, then reviewing and committing it. Use only when
  the user asks to walk an issue tree.
---

<!-- @reference @auaust/engrenage/agents/skills/walking.md -->

# Walking

Walk an issue tree in the main session: route each issue by the handling table, have each leaf implemented and reviewed, commit it and report. You own sequencing, routing and commits; you design and implement nothing. Every report, diff and file you read stays in your context for the rest of the walk, so read only what a step below names.

## Modes

The walk request sets them:

| Request words                                                 | Effect                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `pool <K>` or `K = <K>`                                       | K leaves in flight; 3 when unset, always 1 under Codex             |
| `sequential` or `no pool`                                     | K = 1                                                              |
| No depth, `depth 0` or `depth 1`                              | Plan depth 1: nested plans are set aside                           |
| `depth <n>`; `and direct children` or `and child plans` for 2 | Plan depth n: the walked plan and the plans n − 1 levels below it  |
| `deep`, `deeply` or `traverse`                                | Plan depth `all`: every plan below the walked one                  |
| `autonomous`                                                  | No user to answer: §Autonomous replaces every question to the user |

## Flow

```
walk check ──► route the ready set (§Handling table)
  │
  ├─ leaf ──► dispatch (§Dispatching) ──► agent report
  │              ├─ blocker ──► consultant ──► resume the agent
  │              └─ completion
  │                   ▼
  │             integration merger (§Integration), or your own review (§Review)
  │                   ▼
  │             gaps and leaf findings ──► resume the agent ──► check its fixes
  │                   ▼
  │             closing commit (§Commit) ──► report row ──► walk check
  │
  └─ segment or walk closes ──► review merger ──► debugger ──► commit ──► walk check
```

## Handling table

Run `pnpm engrenage planning walk check <n> --depth <plan depth>` on the issue the user names: at the start, after each commit and after each consultant return, never in between. It reports every issue of the tree in tree order, each parent above its sub-issues, with its state (open, closed, or closed by a local commit), `blockers`, findings, open **Planning** and **Questions** and local commits, then the ready set, every issue actionable in turn within the plan depth, and the next issue.

Handle each issue by the first matching row; the `complexity` row applies on top of the row that dispatches. Setting an issue aside also holds every issue ordered after it, which the ready set already leaves out: keep walking the rest.

| Issue                                                                   | Walker                                                                                                                                                      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closed, or closed by a local commit                                     | Skip                                                                                                                                                        |
| A nested `plan` past the plan depth                                     | Set aside: walked on its own                                                                                                                                |
| Open sub-issues                                                         | Walk them in order (a `segment`'s in any order), meanwhile handling the issue's own findings by the rows below without stopping the walk; then its own work |
| `plan` or `segment` with no open sub-issue                              | Closes with its last leaf's commit                                                                                                                          |
| `blockers` `drafting`, with `.ai/issues/<n>.draft.md` present           | Set aside: it is being planned                                                                                                                              |
| `blockers` `drafting`, with no local draft                              | Ask the user whether to clear the claim and walk it; on yes, run `pnpm engrenage planning issue release <n>` and handle it by the next rows                 |
| `blockers` `awaitingOthers` or `delayed`, or an open blocked-by issue   | Set aside and report                                                                                                                                        |
| Open **Planning**, `blockers` `outdated`, or findings for its structure | Set aside; send it to the consultant                                                                                                                        |
| Open **Questions**                                                      | Set aside; batch the questions to the user                                                                                                                  |
| `problem` without **Steps**                                             | Debugger                                                                                                                                                    |
| `task` or `problem` with **Steps**                                      | Worker                                                                                                                                                      |
| `complexity` set                                                        | Worker: `effort: medium` for `involved` or `complex`. Debugger: `effort: low` for `trivial`, `effort: high` for `complex`. Otherwise the agent's default    |
| `resource` or `idea` in a tree                                          | Never dispatched; report it to the consultant                                                                                                               |

`priority` never reorders a tree: order states dependencies.

## Dispatching

- Keep up to K leaves of the ready set in flight. At K = 1, dispatch in the main checkout. Past it, dispatch each leaf in the background with `isolation: "worktree"`, briefing the walked branch's `HEAD` commit.
- Dispatch every leaf to a new agent: a worker under the issue-implementation skill, a debugger under the debugging skill.
- Brief a leaf's agent with `Issue: <owner>/<repo>#<n>` as the first line, which the dispatch hook checks, then `Walk: <owner>/<repo>#<walked issue>`, then the commits the check lists towards the issue. Never paste issue or plan content: the agent reads it itself.
- Brief a debugger given a review merger's findings with the `Walk:` line and those findings, and no `Issue:` line: they belong to no single issue.
- Resume the same agent to answer its question, return gaps and leaf findings, or return the failing commands and output from its stop or commit gate.
- Resume a leaf's agent or a boundary-review debugger at most twice for one cause: a gate failure, gap or leaf finding, a blocker on the same question, or a conflict a merger reports as needing design. Instead of a third resume, hold its work on its own branch, so the walk goes on from a clean tree:
  1. Where the agent works, its worktree or the main checkout, create from the current commit `<agent>/issue-<n>` for a leaf, `<agent>` being `worker` or `debugger`, or `debugger/review-<walked issue>` for a boundary-review debugger; when that branch exists, append the first free suffix of `-2`, `-3`, …. Commit the uncommitted rest there, when any, as `snap` under the git rules.
  2. In the main checkout, switch back to the walked branch and reset it to the agent's dispatch base, dropping any checkpoint commit it made there; in a worktree, remove the worktree.
  3. Report the held work's state and branch: to the user at once, who may say how to proceed, or in autonomous mode in your final report.
  4. Until the user says how to proceed, dispatch neither a held leaf nor the issues ordered after it, which `walk check` still reports ready, nor, for a held boundary-review debugger, anything ordered after its segment; refill the pool with the rest.
- Send a blocker the issue's text does not answer to the consultant; resume the agent with what it settles.
- Complete a leaf on the agent's final report, a completion or a blocker; never wait for a later agent-finished event, which may never wake you.
- Stay inactive between agent events: end your turn where the client wakes you, otherwise wait with its longest timeout. Never poll or sleep; request progress from the agents in flight only when a decision depends on it or after 3 consecutive timeouts with no agent event.

## Integration

Runs for each completed leaf at K > 1, and at K = 1 in autonomous mode; otherwise §Review applies.

1. Integrate completed leaves one at a time, in report order: pass each to the segment's integration merger, briefed as the merging skill's §Brief states for integration mode. Resume the current one, or dispatch a new merger with `effort: low` under §Resumed agents.
2. When the merger reports leaf findings, resume the leaf's agent with all of them in one message, so its stop gate checks the worktree the merger left; then check only that each finding is fixed or declined with a reason.
3. Leave conflicts to the merger's rebase; when it reports one needing design, resume the leaf's agent to rebase its worktree onto the walked branch, then resume the merger.

## Review

When no integration merger runs:

1. Read the leaf's diff from its dispatch base: `git diff --stat` first, then the hunks the issue's **Steps** and **Tests** name; skip generated files and lockfiles, and read no code beyond the diff.
2. Review it against the issue's **Steps**, **Tests** and names. A worker commits at each `Checkpoint:` line of its issue: review those commits one by one, then the uncommitted rest, reading their messages only as a hint of how the worker read its Steps.
3. Add the `@debt` markers the diff calls for and the agent missed.
4. When you find gaps, resume the agent with all of them in one message; then check only its fixes.

## Commit

1. At K > 1, cherry-pick the leaf's checkpoint commits, then apply its uncommitted rest; never rewrite a checkpoint.
2. Make the closing commit under the project's git rules, closing the issue and every segment or parent it completes. Do not run the checks: the commit gate runs them.
3. At K > 1, remove the leaf's worktree; then run `walk check` and refill the pool.
4. Report one row to the user: issue · consequences · decisions and deviations.

## After a debugger

| Its outcome                    | Next                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Fixed                          | Integrate or review, then commit it as any leaf                                           |
| Written up, ready for a worker | Dispatch the written-up issue to a worker                                                 |
| Written up for planning        | Set it aside and report it to the user                                                    |
| Blocked                        | Send its questions to the consultant when the plan may settle them, otherwise to the user |

## Boundary reviews

When a segment or a nested plan closes and at the walk's end:

1. Dispatch a new merger under the merging skill in the main checkout, briefed as its §Brief states for review mode, with the range since the previous review run or the walk's start.
2. Brief a new debugger with its findings and the leaf findings agents declined since the previous review run, when any, and handle the outcome by §After a debugger.
3. Commit the debt markers, backlog entries and discarded-solutions lines the merger added with the debugger's fix, or alone when there is none.
4. Dispatch nothing ordered after the segment until that commit lands: the fix may change what later work builds on.

## Consultant

- Start the `planner` subagent on first need with the plan number, and `autonomous` in autonomous mode; resume it under §Resumed agents.
- Call it only for a blocker the issue's text does not answer, a deviation changing planned behavior, contracts, scope or tree order, or an issue its row sends to it or no row fits; answer nothing from code yourself.
- Send it the issues the handling table routes to it, in tree order. In that message and each resume for pending ones, name the pool's free slots, at least one, and `no leaf in flight` when none is: each run handles at most that many issues, ready or left set aside, and under `no leaf in flight` returns at its first ready one. Dispatch the ready ones not already in flight, then resume it for the pending ones, adding those routed to it since.
- Send a blocker arriving while the consultant runs to it at once where the client delivers messages to a running agent: it handles the blocker first and returns. Otherwise send it once the consultant returns.
- Batch what it sends back to the user with its findings and recommendations.

## Reshaping

When an issue stays set aside after the consultant or the user cannot settle it, and it holds issues ordered after it:

1. Start a new `planner`, apart from the consultant, briefed `reshape` with the plan number, the mode, the plan depth, each such issue with why it is unsettled, and the leaves in flight.
2. It answers once: the issues it moved ahead of the held one, or why each must wait.
3. Run `walk check` and refill the pool.

Reshape each held issue once per settlement attempt: run it again only after the consultant or the user changed that issue.

## Autonomous

The user delegated every decision the instructions let an agent settle and is not there to answer: never ask them or wait for them.

| Instead of                                   | Do                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Batching questions to the user               | Send them to the consultant; the issues it cannot settle stay set aside and go to §Reshaping |
| Asking to clear a `drafting` claim           | Set the issue aside                                                                          |
| Reporting a debugger written up for planning | Send it to the consultant, which plans it into the tree or leaves it set aside               |

## Resumed agents

- Resume the consultant and the integration merger through the client's messaging or resume tool instead of starting new ones.
- Start a new one instead when a segment closes, when the current one has been idle longer than the prompt-cache lifetime, or, under Codex, once its reported context exceeds twice what it started with: past that, every resumed turn re-reads more history than a fresh start costs.
- Brief a new consultant with the plan number, the mode and the previous one's last carry-over, a new integration merger as the first, with the previous one's carry-over.

## Context

Every turn re-reads your whole context, and a long walk outgrows it.

- Read only `walk check` output and agent reports, plus the issue and the diff §Review names; never plans or code beyond that diff.
- Make the commands of one step one call: a leaf's cherry-picks, apply and commit; its worktree removal and the next `walk check`.
- Keep only the latest carry-over of each consultant and merger; rebuild everything else after a compaction from `walk check`, the walk's commits and the held leaves' branches.

## Report

End once no leaf is in flight and the ready set is empty, at the end of the tree or with every remaining issue set aside, with:

1. The table of walked leaves, rebuilt from the walk's commits.
2. Each merger run's findings and where each went.
3. In autonomous mode, every decision the consultant settled, from its carry-over.
4. What is set aside, pending or blocked, and why, with each held leaf's branch and each reshape's moves.
5. The walk's agent runs from `pnpm engrenage agents stats`, when the client records them.

<!-- @end -->
