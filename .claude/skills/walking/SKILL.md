---
name: walking
description: Walk a planned tree of GitHub issues in order, dispatching each
  leaf to a worker or debugger, then reviewing and committing it. Use only when
  the user asks to walk an issue tree.
disable-model-invocation: true
---

<!-- @reference @auaust/engrenage/metalbrain/skills/walking.md -->

# Walking

Walk an issue tree in the main session: route each issue by the handling table, have each leaf implemented and reviewed, commit it and report. You own sequencing, routing and commits; you design and implement nothing. §Context bounds what you read.

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

Run `pnpm engrenage planning walk check <n> --depth <plan depth>` on the issue the user names: at the start, after each commit, consultant return and debugger write-up, never in between. It reports every issue of the tree in tree order, each parent above its sub-issues, with its state (open, closed, or closed by an unpushed commit), `blockers`, check findings, open **Planning** and **Questions** and local commits, then the ready set, every issue actionable in turn within the plan depth, and the next issue.

Handle each issue by the first matching row; the `complexity` row applies on top of the row that dispatches. A leaf is an issue a row dispatches to a worker or a debugger; a foreign leaf, a leaf of another registered repository. A repository's linked checkout is the directory `pnpm engrenage link` lists for it. On a foreign leaf or a worker report opening with `Linked defect:`, read `cross-repository.md` beside this skill first: where it covers a step of this skill, it replaces that step. Setting an issue aside also holds every issue ordered after it, which the ready set already leaves out: keep walking the rest.

| Issue                                                                                                     | Walker                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Closed, or closed by an unpushed commit                                                                   | Skip                                                                                                                                        |
| A nested `plan` past the plan depth                                                                       | Set aside: walked on its own                                                                                                                |
| Open sub-issues                                                                                           | Walk them in order (a `segment`'s in any), handling the issue's own check findings by the rows below without stopping; then its own work    |
| `plan` or `segment` with no open sub-issue                                                                | Closes with its last leaf's commit; the walked issue with §Boundary reviews' walk-end commit instead                                        |
| `blockers` `drafting`, with `.ai/issues/<n>.draft.md` present                                             | Set aside: it is being planned                                                                                                              |
| `blockers` `drafting`, with no local draft                                                                | Ask the user whether to clear the claim and walk it; on yes, run `pnpm engrenage planning issue release <n>` and handle it by the next rows |
| `blockers` `awaitingOthers` or `delayed`, or an open blocked-by issue                                     | Set aside and report                                                                                                                        |
| Open **Planning**, `blockers` `outdated`, check findings for its structure, or a `task` without **Steps** | Set aside; send it to the consultant                                                                                                        |
| Open **Questions**                                                                                        | Set aside; batch the questions to the user                                                                                                  |
| Foreign `task` or `problem` whose repository has no linked checkout                                       | Set aside and report                                                                                                                        |
| `problem` without **Steps**                                                                               | Debugger; foreign, through `cross-repository.md`                                                                                            |
| `task` or `problem` with **Steps**                                                                        | Worker; foreign, through `cross-repository.md`                                                                                              |
| `complexity` set                                                                                          | Dispatch at the effort §Agent limits gives the agent for that `complexity`; with none given, pass no effort                                 |
| `resource` or `idea` in a tree                                                                            | Never dispatched; report it to the consultant                                                                                               |

`priority` never reorders a tree: order states dependencies.

## Dispatching

- Keep up to K leaves of the ready set in flight. Dispatch every agent from the walked branch's `HEAD` commit, its dispatch base: at K = 1 in the main checkout; past it, each leaf in the background with `isolation: "worktree"`, briefing that commit.
- Dispatch every leaf to a new agent: a worker under the issue-implementation skill, a debugger under the debugging skill.
- Brief a leaf's agent with `Issue: <owner>/<repo>#<n>` as the first line, which the dispatch hook checks, then `Walk: <owner>/<repo>#<walked issue>`, then the commits the check lists towards the issue. Never paste issue or plan content: the agent reads it itself.
- Brief a debugger given a review merger's findings with the `Walk:` line, the segment or nested plan whose close ran the review (none at the walk's end) and those findings, and no `Issue:` line: they belong to no single issue.
- Resume the same agent to answer its question, return gaps and leaf findings, or return the failing commands and output from its stop or commit gate.
- Resume a leaf's agent or a boundary-review debugger at most twice for one cause: a gate failure, gap or leaf finding, a blocked report on the same question, or a conflict a merger reports as needing design. Instead of a third resume, hold its work under §Holding a leaf.
- Send a scope stop, a worker report opening with `Scope stop:`, to the consultant with the worker's leads. Once the consultant has handled the issue, drop the leaf's work under §Dropping a leaf's work instead of resuming the agent, then run `walk check`, which routes the sub-issues it split the issue into to new agents.
- Treat a report that leaves a light gap (an action the instructions already decide, such as a missing changeset; merging §Integration) as a completion, even when worded as a blocked report or a question: the integration merger closes it. Without an integration merger, resume the agent once with it. When a permission refuses the action again, or refuses it to the merger, which reports it, name it in the commit line. Never ask the user about it.
- Complete a leaf on the agent's final report, a completion or a blocked report; never wait for a later agent-finished event, which may never wake you.
- Stay inactive between agent events: end your turn where the client wakes you, otherwise wait with its longest timeout. Never poll or sleep; request progress from the agents in flight only when a decision depends on it or after 3 consecutive timeouts with no agent event.

