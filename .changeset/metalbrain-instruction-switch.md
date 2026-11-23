---
"@auaust/engrenage": minor
---

- Name `pnpm metalbrain` commands in the shared instructions, and record friction and discarded solutions through `metalbrain friction|discarded`, their recurrence from `stats`
- Retire `.ai/backlog/index.md`: sync deletes it, the Backlog section holds its filing rules and init creates `.ai/backlog/index.yml` instead
- Render the issue and backlog word caps in the issue-drafts and word-caps rules from the config
- Remove `formatBacklogIndex` and `migrateBacklogIndex` from `future/metalbrain/instructions`, and rename `backlogIndex` to `legacyBacklogIndex` in `future/metalbrain/backlog/constants`
