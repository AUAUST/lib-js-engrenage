---
"@auaust/engrenage": patch
---

- Add `gate: true` to skill `agent:` blocks, synced as a Claude Code `Stop` hook running `engrenage agents claude hook stop`: it sends a subagent back once with the worktree gate's failures, and lets a second stop on the same tree through
- Gate the shipped worker and debugger agents
