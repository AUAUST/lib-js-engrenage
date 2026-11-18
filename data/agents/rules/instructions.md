---
title: Writing instructions
description: Draft agent instructions that produce the intended behavior.
category: workflow
default: true
order: 15
paths:
  - "AGENTS.md"
  - "AGENTS.override.md"
  - "CLAUDE.md"
  - ".claude/**"
  - ".agents/**"
  - ".ai/issues/**"
  - ".ai/backlog/**"
  - ".codex/**"
---

# Writing instructions

Apply on top of the writing rules to every agent instruction you draft or edit, including wording proposed in issues and backlog entries. Aim: each rule exact, stated once by its owner, in the densest form that keeps its meaning, contradicting no other. The instruction-writing skill holds the process that applies them.

## Form

Refines the writing rules' structure table:

| Content                                                       | Form                                             |
| ------------------------------------------------------------- | ------------------------------------------------ |
| Rules differing only by context, with the same kind of action | Table, context column first, one row per context |
| A principle the other rules derive from                       | One or two sentences of prose, before the rules  |

- Such rules needing sentences, which the writing rules move to a list: one `**Context.** action` item per context.
- A rule a tool can check: propose the check, and keep the rule as prose until the check exists. Then delete the prose, or keep it under "Enforced by tooling" when its fix is manual and it shapes how code is first written.

## Placement

- A `<!-- @reference <reference> -->` marker opens a block that `pnpm engrenage sync agents` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.
- Put in AGENTS.md only rules every agent needs, and surface-specific detail in `.claude/rules/`, one file per surface. Keep feature documentation, file inventories, API details and records of recent changes out of both.

## Wording

- Write each rule as its trigger and the behavior it must produce; cut connectives and subjects the rule's heading, column or list already states.
- Give a reason only when it changes how the rule is applied, in one clause.
- Reuse the request's wording only where it is already the clearest and shortest; never carry over its examples or the cases that motivated it.
- Phrase a rule so that applying it precisely produces the right outcome; add an example only when the rule cannot be stated without one.
- Merge a rule into any rule sharing its trigger or its action instead of adding it alongside.
- Name each concept by one term across every source.
- Define a skill's role by what its agent does and the limits of its own scope, never by contrast with or exclusion of another role or skill. A description's trigger exclusions and naming an agent to dispatch, route or hand work to are no contrast.

## Conflicts

- A conflict is two rules prescribing different behavior for one context, or one rule stated in two places that can drift apart.
- Resolve every conflict you find, in your text or beyond it: in the same change when the user's consent covers it, otherwise as a backlog entry you report. Never leave one unrecorded.
- Where a conflict can recur, propose a check that fails on it.
