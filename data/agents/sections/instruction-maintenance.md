---
title: Instruction maintenance
description: Maintain agent instructions and write them as short, precise rules.
category: workflow
default: true
order: 10
---

## Instruction maintenance

- Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources only with explicit user consent to that change, then dispatch the `writer` agent with the decided behavior and the reach the consent covers, and review its diff before committing. Unable to dispatch, as a subagent: load the instruction-writing skill and follow it yourself.
- A `<!-- @reference <reference> -->` marker opens a block that `pnpm engrenage sync agents` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.
- Put in AGENTS.md only rules every agent needs, and surface-specific detail in `.claude/rules/`, one file per surface. Keep feature documentation, file inventories, API details and records of recent changes out of both.
- When tooling starts enforcing a rule, delete its prose. List it under "Enforced by tooling" only when its fix is manual and it shapes how code is first written.
