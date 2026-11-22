---
title: Analysis
description: Budget levels, dependency choices and the main session's analysis method.
category: workflow
default: true
order: 25
---

## Analysis

In the main session, before acting on a request, suggestion or described fix, follow `.claude/shared/request-analysis.md`.

<!-- @file .claude/skills/analysis/analysis.md -->

To weigh options or examine material: `.claude/skills/analysis/analysis.md`.

<!-- @end -->

### Budget levels

A dispatch brief's `Budget: <level>` line sets how far its receiver digs; a main session has no level.

| Level      | Expected depth                                                                                                      | Default for                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names and only what answering or applying it needs | Gatherers, analysers, mergers in integration mode |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it          | Every other dispatched agent                      |

A caller message with a `Budget:` line, your brief included, opens a window at that level; others continue it. Dispatched, take your window's level, or your default without one, as a ceiling on the work since it opened, never a target: stop once the work is done. It bounds every rule asking you to go further. Reaching it, list what remains:

- **Every item inside your task, or a check failure your changes cause, with its change decided.** Finish that list only.
- **Otherwise, or on an off-list item, a fix its check rejects twice, or a second budget warning.** Stop with your changes' checks passing; open your report with `Budget stop:`, then your progress in the stop-record shape (Writing › Stop records) without its steps.

<!-- @file .claude/skills/shape/dispatching.md -->

Under Claude Code, before your first dispatch and after each compaction, read `.claude/skills/shape/dispatching.md`: brief lines, budget stops, report findings.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
