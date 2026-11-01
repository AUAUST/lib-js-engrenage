---
"@auaust/engrenage": minor
---

- Replace the `scratchpad` agent rule with the `scratchpad` skill and its Claude Code `scratcher` agent, which triage scratchpad notes into the backlog strictly locally; delete `.claude/rules/scratchpad.md` and run `engrenage agents skills add scratchpad` in existing projects
- Drop the scratchpad routing line from the `backlog` section
- Restrict GitHub writes to AUAUST repositories in the `implementation` section
