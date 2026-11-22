---
"@auaust/engrenage": patch
---

- Have workers commit a checkpoint before spreading a settled step across many files, and callers review and drop their work from the dispatch base without resetting unheld commits
- Default walks and shape to one agent changing files in flight, running read-only agents and inner planners side by side only when independent and worth their cost
- Keep instruction changes to the `writer` agent or a consenting main session: other dispatched agents report them instead
