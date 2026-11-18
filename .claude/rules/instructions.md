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

- Apply these rules, on top of the writing rules, wherever you draft agent instructions, including wording proposed in issues and backlog entries.
- State each rule as the behavior it must produce. Reuse the request's wording only where it is already the clearest and shortest; never carry over its examples.
- Phrase a rule so that applying it precisely produces the right outcome; never list the cases that motivated it.
- Add an example only when the rule cannot be stated without one.
- Write one short, specific, imperative rule per sentence.
- Merge a new rule into any rule it overlaps or contradicts instead of adding it alongside.

<!-- @end -->
