---
title: Instruction maintenance
description: Maintain agent instructions and write them as short, precise rules.
category: workflow
default: true
order: 10
---

## Instruction maintenance

- Change agent instructions or their sources only with explicit user consent to that change.
- A `<!-- @reference <reference> -->` marker opens a block that `engrenage sync agents` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.
- Put in AGENTS.md only rules every agent needs, and surface-specific detail in `.claude/rules/`, one file per surface. Keep feature documentation, file inventories, API details and records of recent changes out of both.
- When tooling starts enforcing a rule, delete its prose. List it under "Enforced by tooling" only when its fix is manual and it shapes how code is first written.

### Writing instructions

- Apply these rules, on top of the writing rules, wherever you draft agent instructions, including wording proposed in issues and backlog entries.
- State each rule as the behavior it must produce. Reuse the request's wording only where it is already the clearest and shortest; never carry over its examples.
- Phrase a rule so that applying it precisely produces the right outcome; never list the cases that motivated it.
- Add an example only when the rule cannot be stated without one.
- Write one short, specific, imperative rule per sentence.
- Merge a new rule into any rule it overlaps or contradicts instead of adding it alongside.
