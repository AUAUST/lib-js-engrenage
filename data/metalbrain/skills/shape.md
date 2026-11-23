---
title: Shape
description: Shape, with the user, an idea whose definition or approach is not yet clear; settle its requirements while agents investigate and implement in the background, until it is implemented, planned, recorded in the backlog or dropped. Use only when the user invokes it.
---

# Shape

Turn the user's idea into settled work: you keep the overview, settle the requirements with the user and compare the facts agents bring back. Pick the outcome the context shows: implement now through dispatches, outline a plan, record it in the backlog or drop it.

Keep this role for the whole session.

## Agents in flight

K = 1: one worker, debugger or writer in flight. Gatherers and read-only analysers run beside it by `dispatching.md` › Parallel agents.

The user's words override: `pool <K>` or `K = <K>` sets K, `gatherers <K>` caps the gatherers in flight, `sequential` or `no pool` runs one agent at a time.

## Reading the user

- Read each message whole before acting on any part: the user comments while reading, so a later part supersedes an earlier one.
- Treat each request and each repeated statement as a lead to investigate, never as settled.
- Weigh each new suggestion against what exists and what is settled; raise again only a genuine distinction, with your recommendation.
- An aside, a point off the current thread: when it serves the current goal, handle it as a request of this session; otherwise write it as a backlog entry at once and carry on.

Weigh leads, options and the facts agents bring back by the analysis method in these files, sending its reading to agents (§Agents):

<!-- @shared-file analysis.md -->
<!-- @end -->

<!-- @shared-file request-analysis.md -->
<!-- @end -->

## Agents

You compare facts; agents do the scans and the changes. Beyond the diffs you review, the backlog and the project maps an issue draft needs (issue-drafts rule › Owners), read only what an agent's report points to, at the lines it names; send any wider reading to a gatherer.

| Need                                                                                                       | Dispatch                                                            |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Locate strings or files                                                                                    | Gatherer, on the smallest, fastest model your runtime lets you pass |
| A search scoped to some domains or files                                                                   | Gatherer                                                            |
| Connecting facts: causes, designs, reach                                                                   | Analyser briefed read-only, at low or medium effort                 |
| A specified change                                                                                         | Worker                                                              |
| Wrong behavior within the current goal                                                                     | Debugger, at once, as soon as it is found                           |
| A finding outside the current goal, found by you or named in an agent's report                             | Yourself, under the agent-records rule and Backlog                  |
| Agent instructions                                                                                         | Writer, under Instruction maintenance                               |
| A change taking no choice: a changeset, a `@debt` marker, a configuration value the user named, a sync run | Yourself                                                            |

- Choose the cheapest agent, effort and thoroughness level that fit each need; raise a gatherer or analyser to high effort only on the user's request.
- For each new idea or topic, first read the backlog categories covering it for entries it would ease, worsen or take up; have a gatherer search the `@debt` markers and the agent-friction and discarded-solutions logs for the same.
- Beyond backlog entries, agent-log lines and issue drafts, edit files only for the changes the last row names, and only while no agent changes files in the main checkout.
- When a gatherer's report misses what you asked, dispatch one more with a narrowed prompt; past that, tell the user what is still unknown.

## Briefing

Brief each agent with only what it cannot work out: what we are working on, the facts wanted back, and what it may change (read-only for analysers). Writing › Transfer texts owns the rest, and this file the parallel agents, brief lines, thoroughness stops and the findings a report names:

<!-- @shared-file dispatching.md -->
<!-- @end -->

## Dispatching

Read this file before the first dispatch of an agent changing files, and again after each compaction: it holds their lifecycle, with the main checkout's current branch as working branch:

<!-- @shared-file worktree-dispatch.md -->
<!-- @end -->

- Dispatch every agent in the background and keep the discussion going. Dispatch an agent building on another's work once that work is committed.
- Run gatherers and read-only analysers in the main checkout, outside that file's lifecycle.
- Brief a file-changing agent with its issue or draft line first, then its `Backlog:` lines, each when it has them, then `Base: <dispatch base>`.
- Dispatch a worker, debugger or writer for an issue with a `complexity` at the effort §Agent limits gives it, otherwise at its default; in a linked checkout, pass that effort as `--effort`.
- Treat each tool on a `Denied:` line, and each action an agent reports a permission refused, as undone: do it yourself when it is a change the last row of §Agents names; otherwise tell the user what it blocked.
- A worker report opening with `Scope stop:` or `Linked defect:`, or a `Thoroughness stop:` report you take as it stands: hold its work, if any (§Holding), and bring its findings into the discussion.

For work in another registered repository, once the user confirmed the location under Environment, read this file too, which replaces the steps of `worktree-dispatch.md` it covers:

<!-- @shared-file linked-checkouts.md -->
<!-- @end -->

## Review

Review each returned diff by this file: `git diff --stat` from its dispatch base, then the hunks its specification's outcome concerns, skipping generated files and lockfiles:

<!-- @shared-file review.md -->
<!-- @end -->

- Look for debt as well; handle each finding outside the brief by §Agents.
- Close each leaf finding §Agents lets you change, `@debt` markers included, between `worktree-dispatch.md` › Committing work, steps 1 and 2; resume the agent with every other leaf finding in one message; bring each plan finding into the discussion.

## Commit

Commit each agent's work by `worktree-dispatch.md` › Committing work, its step 2 being one commit under the git rules through the commit gate.

- When the commit holds several agents' work, or an agent's work with your own edits, run `pnpm engrenage gate --worktree` before committing.
- When the commit gate fails on what §Agents lets you change, fix it and commit again, in place of step 3; send any other failure back to the agent by step 3.
- Tell the user each commit's consequences in one line once it lands.

## Holding

Hold an agent's work by `worktree-dispatch.md` › Holding work on the hold branch `<agent>/shape-<topic>`, `<agent>` being its agent name and `<topic>` a kebab-case name of its task.

Before your first dispatch, list the `*/shape-*` branches and the git worktrees other than the main checkout: report each with its state as held work, leave it in place and dispatch nothing building on it until the user says how to proceed.

<!-- @extension tools/github/issues/planning -->

## Drafting

Read this file once a request's scope is clear:

<!-- @skill-file drafting.md -->
<!-- @end -->

<!-- @end -->

## Growing scope

When the work needs several ordered tasks or a design several tasks share, keep clarifying it with the user, then leave a backlog entry needing planning, holding what was settled and found. Meanwhile, keep dispatching the groundwork and fixes found on the way, so the plan holds no trivial fixes.

<!-- @extension tools/github/issues/planning -->

Read this file then, which replaces that backlog entry with a plan draft:

<!-- @skill-file planning.md -->
<!-- @end -->

<!-- @end -->

Write each part left out of the agreed scope as a backlog entry a later debugger or planner starts from.

## Architecture review

When the user asks, review the work's structure by this file; offer it when the work adds a package, environment or namespace, or moves a domain across them:

<!-- @shared-file architecture-review.md -->
<!-- @end -->

## Explaining

Write for a reader without deep knowledge of the codebase:

- Give each option its concrete cost, value and implications.
- Draw relationships as diagrams.
- Simplify; a design that resists simplifying is a sign it is too complex.

## Split handoffs

When the user asks to report back with split handoffs, write as chat handoffs:

- One per issue or group of closely related bugs, ready for a debugger.
- One per clearly specified task, ready for a worker.
- One for a planner: what was discussed, the goals, implications and findings.

## Agent limits

<!-- @agent-limits worker debugger writer analyser gatherer -->
<!-- @end -->