## Integration

Runs for each completed leaf at K > 1, and at K = 1 in autonomous mode; otherwise §Review applies.

1. Integrate completed leaves one at a time, in report order: pass each to the segment's integration merger, briefed as the merging skill's §Brief states for integration mode. Resume the current one, or dispatch a new merger with `effort: low` under §Resumed agents.
2. When the merger reports leaf findings, resume the leaf's agent with all of them in one message, so its stop gate checks the tree the merger left; then check only that each finding is fixed or declined with a reason.
3. Leave conflicts to the merger's rebase; when it reports one needing design, resume the leaf's agent to rebase its worktree onto the walked branch, then resume the merger.

## Review

When no integration merger runs:

1. Read the leaf's diff from its dispatch base: `git diff --stat` first, then the hunks the issue's **Steps** and **Tests** name; skip generated files and lockfiles, and read no code beyond the diff.
2. Review it against the issue's **Steps**, **Tests** and names. A worker commits at each `Checkpoint:` line of its issue: review those commits one by one, then the uncommitted rest, reading their messages only as a hint of how the worker read its Steps.
3. Add the `@debt` markers the diff calls for and the agent missed.
4. When you find gaps, resume the agent with all of them in one message; then check only its fixes.

## Commit

1. When the closing commit will close a nested plan, first send that plan to the consultant to move its facts worth keeping (planning §The tree), and go on once it returns.
2. At K > 1, cherry-pick the leaf's checkpoint commits, then apply its uncommitted rest; never rewrite a checkpoint.
3. Make the closing commit under the project's git rules, closing the issue and every segment or parent it completes but the walked issue. Do not run the checks: the commit gate runs them.
4. When the commit fails, at K > 1 undo the leaf in the main checkout as §Dropping a leaf's work, step 2, states, keeping its worktree; then resume the agent with the gate's failing commands and output.
5. Once the closing commit exists, at K > 1, remove the leaf's worktree. Then run `walk check` and refill the pool, except when the commit closes a segment or a nested plan: §Boundary reviews runs first and holds what is ordered after it.
6. Send the user one commit line: issue · consequences · decisions and deviations. Never re-send an earlier line or the table: the final report rebuilds it from the commits.

## Holding a leaf

Moves the work of a leaf's agent or a boundary-review debugger, the leaf here and in §Dropping a leaf's work, onto its own branch, so the walk goes on from a clean tree:

1. In the leaf's checkout, its worktree or the main checkout, create from the current commit and switch to `<agent>/issue-<n>` for a leaf, `<agent>` being `worker` or `debugger`, or `debugger/review-<walked issue>` for a boundary-review debugger; when that branch exists, append the first free suffix of `-2`, `-3`, …. Commit there yourself, when any, the uncommitted files the leaf changed or added, staged by path, as `snap` under the git rules.
2. Drop the leaf's work under §Dropping a leaf's work.
3. Report the held work's state and branch to the user at once, who may say how to proceed.
4. Until the user says how to proceed, dispatch neither a held leaf nor the issues ordered after it, which `walk check` still reports ready, nor, for a held boundary-review debugger, anything ordered after its segment; refill the pool with the rest.

## Dropping a leaf's work

Takes a leaf's work off the walked branch, keeping its lines in `.ai/friction.md` and `.ai/discarded.md` and every change that is not the leaf's:

1. Copy the lines the leaf added to those logs since its dispatch base, from its hold branch when held, otherwise from its checkout.
2. Return the main checkout to the walked branch as it stood before the leaf:
   - **Leaf in the main checkout.** Switch back to the walked branch when on another one, reset it to the leaf's dispatch base, dropping the leaf's checkpoint commits, and discard the files the leaf changed or added.
   - **Leaf in a worktree.** Undo the leaf's cherry-picks and apply in the main checkout, when any, discarding only the files they changed; then remove the leaf's worktree with `--force`, since it may hold uncommitted work.
3. Append the copied lines the main checkout's logs lack, left uncommitted for the next commit.

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

## Consultant

