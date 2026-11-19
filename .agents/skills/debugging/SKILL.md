---
name: debugging
description: Investigate a problem, fix it at its root when the fix is
  contained, and otherwise write the fix up as an issue or backlog entry. Use
  only when a skill you follow or the user asks for a debugger.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/debugging.md -->

# Debugging

Understand a problem, decide its fix, then apply it or write it up. A fix is done when it is sound, not when the reported symptom disappears.

Read `.claude/rules/issues.md` before deciding the outcome or writing anything up.

## Input

| Given                                                  | Read first                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| A GitHub issue                                         | Its body, comments, linked issues and ancestors up to the nearest plan |
| A backlog entry                                        | The entry and the entries closely related to it                        |
| A `@debt` marker                                       | The marked code and its callers                                        |
| A direct report: an error, a failing check, a behavior | The reported output, then reproduce it yourself                        |
| A merger's findings                                    | Each finding's cited code                                              |

## Diagnosis

1. **Reproduce.** Show the behavior with a failing test, command or minimal case, or a merger's finding in its cited code. When it cannot be shown, report what you tried instead of fixing on a guess.
2. **Cause.** Follow the execution path to where behavior first departs from its contract. The site of the symptom is not the cause.
3. **Sites.** Find every other site sharing the cause: the same assumption, pattern or caller. Fix the class of bug, not the reported instance.
4. **Contract.** Take the expected behavior from authoritative sources: types, schemas, documentation, tests and recorded decisions. When the expected behavior is itself undecided, it is a question, not a choice for you.

## A sound fix

- Corrects the cause at its owner, at every site sharing it, with no special case for the reported input.
- Makes the violated invariant explicit, through types, validation or a clear failure, so the same class of bug cannot return silently.
- Adds a regression test that fails before the fix and passes after it, counting towards the Verification test minimum (the fewest tests giving confidence).
- Weakens no check and adds no assumption on code outside it. Mark whatever still falls short with debt markers.

## Debt

Mark the debt you notice while diagnosing, on the execution path, its callers and every site sharing the cause, whether you fix, write up or are blocked.

## Outcome

Decide it by the issues rule › Outcome, and record any write-up under that rule: fixing every site that shares the cause stays within your input; a merger's improvement finding is accepted work. With a `Walk:` line in your brief, read `.claude/rules/issue-drafts.md` › Walks: it refines your outcome, where your issues go and your commits.

## Questions and answers

- Ask under the project's decision protocol, batched, with the diagnosis so far.
- Weigh each answer against your diagnosis as well as under the decision protocol, and report its consequences: sites affected, behavior changed, risks, conflicts with earlier answers or decisions.

## Finishing

- When resumed with a merger's findings, fix each one your input covers, and report the rest with the reason.
- After a fix, remove the backlog entries and debt markers it resolves. Never close an issue you fixed: merging the fix closes it.
- Report by outcome:

  | Outcome    | Report                                                                                     |
  | ---------- | ------------------------------------------------------------------------------------------ |
  | Fixed      | The cause, the sites the fix covers, the invariant now enforced, and the debt markers left |
  | Written up | The issue URL or backlog entry ID, ready to implement or needing planning                  |
  | Blocked    | A stop record (Writing › Stop records) and the batched questions                           |

- Commit under the git rules.

<!-- @end -->
