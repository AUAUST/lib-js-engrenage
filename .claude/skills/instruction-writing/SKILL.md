---
name: instruction-writing
description: Turn a request about agent instructions, in whatever form it
  arrives, into the instructions it implies, grounded in current model guidance,
  and read them as each target agent would before reporting; or audit
  instructions for conflicts, gaps and misplaced rules without changing them.
  Use for every change to instructions that determine agent behavior, and for
  audits of them.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/instruction-writing.md -->

# Instruction writing

Turn a request about agent instructions into instructions that make every agent reading them produce the behavior the request implies. Read every request as a bug report, whatever its form: its cases, examples, scenarios and proposed wording show what the instructions must produce, never text to copy. `§…` names this skill's sections.

## Modes

| Brief                                                     | Mode  | Edit                                                                                                  |
| --------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| Read-only, whatever the request, or asking for an audit   | Audit | Only the agent records                                                                                |
| A change, with the user's consent and the reach it covers | Write | The instruction sources that reach covers, plus the changeset the Environment table requires for them |
| A change missing the consent or its reach                 | None  | Nothing: stop and report what is missing; never infer either                                          |

Commit nothing: whoever dispatched you reviews your diff and commits it.

## Request

- Name the behavior the request implies: the concern behind it, the outcome wanted, and the agents and situations it reaches, derived from the inventory where the request names none.
- Generalize from its cases: the rule is the narrowest statement covering every case and serving the reason the request gives. Check that each case follows from applying it, then find the cases it reaches that the request does not name.
- Readings of the request leading to different behavior, or a behavior beyond the consent's reach: ask whoever sent the request. You own the rule, its wording and placement, never a choice between behaviors.

## Process

Rank sources, bound an audit and grade findings by this method:

`.claude/skills/instruction-writing/analysis.md`

`.claude/skills/instruction-writing/request-analysis.md`

1. **Inventory.** Search every source an agent reaches on the subject: `AGENTS.md` sections, rule files, skills and their supporting files, agent files, hook and lint messages, and the fragment source each is synced from. List them by the method's Material; note the owner of each fact on the subject.
2. **Diagnose.** Over the inventory, find each catch of §Catches and each gap: a case the behavior needs that no rule covers, a rule one of two parallel sources holds and the other lacks, a term two sources define differently. Audit mode: report them and stop.
3. **Models.** Check §Model facts against the models the agent definitions and harnesses run. When it misses one of them or was checked over 90 days ago, look up those vendors' current prompting guidance for the exact versions, and refresh §Model facts where you can edit its source, otherwise report what you found. Draft only what those facts show produces the behavior.
4. **Placement.** Apply §Placement to each rule you write and to each rule the sources you edit hold on the subject.
5. **Enforcement.** Apply §Form to each rule a lint rule, type, hook or test could check.
6. **Draft.** Delete before adding: remove or merge each inventoried rule on the subject that a check enforces, another rule states, or that prevents no failure you can name, observed or in §Model facts; then add only what the behavior still lacks, each rule against a named failure. Group the rules by shape, pick each group's form under §Form, write under §Wording, resolving each step-2 finding under §Conflicts, then diff against the previous version: account for each removed rule as merged, moved or dropped on purpose.
7. **Word budget.** Run `pnpm engrenage sync`: its `word-budgets` check caps each role's words loaded at start (`AGENTS.md`, rules without `paths`, its agent file or skill) in `.engrenage/word-budgets.json`, fails past a cap and lowers each cap its role went under. End every role you touch under its cap as your change found it; raise a cap only on the user's decision, otherwise cut, or report the cuts you would need.
8. **Cold read.** For each target agent, read only what it has loaded when the rule should fire (`AGENTS.md`, its skill or agent file, the rules loaded by then, its brief) and list every catch of §Catches. Rewrite until a full cold read of the final text finds none.

## Catches

| Catch       | The text                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Ambiguity   | Holds a term, quantifier, time or scope with two readings leading to different behavior           |
| Conflict    | Holds a conflict as §Conflicts defines it, within your text or against any inventoried rule       |
| Unreached   | Loads after the moment it must act, or never for some target                                      |
| Misplaced   | Loads for agents that never act on it, against §Placement                                         |
| Overreach   | Fires in contexts it was not meant for, or words a rule so strongly that the model overapplies it |
| Unbounded   | Leaves fan-out, batching, waiting or retries without a stop where time or cost can grow           |
| Transferred | Carries a reason, limit or mode that holds for one role or mode into another where it does not    |
| Example     | Holds an example §Wording bars                                                                    |

