---
title: Backlog
description: Record work deferred beyond the current task.
---

## Backlog

Record out-of-scope findings and user-deferred work in the shared backlog, reading and changing it only through `pnpm metalbrain backlog categories|list|search|show|create|add|update|tap|merge|move|relocate|close`.

A finding outside your task that no agent record holds:

- **You may edit files.** A backlog entry at once, named in your report.
- **Your brief or skill makes you read-only.** Name it in your report, for your caller to record.

Filing an entry:

- **Category.** The one owning the dependency family or project subsystem that must change, from `categories`: upstream work under its dependency's product family, one per tool, never per vendor or integration; local coding conventions and linting under `coding-style`. When none owns it, create one without asking, its purpose naming the product or behavior it owns.
- **Entry.** Act on the similar entries `add` lists (agent-records rule); tap instead an entry you know the finding adds nothing to, or update one it extends. Title: the problem or need, stated exactly; then `--sites` for its code sites and at most three items across `--why`, `--want` and `--done`, none restating the title.
- **Closing.** Close an entry once resolved, obsolete or tracked in full by a GitHub issue; reduce one an issue tracks in part to what the issue leaves, linking it.
- Cite an entry by its ID, only within this repository.
