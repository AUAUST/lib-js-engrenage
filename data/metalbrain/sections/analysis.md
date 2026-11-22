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

A dispatch brief's `Budget: <level>` line sets how far its receiver digs; a main session has no level. No level licenses sprawling.

| Level      | Expected depth                                                                                                      | Default for                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scoped`   | A precise question or a contained change: the material the brief names and only what answering or applying it needs | Gatherers, analysers, mergers in integration mode |
| `standard` | A task whose sources lead further: also the sources sharing its subject, and the leads they open within it          | Every other dispatched agent                      |

A caller message holding a `Budget:` line, your brief included, opens a window at that level; any other message continues the current window. Dispatched, take your window's level, or your default without one, as a ceiling on the work since it opened, never a target: stop once the work is done, however little of the level it used. It bounds every rule asking you to go further. When the next step would read or change past it, stop, leaving the files you changed in a state whose checks pass, and open your report with `Budget stop:`, then report your progress in the stop-record shape (Writing › Stop records), without the record's steps.

<!-- @file .claude/skills/shape/dispatching.md -->

Under Claude Code, before your first dispatch of an agent, and again after each compaction, read `.claude/skills/shape/dispatching.md`: its brief lines, its budget stop and the findings its report names.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
