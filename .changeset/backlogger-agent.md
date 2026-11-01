---
"@auaust/engrenage": minor
---

- Add the `backlog-handling` skill and its Claude Code `backlogger` agent, which bring backlog entries up to date and file the ones ready for action as issues in AUAUST repositories; backlog setup installs it, and existing projects run `engrenage agents skills add backlog-handling`
- Remove backlog entries once a GitHub issue tracks their work, in the backlog template
