---
"@auaust/engrenage": patch
---

- Add `engrenage agents skills [add <name>]` to install shared agent skills for Claude Code and Codex, and keep them current on `engrenage sync agents`
- Add the `issue-planning` skill and its Claude Code `planner` agent, which plan work as a tree of GitHub issues without implementing it
- Add the `issue-implementation` skill and its Claude Code `worker` agent, pinned to Sonnet, which implement one planned issue as written
- Accept `model` in a skill's agent metadata
