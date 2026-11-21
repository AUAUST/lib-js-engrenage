---
"@auaust/engrenage": minor
---

- Refuse **Steps** sections and `Checkpoint:` lines in issue bodies, naming their conversion to **Done when** and **Context**
- Require **Done when** on task leaves, parents, plans and problems going to a worker, and on problem drafts
- Add **Provides** to tasks and **Fix** to problems: a problem with **Fix** goes to a worker, one with **Leads** or neither to a debugger
- Send a problem still holding **Steps** to a debugger
- Forbid **Provides** and **Tests** on segments, and **Leads** and **Fix** on parents
- Send a parent without **Housekeeping** to a worker once its sub-issues are closed, and mark ready plans and segments as `verification` in `planning walk check`
- Check debugger drafts against the required sections too
