---
"@auaust/engrenage": minor
---

- Breaking: `agents.budgets` takes `goal`, `context`, `doneWhen`, `comment`, `backlogEntry` and `debtEntry`; `plan`, `block` and `task` are removed
- Measure each **Goal**, **Context** and **Done when** section of a `gh issue create|edit` body against its own budget, counting words outside code and link targets; other sections have no budget
- Warn from `engrenage gate` when a changed backlog or debt entry is over budget, without failing it
