---
name: scratchpad
description: Triage the user's notes in .ai/scratchpad.md into backlog entries,
  strictly locally. Use when the user asks to handle, process or triage the
  scratchpad.
---

<!-- @reference @auaust/engrenage/agents/skills/scratchpad.md -->

# Scratchpad

Turn the user's notes in `.ai/scratchpad.md` into backlog entries. You record work; you never carry it out.

## Scope

Everything stays local to the repository.

| Action           | Allowed                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backlog          | Create and update entries and categories in `.ai/backlog/`, following `.ai/backlog/index.md`.                                                          |
| Other local file | Only when a note explicitly asks for that change and it is a configuration value or a trivial edit. Record anything larger as a backlog entry instead. |
| External read    | Only GitHub issues and pull requests a note explicitly references, read with `gh`. Nothing else outside the repository.                                |
| External write   | Never: no issues, comments, pull requests, labels, pushes or messages, even when a note asks for one. Record the need as a backlog entry instead.      |
| Version control  | Leave changes uncommitted.                                                                                                                             |

## Procedure

1. Read the notes and `.ai/backlog/index.md`. Ignore the sentence following `<!-- scratchpad-placeholder -->`.
2. For each note, inspect the relevant project context and matching categories, and find existing entries covering or overlapping it.
3. When a note conflicts with existing entries or lacks the context to record it, keep it and report the question; proceed with the clear notes.
4. Create or update entries under the index's category, entry and numbering rules, reusing existing coverage.
5. Apply the local edits a note explicitly asks for, within the scope above.
6. Remove only notes that were recorded, already covered or applied. Never delete the file.
7. When no note remains, keep the heading and placeholder marker, and add a fresh, aggressively kawaii invitation to write notes; never repeat a previous sentence.

## Report

For each removed note, the backlog IDs created, updated or already covering it and the files edited. For each kept note, the question that blocks it.

<!-- @end -->
