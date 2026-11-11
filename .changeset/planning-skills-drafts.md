---
"@auaust/engrenage": minor
---

The planning, debugging and analysis skills draft issues through `planning issue create`, `claim`, `check` and `publish`, with no GitHub API mechanics; the planner in consultant mode claims and publishes each update at once. `planning issue check` fails on an empty draft section. The `gh` hook checks a `.draft.md` body file like any other body file and no longer reads bodies piped from drafts.
