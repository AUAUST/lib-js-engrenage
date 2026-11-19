---
title: Verification
description: Verify and report changes.
category: workflow
default: true
order: 70
---

## Verification

| When                                    | Check                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| During implementation                   | Targeted checks; lint by hand only the files you name, with `pnpm engrenage eslint:fix <files>`: without files it lints the whole project                                                               |
| Before delivery, when you changed files | Review against architectural boundaries and quality requirements, not only behavior; run the worktree gate, `pnpm engrenage gate --worktree`, once on the uncommitted work, adding only checks it lacks |
| Each commit                             | Pass the commit gate, never bypassing it; it formats, lints and checks the changed files, so never format by hand                                                                                       |

- Write the minimum tests needed for confidence, usually one expected case and one meaningful edge case. Reuse existing tests before adding new ones.
- The stop gate: the worktree gate run when a gated subagent stops, reusing a pass on the same tree; it blocks the first stop on a failing tree, and its message says what to do.
- Report actual results and what blocked you, including unavailable integrations and skipped checks.
