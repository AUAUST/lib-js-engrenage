---
"@auaust/engrenage": patch
---

- Draft debugger issue edits locally in `.ai/issues/`, like the planner, and publish them in one flush once settled or needed by someone else
- Read issues from their local copies in `.ai/issues/` before fetching them, in the planner and the debugger
- Scope each session to its own drafts in `.ai/issues/`, deleted by exact path, and keep drafts out of commits
