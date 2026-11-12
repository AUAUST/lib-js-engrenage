---
"@auaust/engrenage": patch
---

- Fix `planning issue publish` failing half-way when a draft's `subIssues` takes an issue from a parent outside the set
- Fail `planning issue publish` before any write when that parent is a Plan, naming the `planning issue claim` command
