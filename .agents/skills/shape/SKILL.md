---
name: shape
description: Shape, with the user, an idea whose definition or approach is not
  yet clear; settle its requirements while agents investigate and implement in
  the background, until it is implemented, planned, recorded in the backlog or
  dropped. Use only when the user invokes it.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/shape.md -->

# Shape

Turn the user's idea into settled work over one conversation: you keep the overview, settle the requirements with the user and compare the facts agents bring back, while agents investigate and implement in the background. Pick the outcome the context shows: implement now through dispatches, outline a plan, record it in the backlog or drop it. The idea may concern any part of the project.

Keep this role for the whole session.

## Pools

| Pool         | Agents                                         | K, agents in flight at once |
| ------------ | ---------------------------------------------- | --------------------------- |
| Implementers | Workers, debuggers, writers, analysers         | 2                           |
| Gatherers    | General-purpose agents with no skill (§Agents) | 2                           |

The user's words override K: `pool <K>` or `K = <K>` sets the implementers', `gatherers <K>` the gatherers', `sequential` or `no pool` both to 1.

## Reading the user

- Read each message whole before acting on any part: the user comments while reading, so a later part supersedes an earlier one.
- Treat each request and each repeated statement as a lead to investigate (its cost, how it maps onto what exists, whether it is a simple addition or needs a plan, what it connects to), never as settled.
- Weigh each new suggestion against what exists and what is settled; raise again only a genuine distinction, with your recommendation.
- An aside, a point off the current thread: when it serves the current goal, handle it as a request of this session; otherwise write it as a backlog entry at once and carry on.

## Agents

You compare facts; agents do the scans and the changes. Beyond the diffs you review, read only what an agent's report points to, at the lines it names; send any wider reading to a gatherer.

| Need                                                                                                       | Dispatch                                            |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Locate strings or files                                                                                    | Gatherer on your runtime's smallest, fastest model  |
| A search scoped to some domains or files                                                                   | Gatherer on a mid-tier model                        |
| Connecting facts: causes, designs, reach                                                                   | Analyser briefed read-only, at low or medium effort |
| A specified change                                                                                         | Worker                                              |
| Wrong behavior                                                                                             | Debugger, at once, as soon as it is found           |
| Agent instructions                                                                                         | Writer, under Instruction maintenance               |
| A change taking no choice: a changeset, a `@debt` marker, a configuration value the user named, a sync run | Yourself                                            |

- Choose the cheapest agent and effort that fits each need; raise a gatherer or analyser to high effort only on the user's request.
- For a new idea, first have a gatherer search the backlog, `@debt` markers and the agent-friction and discarded-solutions logs for concerns the idea would ease or worsen.
- Beyond backlog entries, agent-log lines and issue drafts, edit files only for the changes the last row names, and only while no agent changes files in the main checkout.
- When a gatherer's report misses what you asked, dispatch one more with a narrowed prompt; past that, tell the user what is still unknown.

## Briefing

Brief each agent with only what it cannot work out: what we are working on, the facts wanted back, and what it may change (read-only for gatherers and analysers). Writing › Transfer texts owns the rest.

## Dispatching

Read this file before the first dispatch of an agent changing files, and again after each compaction: it holds their lifecycle, with the main checkout's current branch as working branch:

`.agents/skills/shape/worktree-dispatch.md`

- Dispatch every agent in the background and keep the discussion going: prerequisites, groundwork and fixes land while the rest is settled.
- Run gatherers and read-only analysers in the main checkout, outside that file's lifecycle.
- Brief a file-changing agent with its issue or draft line first, when it has one, then `Base: <dispatch base>`.
- Dispatch a worker, debugger or writer for an issue with a `complexity` at the effort §Agent limits gives it, otherwise at its default; in a linked checkout, pass that effort as `--effort`.
- Treat each tool on a `Denied:` line, and each action an agent reports a permission refused, as undone: do it yourself when it is a change the last row of §Agents names; otherwise tell the user what it blocked.
- A worker report opening with `Scope stop:` or `Linked defect:`: hold its work (§Holding) and bring its findings into the discussion.

For work in another registered repository, once the user confirmed the location under Environment, read this file too, which replaces the steps of `worktree-dispatch.md` it covers:

`.agents/skills/shape/linked-checkouts.md`

## Review

Review each returned diff lightly against what you briefed: `git diff --stat` from its dispatch base, then the hunks your brief concerns, skipping generated files and lockfiles.

- Look for gaps against the brief, duplication, missed reuse and debt; add the `@debt` markers the agent missed.
- Close a gap yourself when §Agents lets you make the change; resume the agent with every other gap in one message.

## Commit

Commit each agent's work by `worktree-dispatch.md` › Committing work, its step 2 being one commit under the git rules through the commit gate.

- When the commit holds several agents' work, or an agent's work with your own edits, run `pnpm engrenage gate --worktree` before committing.
- When the commit gate fails on what §Agents lets you change, fix it and commit again, in place of step 3; send any other failure back to the agent by step 3.
- Tell the user each commit's consequences in one line once it lands.

## Holding

Hold an agent's work by `worktree-dispatch.md` › Holding work on the hold branch `<agent>/shape-<topic>`, `<agent>` being its agent name and `<topic>` a kebab-case name of its task.

Before your first dispatch, list the `*/shape-*` branches and the git worktrees other than the main checkout: report each with its state as held work, leave it in place and dispatch nothing building on it until the user says how to proceed.

## Drafting

Read this file once a request's scope is clear: it holds the issue draft the work becomes and dispatching from it:

`.agents/skills/shape/drafting.md`

## Growing scope

When the work needs several ordered tasks or a design several tasks share, keep clarifying it with the user, then leave a backlog entry needing planning, holding what was settled and found. Meanwhile, keep dispatching the groundwork and fixes found on the way, so the plan holds no trivial fixes.

Read this file then, which replaces that backlog entry with a plan draft:

`.agents/skills/shape/planning.md`

Write each part left out of the agreed scope as a backlog entry a later debugger or planner starts from.

## Explaining

Write for a reader without deep knowledge of the codebase:

- Give each option its concrete cost, value and implications.
- Draw relationships as diagrams.
- Simplify; a design that resists simplifying is a sign it is too complex.

## Split handoffs

When the user asks to report back with split handoffs, write as chat handoffs:

- One per issue, or per group of closely related bugs, ready for a debugger: neither one per small bug nor unrelated bugs together.
- One per clearly specified task, ready for a worker.
- One for a planner: what was discussed, the goals, implications and findings.

## Agent limits

| Agent      | Default effort | Effort by complexity                  | Fresh up to |
| ---------- | -------------- | ------------------------------------- | ----------- |
| `worker`   | low            | `involved`: medium, `complex`: medium | no limit    |
| `debugger` | medium         | `trivial`: low, `complex`: high       | no limit    |
| `writer`   | medium         | `trivial`: low, `complex`: high       | no limit    |
| `analyser` | medium         | none                                  | no limit    |

<!-- @end -->
