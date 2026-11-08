---
"@auaust/engrenage": patch
---

- Check every Claude worker and debugger dispatch: the generated hook now runs on all `Agent` calls, since Claude Code never applied its `Agent(worker)` and `Agent(debugger)` filters
