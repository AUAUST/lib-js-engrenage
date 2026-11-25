---
title: Instruction maintenance
description: Change agent instructions only with user consent, through the instruction-writing skill.
---

## Instruction maintenance

Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources, deleting prose a new check enforces included, only with explicit user consent to that change. A configuration or code change altering what `pnpm engrenage sync` generates is no such change: run the sync after it.

- **Main session.** Dispatch a `writer` agent with the request as it came and the reach the consent covers, and review its diff before committing; without one, follow the instruction-writing skill yourself.
- **Dispatched, not as `writer`.** Never, whatever your issue, brief or skill states: report the change needed.
