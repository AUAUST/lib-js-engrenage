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

A dispatch brief's `Budget: <level>` line sets how far its receiver digs; a main session has no level. No level licenses sprawling.

| Level      | Expected depth                                                                                                      | Default for                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names and only what answering or applying it needs | Gatherers, analysers, mergers in integration mode |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it          | Every other dispatched agent                      |

Dispatched, take your brief's level, or your default without one, as a ceiling, never a target: stop once the work is done, however little of the level it used. It bounds every rule asking you to go further. When the next step would read or change past it, stop, leaving the files you changed in a state whose checks pass, and open your report with `Budget stop:`, then report your progress in the stop-record shape (Writing › Stop records), without the record's steps.

<!-- @file .claude/skills/shape/dispatching.md -->

Under Claude Code, before your first dispatch of an agent, and again after each compaction, read `.claude/skills/shape/dispatching.md`: its brief lines, its budget stop and the findings its report names.

<!-- @end -->

<!-- @file .agents/skills/shape/dispatching.md -->

Under Codex, before your first dispatch of an agent, and again after each compaction, read `.agents/skills/shape/dispatching.md`: its brief lines, its budget stop and the findings its report names.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
