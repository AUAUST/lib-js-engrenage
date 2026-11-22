# Dispatching

Rules for each agent you dispatch: when it runs beside others, its brief lines, its thoroughness stop and the findings its report names. Your skill refines them; Analysis › Thoroughness levels defines the levels and each agent's default.

## Parallel agents

Your skill's K, when it sets one, caps the agents it counts in flight at once. Within it, and for every other agent:

- Run agents side by side only when none needs another's findings or work; otherwise one after the other, never in parallel with a reconciliation after.
- Keep it cheap: each parallel agent pays a whole run to save waiting. A few gatherers on unrelated questions fit side by side; a second agent costing an analyser's run or more, only when the user asks or the decision waiting on both needs both now.

## Checkout and commits

Leave the agent's checkout and commits out of its brief unless the user decided them: its harness and skill set them, and you commit what it leaves.

## Thoroughness levels

- Brief every agent a `Thoroughness: <level>` line after its other `<Name>:` lines: the level your skill sets; otherwise, for an issue with a `complexity`, `scoped` when `trivial`, `standard` when `involved` or `complex`; otherwise the agent's default, unless you know its work needs the other level.
- When resuming an agent, add one only to hand it a task of its own, which opens a new window.
- Iterate work deeper than one agent's level across fresh agents, each taking over from its predecessor's handoff; split work too large for one agent before dispatch: no level sizes the work handed over.
- **A report opening with `Thoroughness stop:`.** Never resume the stopped agent. When what remains is part of what you dispatched it for, unless it is a successor that did none of what its predecessor left, commit the files it changed as your skill commits an agent's work, otherwise under the git rules, towards the task, then dispatch a new agent of the same role and level for what remains: briefed as the stopped one was, from the new dispatch base, plus that report's progress and the gaps your review of its work found. Otherwise take the report as it stands and handle what remains as your skill handles a blocked report or one missing what you asked.

<!-- @file .ai/backlog/index.md -->

## Backlog

- Brief an agent dispatched to work on backlog entries with one `Backlog: <entry ID>` line per entry, right after its `Issue:` or `Draft:` line when it has one, otherwise first: run records attribute the run to each entry from these lines.
- A finding an agent you dispatched names in its report, as the Backlog section defines one: a backlog entry unless the backlog holds it, once that agent's work is committed or dropped, or at once when it changed no file.

<!-- @end -->
