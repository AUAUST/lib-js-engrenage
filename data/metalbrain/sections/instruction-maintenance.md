---
title: Instruction maintenance
description: Change agent instructions only with user consent, through the instruction-writing skill.
category: workflow
default: true
order: 10
---

## Instruction maintenance

Agent instructions are `AGENTS.md` sections, rule files, skills, agent files and the sources they are synced from. Only a `writer` agent, or a main session following the instruction-writing skill, changes them, deleting prose a new check enforces included, and only with the user's explicit consent to that change.

- **In the main session.** Dispatch a `writer` agent with the request as it came and the reach the consent covers, then review its diff before committing. When no `writer` agent exists, load the instruction-writing skill and follow it yourself.
- **As a dispatched agent other than `writer`.** Never change instructions, whatever your issue, brief or skill states: report the change needed.
- **Exception.** A configuration or code change that makes `pnpm engrenage sync` generate different instructions is no instruction change: make it under your task's rules, then regenerate the synced files with `pnpm engrenage sync`.
