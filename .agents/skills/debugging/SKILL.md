---
name: debugging
description: Investigate a problem, fix it at its root when the fix is
  contained, and otherwise write the fix into a GitHub issue for a worker. Use
  only when a skill you follow or the user asks for a debugger.
---

<!-- @reference @auaust/engrenage/agents/skills/debugging.md -->

# Debugging

Understand a problem, decide its fix, then apply it or write it down for a worker. A fix is done when it is sound, not when the reported symptom disappears.

Read `.claude/rules/issues.md` before deciding the outcome or writing any issue.

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
- Adds a regression test that fails before the fix and passes after it, and the edge case the cause suggests.
- Weakens no check and adds no assumption on code outside it. Mark whatever still falls short with debt markers.

## Debt

Mark the debt you notice while diagnosing, on the execution path, its callers and every site sharing the cause, whether you fix, write up or are blocked.

## Outcome

Decide it by the issues rule › Outcome: fixing every site that shares the cause stays within your input. With a `Leaf:` line in your brief, write the defect up, never fix it: the walker routes it before the leaf.

## Questions and answers

- Ask under the project's decision protocol, batched, with the diagnosis so far.
- Weigh each answer against your diagnosis as well as under the decision protocol, and report its consequences: sites affected, behavior changed, risks, conflicts with earlier answers or decisions.

## Writing the issue

- When the input is an issue whose fix the current repository owns, turn that issue into the task, condensing its original report into **Context**. Otherwise draft a new one under the issues rule.
- Type it by the issues rule › Filing; a merger's improvement finding is accepted work, a `task`.
- With a `Walk:` line, create each new issue by the first matching case:
  - **A `Leaf:` line in your brief, the defect owned by the current repository or a registered one.** A `problem` in the repository owning the defect, `--parent <the Leaf: issue>`, adding `--repo <short name>` when it is not the current repository.
  - **The current repository.** In the walked tree, `--parent <its parent> --after <it>`, right after your input issue or, for a merger's findings, the segment or nested plan your brief names; with neither, last under the walked issue.
  - **Another repository with a linked checkout, one `pnpm engrenage link` lists.** A `problem`, `--repo <short name> --parent <your input issue>`; never fix it in that checkout: the walker routes the `problem` there.
  - **Any other.** Under the issues rule › Repository.

## Finishing

- When resumed with a merger's findings, fix each one your input covers, and report the rest with the reason.
- After a fix, remove the backlog entries and debt markers it resolves. Never close an issue you fixed: merging the fix closes it.
- Report by outcome:

  | Outcome    | Report                                                                                     |
  | ---------- | ------------------------------------------------------------------------------------------ |
  | Fixed      | The cause, the sites the fix covers, the invariant now enforced, and the debt markers left |
  | Written up | The issue URL, ready for a worker or needing planning                                      |
  | Blocked    | A stop record (Writing › Stop records) and the batched questions                           |

- With a `Walk:` line in your brief, commit nothing, since the walker commits your work. Without one, commit under the git rules.

<!-- @end -->
