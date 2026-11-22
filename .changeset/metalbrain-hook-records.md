---
"@auaust/engrenage": minor
---

- Move the SubagentStart, Stop and SubagentStop run records to `metalbrain hook claude <event>`, dropping them from `engrenage-hook claude`, whose `Stop` now requires its `skill` source
- Record agent runs and the tool-call log under the main worktree's `.ai/stats` from any linked worktree
