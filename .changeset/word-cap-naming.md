---
"@auaust/engrenage": minor
---

- Rename the `agents.budgets` config section `agents.wordCaps`
- Rename the `word-budgets` sync check `word-caps`
- Move `.engrenage/word-budgets.json` to `.engrenage/word-caps.json` on sync
- Rename the `metalbrain/records` exports `BudgetFinding`, `BudgetKind`, `BudgetMode`, `Budgets` and `formatBudgetFinding` to `WordCapFinding`, `WordCapKind`, `WordCapMode`, `WordCaps` and `formatWordCapFinding`
- Rename a record kind's `budget` key `wordCap`
- Report texts over their word cap instead of their budget
- Rename the `budgets` agent rule `word-caps`, moving `.claude/rules/budgets.md` on sync
