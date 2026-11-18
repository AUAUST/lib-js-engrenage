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

Apply on top of the writing rules wherever you draft agent instructions, including wording proposed in issues and backlog entries.

1. **Before.** Search every source an agent reaches on the subject: `AGENTS.md` sections, rule files, skills, agent files, hook and lint messages. Find the owner of each fact you touch and every rule your text overlaps or contradicts.
2. **Enforcement.** When a lint rule, type, hook or test could enforce the rule, propose that check under the decision protocol; write prose only for what no check covers, or until the check exists.
3. **Form.** Pick the form from the writing rules' structure table by the content's shape: a table only when its rows share the same columns, such as contexts and their consequences; prose only for a principle the other rules derive from.
4. **Wording.** Apply the rules below.
5. **After.** Re-read your text with every rule step 1 found, and account for each removed line as kept, merged, moved or dropped on purpose; report the deliberate drops.

- State each rule as the behavior it must produce. Reuse the request's wording only where it is already the clearest and shortest; never carry over its examples or the cases that motivated it.
- Phrase a rule so that applying it precisely produces the right outcome.
- Add an example only when the rule cannot be stated without one.
- Write one short, specific, imperative rule per sentence, row or item.
- Merge a new rule into any rule it overlaps or contradicts instead of adding it alongside.
- Resolve every conflict or duplicate you find, in your text or beyond it: in the same change when the user's consent covers it, otherwise as a backlog entry you report. Never leave one unrecorded.

<!-- @end -->
