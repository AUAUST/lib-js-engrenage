---
"@auaust/engrenage": minor
---

- Read a brief's `Thoroughness:` line instead of `Budget:` for the subagent's thoroughness level
- Rename the `metalbrain hook claude budget` command `metalbrain hook claude thoroughness`
- Rename the agent frontmatter key `budget` `thoroughness`
- Record a `Thoroughness stop:` report as the `thoroughness` outcome instead of `Budget stop:` as `budget`
- Rename a run record's `budget` entry `thoroughness`, its `budget` field `limit`, reading older records as before
- Rename the `metalbrain/budgets.json` subpath `metalbrain/thoroughness.json` and the subagent state files `.budget.json` to `.thoroughness.json`
- Rename the `metalbrain/runtimes` exports `budgetExtension`, `budgetLevels`, `checkBudget`, `isBudgetLevel`, `parseBudgetState`, `readBudgets` and `AgentRunBudget` to `thoroughnessExtension`, `thoroughnessLevels`, `checkThoroughness`, `isThoroughnessLevel`, `parseThoroughnessState`, `readThoroughnessLimits` and `AgentRunThoroughness`
- Show agent stats' level and token limit under the `Thoroughness` and `Token limit` columns
- Word the hook's warnings as thoroughness warnings past a token limit
