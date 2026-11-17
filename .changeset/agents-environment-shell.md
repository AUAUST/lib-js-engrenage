---
"@auaust/engrenage": patch
---

Agent instructions write engrenage commands as `pnpm engrenage <command>`, and two new default sections, Environment and Shell, state the session-location check, how to run tools and the shell's traps. Existing projects add them with `<!-- @reference @auaust/engrenage/agents/sections/environment.md -->` and `<!-- @reference @auaust/engrenage/agents/sections/shell.md -->` in `AGENTS.md`.
