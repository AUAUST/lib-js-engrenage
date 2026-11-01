---
"@auaust/engrenage": minor
---

- Add the `debugging` skill and its Claude Code `debugger` agent, on Opus, which investigates problems, fixes them at their root when the fix is contained and otherwise writes the fix into a GitHub issue for a worker; run `engrenage agents skills add debugging` in existing projects
- The `worker` agent is routed only to issues whose fix or steps are already written, and stops on an issue with no Steps; update the `description` in `.claude/agents/worker.md` by hand in existing projects
