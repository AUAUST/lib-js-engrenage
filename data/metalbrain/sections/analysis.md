---
title: Analysis
description: Find the concern behind a request and its ideal solution before choosing what to adopt.
category: workflow
default: true
order: 25
---

## Analysis

Analyse every request, suggestion and described fix before acting on it, within the research your role and budget level allow:

1. **Concern.** Read the request as a hypothesis: name the concern it raises and its cause, and check that the proposed change addresses that cause.
2. **Ideal.** Work out the soundest solution to the cause as if time, scope and cost had no limit.
3. **Fit.** Map the ideal onto what exists: code, abstractions, patterns, dependencies, instructions, issues, backlog entries and the discarded-solutions log.
4. **Reach.** Trace what the ideal would alter: files, domains, contracts, decisions, issues and instructions.
5. **Outcome.** Adopt the ideal when your role allows its whole reach; otherwise adopt what it allows and report the ideal, its reach and your alternative. Your role: your skill's rules, otherwise the reach the request names; past it, pause under the decision protocol, whoever asked: an issue or a proposal costs less than a half-applied refactor. Record each solution you set aside and the code your change leaves short of the ideal under the agent-records rule.

<!-- @file .claude/skills/analysis/analysis.md -->

In the main session, weighing options or examining material for contradictions, gaps or costs: follow `.claude/skills/analysis/analysis.md`.

<!-- @end -->

### Budget levels

A dispatch brief's `Budget: <level>` line, after its other `<Name>:` lines, sets how far its receiver digs; a main session has no level.

| Level      | Expected depth                                                                                                      | Default for                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names and only what answering or applying it needs | Gatherers, analysers, mergers in integration mode |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it          | Every other dispatched agent                      |
| `open`     | Work the dispatcher expects to sprawl: also leads into neighbouring subjects, as far as the brief's goal needs      | None                                              |

- **Dispatching.** Brief every agent a `Budget:` line: the level your skill sets for it; otherwise, for an issue with a `complexity`, `scoped` when `trivial`, `standard` when `involved`, `open` when `complex`; otherwise the agent's default, unless you know its work needs another. A resume message's `Budget:` line replaces the level.
- **Dispatched.** Your brief's level, or your default without one, is a ceiling, never a target: stop once the work is done, however little of the level it used. It bounds every rule asking you to go further. When the next step would read or change past it, stop and open your report with `Budget stop:`, then report your progress in the stop-record shape (Writing › Stop records), without the record's steps.
- **A report opening with `Budget stop:`.** When what remains is part of what you dispatched the agent for, resume it once at the next level. Otherwise, when it stopped at `open`, or on its second budget stop, take its report as it stands and handle what remains as your skill handles a blocked report or one missing what you asked.

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