## Placement

Put each rule with its owner, at the narrowest location every agent acting on it loads before the moment it must act:

| Agents acting on the rule                      | Location                                                 |
| ---------------------------------------------- | -------------------------------------------------------- |
| Every agent                                    | An `AGENTS.md` section                                   |
| Agents editing one surface                     | That surface's `paths` rule file, one file per surface   |
| One skill's agent, in every run                | The skill                                                |
| One skill's agent, in some modes or steps only | A supporting file of the skill, reached from those steps |
| The agents of several skills                   | A shared file, reached from each of those skills         |

- Claude Code loads a `paths` rule only when its Read tool opens a matching file, never on a Bash read or write; Codex reads one only when it follows its override's mapping. A rule an agent needs before touching such a file belongs in `AGENTS.md` or the agent's skill.
- A rule at a broader row than its acting agents' moves to their row, unless that location loads too late for one of them: weigh each such split for every rule you write or edit and the other rules of the sections you edit.
- A narrower location refines a broader one: name the source it refines and state only what changes for its scope, never restating the broader rule or contradicting it silently.
- Keep feature documentation, file inventories, API details and records of recent changes out of `AGENTS.md` and rule files.
- A `<!-- @reference <reference> -->` marker opens a block that `pnpm engrenage sync agents` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.

## Form

Refines the Writing section's structure table:

| Content                                                       | Form                                             |
| ------------------------------------------------------------- | ------------------------------------------------ |
| Rules differing only by context, with the same kind of action | Table, context column first, one row per context |
| A principle the other rules derive from                       | One or two sentences of prose, before the rules  |

- Such rules needing sentences, which the Writing section moves to a list: one `**Context.** action` item per context.
- A rule a tool could check: propose the check, keeping the rule as prose until it exists. Then keep prose only where it costs less than the failures and rework it spares agents before the check runs, as the shortest general rule, under "Enforced by tooling"; delete the rest.

## Wording

Refines the Writing section for instructions.

- Write each rule as its trigger and the behavior it must produce; cut connectives and subjects the rule's heading, column or list already states.
- Give a reason only when it changes how the rule is applied, in one clause.
- Phrase a rule so that applying it precisely produces the right outcome, without examples or the failure it prevents: no list of cases or sample ranking that illustrates a rule instead of defining it, whether in parentheses, after `such as` or `e.g.`, or in a description.
- Merge a rule into any rule sharing its trigger or its action instead of adding it alongside.
- Name each concept by one term across every source.
- Define a skill's role by what its agent does and the limits of its own scope, never by contrast with or exclusion of another role or skill. A description's trigger exclusions and naming an agent to dispatch, route or hand work to are no contrast.

## Conflicts

- A conflict is two rules prescribing different behavior for one context, or one rule stated in two places that can drift apart.
- Resolve every conflict you find, in your text or beyond it: in the same change when the consent's reach covers it, otherwise as a backlog entry you report; in audit mode, report it. Never leave one unrecorded.
- Where a conflict can recur, propose a check that fails on it.

## Model facts

Checked 2026-11-18.

| Models                 | Fact                                                                                                                    | Source           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Current Claude         | Follows instructions precisely: ask explicitly for any behavior beyond the literal task                                 | [Claude][claude] |
| Current Claude         | Generalizes a rule from its stated reason to cases it does not name                                                     | [Claude][claude] |
| Current Claude         | Overtriggers on emphasis and thoroughness prompts written for earlier models: state rules plainly, without intensifiers | [Claude][claude] |
| Current Claude         | Copies examples' patterns                                                                                               | [Claude][claude] |
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

- **Write.** Each file changed and the behavior each target agent now gets from it; each catch and gap found and how you resolved it, any you could not with why; each split made or left; each rule added or changed with the failure it prevents; words removed and added per role; proposed checks, deliberate drops, backlog entries added and facts refreshed.
- **Audit.** Each catch and gap, grouped by subject and graded by the method's Findings, with whether its fix needs a behavior decision or only wording and placement; the backlog entries they would lead to, for your caller to record; proposed checks.

<!-- @end -->
