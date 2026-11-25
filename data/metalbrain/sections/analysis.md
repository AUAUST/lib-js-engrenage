---
title: Analysis
description: Thoroughness levels, dependency choices and the main session's analysis method.
---

## Analysis

Take the smallest step toward the ideal that meets the current need and that no later step toward it must undo.

In the main session, before acting on a request, suggestion or described fix, follow `.claude/shared/request-analysis.md`.

<!-- @file .claude/skills/analysis/analysis.md -->

To weigh options or examine material: `.claude/skills/analysis/analysis.md`.

<!-- @end -->

### Thoroughness levels

A dispatch brief's `Thoroughness: <level>` line sets how far its receiver digs; a main session has no level.

| Level      | Work it covers                                                                 | Default for                   |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------- |
| `scoped`   | The material the brief names, and only what answering or applying it needs     | Gatherers, analysers, mergers |
| `standard` | Also the sources sharing the task's subject, and the leads they open within it | Every other dispatched agent  |

A caller message with a `Thoroughness:` line, your brief included, opens a window at that level; a brief without one, at your default; other messages continue the window. As a dispatched agent, take your window's level as a ceiling on the work since it opened, never a target; it bounds every rule asking you to go further. When you reach it or get a first thoroughness warning, list what remains:

- **Each item is inside your task or a check failure your changes caused, with its change decided.** Finish that list only.
- **Otherwise, or on an item off the list, a fix its check rejects twice or a second warning.** Stop with your changes' checks passing; open your report with `Thoroughness stop:`, then your progress in the stop-record shape (Writing › Stop records) without its steps.

<!-- @file .claude/skills/shape/dispatching.md -->

Under Claude Code, before your first dispatch and after each compaction, read `.claude/skills/shape/dispatching.md`: parallel agents, brief lines, thoroughness stops, report findings, pending work.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
