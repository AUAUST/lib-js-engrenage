---
"@auaust/engrenage": minor
---

- Add the `consultant` skill and agent, which the walker dispatches instead of a planner in consultant mode; projects walking issues add it with `engrenage agents skills add consultant`
- Replace an agent definition's `freshness` with `ceiling`, an absolute context size past which a resume is refused: 100k for the consultant and the merger, none for the planner
