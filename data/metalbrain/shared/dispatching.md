# Dispatching

Rules for each agent you dispatch: when it runs beside others, its brief lines, its checkout and commits, its budget stop and the findings its report names. Your skill refines them; Analysis › Budget levels defines the levels and each agent's default.

## Parallel agents

Your skill's K, when it sets one, caps the agents it counts in flight at once. Within it, and for every other agent:

- Run agents side by side only when none needs another's findings or work; otherwise one after the other, never in parallel with a reconciliation after.
- Keep it cheap: each parallel agent pays a whole run to save waiting. A few gatherers on unrelated questions fit side by side; a second agent costing an analyser's run or more, only when the user asks or the decision waiting on both needs both now.

## Checkout and commits

Leave out of a brief where the agent works and what it commits, unless the user decided otherwise: its harness sets its checkout, its skill which of its steps it commits, and you commit the rest.

## Budget levels

- Brief every agent a `Budget: <level>` line, after its other `<Name>:` lines: the level your skill sets for it; otherwise, for an issue with a `complexity`, `scoped` when `trivial`, `standard` when `involved` or `complex`; otherwise the agent's default, unless you know its work needs the other level. Resuming an agent, add one only to hand it a task of its own, opening a new window; a message answering, adding facts to or asking fixes of work under way carries none.
- Iterate work deeper than one agent's level across fresh agents, each taking over from its predecessor's handoff, and split work too large for one agent before dispatch: no level sizes the work handed over.
- **A report opening with `Budget stop:`.** Never resume the stopped agent for what remains. When what remains is part of what you dispatched it for, commit the files it changed as your skill commits an agent's work, otherwise under the git rules, towards the task without completing it, then dispatch a new agent of the same role at the same level for what remains: its brief as the stopped agent's was, from the new dispatch base, plus that report's progress and the gaps your review of that work found. Otherwise, or when a successor's budget stop reports nothing done that its predecessor's report left remaining, take the report as it stands and handle what remains as your skill handles a blocked report or one missing what you asked.

<!-- @file .ai/backlog/index.md -->

## Backlog

- Brief an agent dispatched to work on backlog entries with one `Backlog: <entry ID>` line per entry, right after its `Issue:` or `Draft:` line when it has one, otherwise first: run records attribute the run to each entry from these lines.
- A finding an agent you dispatched names in its report, as the Backlog section defines one: a backlog entry unless the backlog holds it, once that agent's work is committed or dropped, or at once when it changed no file.

<!-- @end -->