- Start the `planner` subagent on first need, briefed `consultant` with the plan number, and `autonomous` in autonomous mode; resume it under §Resumed agents.
- Call it only for a blocked report the issue's text does not answer, a deviation changing planned behavior, contracts, scope or tree order, a plan your next commit closes, or an issue its row sends to it or no row fits. Resume a blocked agent with what it settles; answer nothing from code yourself.
- Send it the issues the handling table routes to it, in tree order, adding a foreign issue's linked checkout path, which it reads by path. In that message and each resume for pending ones, name the pool's free slots, at least one, and `no leaf in flight` when none is, which bound its run (planning §Consultant). Dispatch the ready ones not already in flight, then resume it for the pending ones, adding those routed to it since.
- Send a blocked report arriving while the consultant runs to it at once where the client delivers messages to a running agent, otherwise once the consultant returns.
- Batch what it sends back to the user with its findings and recommendations.

## Reshaping

When an issue stays set aside after the consultant or the user cannot settle it, and it holds issues ordered after it:

1. Start a new `planner`, apart from the consultant, briefed `reshape` with the plan number, the mode, the plan depth, each such issue with why it is unsettled, and the leaves in flight.
2. It answers once: the issues it moved ahead of the held one, or why each must wait.
3. Run `walk check` and refill the pool.

Reshape each held issue once per settlement attempt: run it again only after the consultant or the user changed that issue.

## Autonomous

The user delegated every decision the instructions let an agent settle and is not there to answer: never ask them or wait for them.

| Instead of                                                                   | Do                                                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Batching questions to the user                                               | Send them to the consultant; the issues it cannot settle stay set aside and go to §Reshaping |
| Asking to clear a `drafting` claim                                           | Set the issue aside                                                                          |
| Messaging the user: commit lines, held work, light gaps a permission refuses | Put held work and refused light gaps in your final report; send no commit line               |

## Resumed agents

- Resume the consultant and the integration merger through the client's messaging or resume tool instead of starting new ones.
- Start a new consultant or integration merger instead when a segment closes, or, under Codex, once its reported context exceeds its agent's **Fresh up to** in §Agent limits: past that, every resumed turn re-reads more history than a fresh start costs.
- Under Claude Code, a hook refuses a resume past the growth the agent's definition allows: on a refusal, start a new one as below; never retry the resume.
- Brief a new consultant or integration merger as the first one was briefed, adding the previous one's last carry-over.

## Agent limits

| Agent      | Default effort | Effort by complexity                  | Fresh up to             |
| ---------- | -------------- | ------------------------------------- | ----------------------- |
| `analyser` | high           | none                                  | no limit                |
| `planner`  | medium         | none                                  | 2× its starting context |
| `debugger` | medium         | `trivial`: low, `complex`: high       | no limit                |
| `worker`   | low            | `involved`: medium, `complex`: medium | no limit                |
| `merger`   | medium         | none                                  | 2× its starting context |
| `curator`  | high           | none                                  | no limit                |
| `writer`   | medium         | `trivial`: low, `complex`: high       | no limit                |

## Stops and restarts

- Stopping with leaves not committed (Writing › Stop records): stop each agent in flight, having a merger abort its rebase, then hold each leaf under §Holding a leaf, steps 1–2, instead of a `snap` commit on the walked branch, which leaf work reaches only through §Commit. The stop record names each held branch and whether its agent had completed.
- Starting a walk, before the first dispatch: list the `worker/issue-*`, `debugger/issue-*` and `debugger/review-*` branches, the git worktrees other than the main checkout, and a leaf's work in the main checkout: checkpoint commits `walk check` lists, or uncommitted changes a stop record ties to a leaf. Hold such main-checkout work under §Holding a leaf, steps 1–2. Handle a branch for an issue `walk check` reports ready, a review branch, and the work just held as held leaves, by §Holding a leaf, steps 3–4. Report each worktree holding commits or changes beyond the walked branch with its path, as held work, and leave it in place.

## Context

Every turn re-reads your whole context, and a long walk outgrows it.

- Read only `walk check` output and agent reports, plus the issue and the diff §Review names and the listings §Stops and restarts names; never plans or code beyond that diff.
- Make the commands of one step one call, chained with `&&` so a failure stops the rest: a leaf's cherry-picks, apply and commit; its worktree removal and the next `walk check`.
- Message the user only with the commit lines, held work, set-aside issues and questions your mode allows, and the final report: no progress or status messages in between.
- Keep only the latest carry-over of each consultant and merger; rebuild everything else after a compaction from `walk check`, the walk's commits and the held leaves' branches.

## Report

End once no leaf is in flight and the ready set is empty, at the end of the tree or with every remaining issue set aside, with:

1. The table of walked leaves, rebuilt from the walk's commits.
2. Each merger run's findings and where each went.
3. In autonomous mode, every decision the consultant settled, from its carry-over.
4. What is set aside, pending or blocked, and why, with each held leaf's branch and each reshape's moves.
5. The walk's agent runs from `pnpm engrenage agents stats`, when the client records them.

<!-- @end -->
