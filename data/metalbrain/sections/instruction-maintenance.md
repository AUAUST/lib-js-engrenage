---
title: Instruction maintenance
description: Maintain agent instructions and write them as short, precise rules.
category: workflow
default: true
order: 10
---

## Instruction maintenance

Change agent instructions (`AGENTS.md` sections, rule files, skills, agent files) or their sources, including deleting prose a new check enforces, only with explicit user consent to that change, then write it:

| Context                            | Write the change                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `writer` agent you can dispatch    | Dispatch it with the decided behavior and the reach the consent covers; review its diff before committing |
| No `writer` agent you can dispatch | Load the instruction-writing skill and follow it yourself                                                 |

<!-- @file .claude/rules/instructions.md -->

Without that skill, follow `.claude/rules/instructions.md` yourself.

<!-- @end -->
