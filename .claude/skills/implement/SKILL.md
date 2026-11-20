---
name: implement
description: Implement one specified change (a GitHub issue, an issue draft, a
  brief or a request) as its specification states, without redesigning it. Use
  only when the user invokes it or asks for a worker, or a skill you follow asks
  for one.
disable-model-invocation: true
---

<!-- @reference @auaust/engrenage/metalbrain/skills/implement.md -->

# Implementation

Implement one specified change as its specification states. The specification carries the design: you never redesign, re-scope or re-plan it.

## Specification

- **As a subagent.** Your caller's brief.
- **Invoked by the user in the main session.** The user's request.
- **Brief opening with `Issue: <owner>/<repo>#<n>`, or a request naming one GitHub issue to implement.** That issue; the rest of the brief or request adds facts and limits.
- **Brief opening with `Draft: <absolute path>`.** The local issue draft at that path, read there even outside your worktree, as the issue it will become; the rest of the brief adds facts and limits.

## Before starting

With an issue or a draft as specification, read it, then only the ancestors and plan sections its header line names; for a draft without one, the parent listing it in `subIssues` and the sections its entry there names. Your context ends at the nearest plan above it: read any other plan only when you believe it holds information the issue needs. Read a draft's `blockedBy` as its **Prerequisites** and its `subIssues` as its sub-issues. Then stop and report instead of implementing when:

| Check                                               | Stop when                                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The issue itself                                    | No **Steps**: report it needs its orchestrator for **Housekeeping**, the debugger for a report or request, the planner for work spanning several tasks. |
| **Prerequisites**                                   | One is still open.                                                                                                                                      |
| Sub-issues                                          | Some are open. Report them in order: each is worked alone before the issue's remaining work; a segment has none beyond its sub-issues.                  |
| The plan, the reference for shared names and shapes | It disagrees with the issue.                                                                                                                            |
| **Planning** or **Questions**                       | Either is present.                                                                                                                                      |
| `blockers`                                          | Any is set.                                                                                                                                             |
| Size, by `.claude/rules/issue-drafts.md` › Size     | It holds more than one agent's worth: open the report with `Scope stop:`, naming each outcome with the **Steps** and **Tests** it covers.               |

## Reading the specification

Everything in the specification binds you: follow the steps it lists in order and write the test cases it lists; never substitute your own.

- Analyse only from the specification and the code its steps touch: it settles every outcome beyond your local choices.
- Decide only local choices no other code, contract or issue can observe: local names, how a private function is split, fixture data. Stop and ask whoever started you, the user or your caller, about everything else, and leave every contract the specification does not name untouched.
- Correct an unambiguous mismatch with authoritative project rules when the correction preserves the specified behavior, contracts and scope; report the correction.
- Stop and report any other mismatch, open point, needed deviation or work the specification leaves out.
- Stop as soon as the work clearly exceeds what the specification describes, before implementing past it, whether before starting or mid-implementation. Open the report with `Scope stop:`, then give how you found the larger scope, what you found (sites, domains, counts) and the splits you see as valid.
- Stop as soon as a defect in the code of another repository, one `pnpm engrenage link` lists, blocks the change, never working around it. Open the report with `Linked defect: <short name>`, the repository's short name, then the defect, where it shows and your leads to its cause.
- For an issue, its **Steps** describe the work a scope stop measures against; the planner re-scopes the issue from your scope stop.
- The repository your `Walk:` line names counts as linked for a linked defect.
- After a scope stop or a linked defect with a `Walk:` line in your brief, keep the work already applied and revert nothing: the walker drops the work.

## Commits

- **As a subagent.** Leave your work uncommitted: your caller commits it.
- **Invoked by the user in the main session.** Commit under the git rules each coherent state the work reaches with its checks passing, not only the finished work: each commit passes the commit gate, keeping the work validated and its diff reviewable. A small change reaches one such state, committed once.

At each `Checkpoint:` line, as a subagent too, check that its expected state holds, then commit. When it cannot be reached, stop and report: the Steps do not match the code.

## Finishing

- The change is done when the specification's outcome holds, with the release work the Environment table requires.
- As a subagent, your final report is a completion or a blocked report; a blocked report carries a stop record (Writing › Stop records).
- Report whether the outcome holds, each deviation from the specification with its reason and each local choice you made.
- An issue's outcome is its **Done when**, or its **Steps** when it has none.
- A scope stop or a linked defect with a `Walk:` line in your brief carries no stop record.
- When resumed with a merger's findings, fix each one your issue covers, and report the rest with the reason.
- Never edit, comment on, set types or fields on, close or publish issues or drafts.
- Also report what the issue tree needs updated.

<!-- @end -->
