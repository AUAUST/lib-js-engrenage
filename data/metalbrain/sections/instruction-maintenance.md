---
title: Instruction maintenance
description: Maintain agent instructions and write them as short, precise rules.
category: workflow
default: true
order: 10
---

## Instruction maintenance

- Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources, including deleting prose a new check enforces, only with explicit user consent to that change, then dispatch the `writer` agent with the decided behavior and the reach the consent covers, and review its diff before committing. Unable to dispatch, as a subagent: load the instruction-writing skill and follow it yourself.
