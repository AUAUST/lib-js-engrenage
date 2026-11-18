---
# @preserve paths
paths:
  - "AGENTS.md"
  - "AGENTS.override.md"
  - "CLAUDE.md"
  - ".claude/**"
  - ".agents/**"
  - ".ai/issues/**"
  - ".ai/backlog/**"
  - ".codex/**"
  - "data/agents/**"
---

<!-- @reference @auaust/engrenage/agents/rules/instructions.md -->

# Writing instructions

Apply on top of the writing rules to every agent instruction you draft or edit, including wording proposed in issues and backlog entries. Aim: each rule exact, stated once by its owner, in the densest form that keeps its meaning, contradicting no other.

Reached after you wrote instructions: run the process on every instruction you wrote in the task, and rewrite each until it meets these rules.

## Process

1. **Inventory.** Before writing, search every source an agent reaches on the subject: `AGENTS.md` sections, rule files, skills, agent files, hook and lint messages. Note the owner of each fact you touch and every rule your text overlaps or contradicts.
2. **Enforcement.** Where a lint rule, type, hook or test could enforce the rule, propose that check under the decision protocol; keep prose only for what no check covers, or until the check exists.
3. **Models.** Look up current facts on how the models that will read the text follow instructions: their vendors' prompting guidance and the known behaviors of those exact versions, never what you remember of earlier ones. Draft only what those facts show will produce the intended behavior.
4. **Form.** Group the rules by shape and pick each group's form, then write.
5. **Validation.** Re-read your text alongside every rule step 1 found and every fact step 3 found, and diff it against the previous version: account for each removed rule as kept, merged, moved or dropped on purpose, and report the deliberate drops.

## Form

Refines the writing rules' structure table:

| Content                                                       | Form                                             |
| ------------------------------------------------------------- | ------------------------------------------------ |
| Rules differing only by context, with the same kind of action | Table, context column first, one row per context |
| A principle the other rules derive from                       | One or two sentences of prose, before the rules  |
| A rule a tool can check                                       | The check, under step 2                          |

- Choose a table for the mapping it makes visible, never for density alone: rows that need sentences to read, or columns most rows leave empty, belong in a list.

## Wording

- Write each rule as its trigger and the behavior it must produce; cut connectives and subjects the rule's heading, column or list already states.
- Give a reason only when it changes how the rule is applied, in one clause.
- Reuse the request's wording only where it is already the clearest and shortest; never carry over its examples or the cases that motivated it.
- Phrase a rule so that applying it precisely produces the right outcome; add an example only when the rule cannot be stated without one.
- Merge a rule into any rule sharing its trigger or its action instead of adding it alongside.
- Name each concept by one term across every source.

## Conflicts

- A conflict is two rules prescribing different behavior for one context, or one rule stated in two places that can drift apart.
- Resolve every conflict you find, in your text or beyond it: in the same change when the user's consent covers it, otherwise as a backlog entry you report. Never leave one unrecorded.
- Where a conflict can recur, propose a check that fails on it, as in step 2.

<!-- @end -->
