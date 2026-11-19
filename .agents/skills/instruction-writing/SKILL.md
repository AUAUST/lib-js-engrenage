---
name: instruction-writing
description: Turn a behavior change the user consented to into agent
  instructions, grounded in current model guidance, and read them as each target
  agent would before reporting. Use for every change to instructions that
  determine agent behavior.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/instruction-writing.md -->

# Instruction writing

Turn a decided behavior into instructions that make every agent reading them produce it. You own the wording and its placement, never the behavior: a gap in the decision is a question for whoever dispatched you.

## Brief

- Missing the decided behavior, or the user's consent and the reach it covers: stop and report; never infer either.
- Missing the target agents and situations: derive them from the inventory.
- Proposed wording: a candidate under `instructions.md` › Wording, never binding.

## Process

1. **Rules.** Read `.claude/rules/instructions.md`: its Form, Wording and Conflicts bind every line you write.
2. **Inventory.** Search every source an agent reaches on the subject: `AGENTS.md` sections, rule files, skills, agent files, hook and lint messages. Note the owner of each fact you touch and every rule your text overlaps or contradicts.
3. **Enforcement.** Apply `instructions.md` › Form to each rule a lint rule, type, hook or test could check, and list the proposed checks in your report.
4. **Models.** Check §Model facts against the models the agent definitions and harnesses run. When it misses one of them or was checked over 90 days ago, look up those vendors' current prompting guidance for the exact versions, and refresh §Model facts where you can edit its source, otherwise report what you found. Draft only what those facts show produces the behavior.
5. **Placement.** Put each rule with its owner, where every target agent has it loaded before the moment it must act. Claude Code loads a `paths` rule only when its Read tool opens a matching file, never on a Bash read or write; Codex reads one only when it follows its override's mapping. A rule an agent needs before touching such a file belongs in `AGENTS.md` or the agent's skill.
6. **Draft.** Group the rules by shape, pick each group's form, write, then diff against the previous version: account for each removed rule as kept, merged, moved or dropped on purpose.
7. **Cold read.** For each target agent, read only what it has loaded when the rule should fire (`AGENTS.md`, its skill or agent file, the rules loaded by then, its brief) and list every catch below. Rewrite until a full cold read of the final text finds none.

| Catch       | The text                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Ambiguity   | Holds a term, quantifier, time or scope with two readings leading to different behavior                        |
| Conflict    | Holds a conflict as `instructions.md` › Conflicts defines it, within your text or against any inventoried rule |
| Unreached   | Loads after the moment it must act, or never for some target                                                   |
| Overreach   | Fires in contexts it was not meant for, or words a rule so strongly that the model overapplies it              |
| Unbounded   | Leaves fan-out, batching, waiting or retries without a stop where time or cost can grow                        |
| Transferred | Carries a reason, limit or mode that holds for one role or mode into another where it does not                 |

## Scope

- Edit only the instruction sources the consent covers, plus the changeset the Environment table requires for them; record conflicts beyond those sources under `instructions.md` › Conflicts.
- Commit nothing: whoever dispatched you reviews your diff and commits it.

## Model facts

Checked 2026-11-18.

| Models                 | Fact                                                                                                                    | Source           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Current Claude         | Follows instructions precisely: ask explicitly for any behavior beyond the literal task                                 | [Claude][claude] |
| Current Claude         | Generalizes a rule from its stated reason to cases it does not name                                                     | [Claude][claude] |
| Current Claude         | Overtriggers on emphasis and thoroughness prompts written for earlier models: state rules plainly, without intensifiers | [Claude][claude] |
| Current Claude         | Copies examples' patterns: when one is unavoidable, give several varied ones, marked apart from the rules               | [Claude][claude] |
| Claude Opus 5, 5.5     | Delegates to subagents readily: state when delegation is and is not warranted                                           | [Claude][claude] |
| Claude Opus 5.5        | Thinking depth follows the agent's effort setting more reliably than prompt instructions to think more or less          | [Opus 5.5][opus] |
| Claude Opus 5.5        | Follows instructions that name the specific behaviors to avoid, and the stops wanted and unwanted, over general ones    | [Opus 5.5][opus] |
| GPT-5 and later, Codex | Struggles with vague or conflicting instructions in `AGENTS.md`                                                         | [GPT-5][gpt5]    |
| Codex                  | A short, accurate `AGENTS.md` beats a long, vague one: task detail goes into referenced files; the closest file wins    | [Codex][codex]   |

[claude]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
[opus]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
[gpt5]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide.md
[codex]: https://learn.chatgpt.com/guides/best-practices.md

## Report

- Each file changed, and the behavior each target agent now gets from it.
- Each catch the cold read found and how you resolved it; any you could not, with why.
- Proposed checks, deliberate drops, backlog entries added and facts refreshed.

<!-- @end -->
