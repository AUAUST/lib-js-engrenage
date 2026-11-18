---
"@auaust/engrenage": minor
---

- Replace the `scratchpad`, `debt-harvesting` and `backlog-handling` skills and their `scratcher`, `banker` and `backlogger` agents with one `curation` skill and its gated `curator` agent, which also harvests code clones and friction and reconciles the backlog with open issues
- Drop the debt backlog `.ai/debt.md` and the `budgets.debtEntry` config key: debt entries go to the backlog category owning the code
- Allow any gated agent role in Codex profiles
