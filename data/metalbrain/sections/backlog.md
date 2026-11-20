---
title: Backlog
description: Record work deferred beyond the current task.
category: workflow
default: false
order: 45
---

## Backlog

- Record out-of-scope findings and user-deferred work in the shared backlog: questions, bugs, tasks and improvements. Start with `.ai/backlog/index.md` and follow its category, entry and numbering instructions.
- Brief an agent dispatched to work on backlog entries with one `Backlog: <category>.<n>` line per entry, right after its `Issue:` or `Draft:` line when it has one, otherwise first: run records attribute the run to each entry from these lines.

A likely or proven bug outside your task, met while working, as the agent-records rule tells it from debt:

| Context                                         | Record                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| You may edit files                              | A backlog entry at once, named in your report                                                                                   |
| Your brief or skill makes you read-only         | Name it in your report, for your caller to record                                                                               |
| An agent you dispatched names one in its report | A backlog entry unless the backlog holds it: once that agent's work is committed or dropped, or at once when it changed no file |
