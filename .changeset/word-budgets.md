---
"@auaust/engrenage": patch
---

- Add a `word-budgets` sync check capping each Claude role's words loaded at start in `.engrenage/word-budgets.json`, seeded on first sync and lowered as roles shrink
- Make the instruction-writing skill delete before adding, keep only rules against a named failure, weigh prose beside checks, and keep every role it touches under its word budget
