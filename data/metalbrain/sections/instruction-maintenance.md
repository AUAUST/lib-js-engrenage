---
title: Instruction maintenance
description: Change agent instructions only with user consent, through the instruction-writing skill.
category: workflow
default: true
order: 10
---

## Instruction maintenance

Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources, deleting prose a new check enforces included, only with explicit user consent to that change; `pnpm engrenage sync` output aside:

- **Main session.** Dispatch a `writer` agent with the request as it came and the reach the consent covers, and review its diff before committing; without one, load the instruction-writing skill and follow it yourself.
- **Dispatched, not as `writer`.** Never, whatever your issue or brief states: report the change needed.
