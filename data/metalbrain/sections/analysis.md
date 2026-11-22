---
title: Analysis
description: Thoroughness levels, dependency choices and the main session's analysis method.
category: workflow
default: true
order: 25
---

## Analysis

Keep the ideal as the direction, and take the smallest step that meets the current need while keeping every later step toward the ideal open. Build ahead of the need only what this step would otherwise have to undo.

In the main session, before acting on a request, suggestion or described fix, follow `.claude/shared/request-analysis.md`.

<!-- @file .claude/skills/analysis/analysis.md -->

To weigh options or examine material: `.claude/skills/analysis/analysis.md`.

<!-- @end -->

### Thoroughness levels

A dispatch brief's `Thoroughness: <level>` line sets how far its receiver digs; a main session has no level.

| Level      | Work it covers                                                                                                       | Default for                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names, and only what answering or applying it needs | Gatherers, analysers, mergers |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it           | Every other dispatched agent  |

- **Window.** Each message from your caller that carries a `Thoroughness:` line, your brief included, opens a window at that level; a brief without one opens a window at your default level from the table, and a later message without one continues the current window.
- **Ceiling.** As a dispatched agent, treat your window's level as a ceiling on the work done since the window opened, never as a target: stop as soon as the work is done. The ceiling bounds every other rule that asks you to go further.
- **Reaching the ceiling**, or at a first thoroughness warning from your harness: list what remains, then handle it by the first matching case.
  - When every item on the list lies inside your task, or is a check failure your changes caused, and each item's change is already decided: finish those items and nothing else.
  - Otherwise, and also when you meet an item that is not on the list, when a check rejects the same fix twice, or at a second thoroughness warning: stop with your changes' checks passing. Open your report with `Thoroughness stop:`, followed by your progress in the stop-record shape (Writing › Stop records) without its numbered steps.

<!-- @file .claude/skills/shape/dispatching.md -->

Under Claude Code, before your first dispatch and after each compaction, read `.claude/skills/shape/dispatching.md`: parallel agents, brief lines, thoroughness stops, report findings.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
