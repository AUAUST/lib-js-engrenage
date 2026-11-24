---
"@auaust/engrenage": minor
---

- Move the `workspaces` glob entries under `workspaces.globs`, preset keys included (breaking)
- Add `workspaces.extra`: `"report"` reports each `.workspace.json` no glob matches as an `unmatched-workspace` error and ignores it, `"accept"` (default) keeps it a workspace
