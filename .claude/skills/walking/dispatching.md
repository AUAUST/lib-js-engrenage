<!-- @reference @auaust/engrenage/metalbrain/shared/dispatching.md -->

# Dispatching

Rules for each agent you dispatch: when it runs beside others, its brief lines, its checkout and commits, its thoroughness stop and the findings its report names. Your skill refines them; Analysis › Thoroughness levels defines the levels and each agent's default.

## Parallel agents

Your skill's K, when it sets one, caps the agents it counts in flight at once. Within it, and for every other agent:

- Run agents side by side only when none needs another's findings or work; otherwise one after the other, never in parallel with a reconciliation after.
- Keep it cheap: each parallel agent pays a whole run to save waiting. A few gatherers on unrelated questions fit side by side; a second agent costing an analyser's run or more, only when the user asks or the decision waiting on both needs both now.

## Checkout and commits

Leave out of a brief where the agent works and what it commits, unless the user decided otherwise: its harness sets its checkout, its skill which of its steps it commits, and you commit the rest.

## Thoroughness levels

- Brief every agent a `Thoroughness: <level>` line, placed after its other `<Name>:` lines. Take the level from the first of these that sets one: your skill; for an issue with a `complexity`, `scoped` when it is `trivial` and `standard` when it is `involved` or `complex`; otherwise the agent's default, unless you know its work needs the other level.
- When resuming an agent, add a `Thoroughness:` line only to hand it a task of its own, which opens a new window; a message that answers, adds facts to or asks fixes of work under way carries none.
- Iterate work that needs more digging than one agent's level allows across fresh agents, each taking over from its predecessor's handoff. Split work too large for one agent before dispatching it: no level sizes the work handed over.
- **A report opening with `Thoroughness stop:`.** Never resume the stopped agent for what remains. Handle what remains by the first matching case:
  - **What remains is part of what you dispatched the agent for, and the agent is no successor whose report shows nothing done of what its predecessor left remaining.** Commit the files it changed, as your skill commits an agent's work or otherwise under the git rules, as advancing the task without completing it. Then dispatch a new agent of the same role at the same level for what remains, briefed as the stopped agent was, from the new dispatch base, plus that report's progress and the gaps your review of that work found.
  - **Otherwise.** Take the report as it stands, and handle what remains as your skill handles a blocked report or one missing what you asked.

## Backlog

- Brief an agent dispatched to work on backlog entries with one `Backlog: <entry ID>` line per entry, right after its `Issue:` or `Draft:` line when it has one, otherwise first: run records attribute the run to each entry from these lines.
- A finding an agent you dispatched names in its report, as the Backlog section defines one: a backlog entry unless the backlog holds it, once that agent's work is committed or dropped, or at once when it changed no file.

<!-- @end -->
