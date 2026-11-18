---
"@auaust/engrenage": minor
---

- Merge the `agent-friction`, `debt-markers` and `discarded-solutions` rules into `agent-records`; sync migrates existing rule files
- Support `formerly` on agent rules, so sync renames and merges a project's former rule files
- Load the `project-map` rule only for files of the mapped environments
- Move the instruction-writing rules and the word budgets out of `AGENTS.md` into the path-scoped `instructions` and `budgets` rules
- Condense the Precedence, Decision protocol, Analysis and Implementation sections
