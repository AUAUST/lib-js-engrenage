---
name: issue-implementation
description: Implement one GitHub issue from a planned issue tree as written,
  without redesigning it. Use only when a skill you follow or the user asks for
  a worker.
---

<!-- @reference @auaust/engrenage/agents/skills/issue-implementation.md -->

# Issue implementation

Implement one GitHub issue as written. The issue and its plan carry the design: you never redesign, re-scope or re-plan it.

## Before starting

When dispatched in a worktree, first check out the briefed commit, detached, when the worktree starts elsewhere, then install dependencies offline from the lockfile, with output reduced to errors.

Read the issue, then only the ancestors and plan sections its header line names. Your context ends at the nearest plan above the issue: read any other plan only when you believe it holds information the issue needs. Then stop and report instead of implementing when:

| Check                                               | Stop when                                                                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The issue itself                                    | It has no **Steps**: it is a report or a request, not a planned task. Report that it needs the debugger, or the planner when the work spans several tasks. |
| **Prerequisites**                                   | One is still open.                                                                                                                                         |
| Sub-issues                                          | Some are open. Report them in order: each is worked on its own before the issue's remaining work, and a segment has no work beyond its sub-issues.         |
| The plan, the reference for shared names and shapes | It disagrees with the issue.                                                                                                                               |
| **Planning** or **Questions**                       | Either is present.                                                                                                                                         |
| `blockers`                                          | Any is set.                                                                                                                                                |

## Reading the issue

Everything in the issue binds you: follow the **Steps** in order and write the listed test cases; never substitute your own.

- Analyse only from the issue and the code its **Steps** touch: the issue settles every outcome beyond your local choices.
- Decide only local choices no other code, contract or issue can observe: local names, how a private function is split, fixture data.
- Correct an unambiguous mismatch with authoritative project rules when the correction preserves planned behavior, contracts and scope; report the correction.
- Stop and report any other mismatch, open section, needed deviation or work belonging to another issue.
- Stop as soon as the work clearly exceeds what the **Steps** and the issue's `complexity` describe, before implementing past the **Steps**, whether before starting or mid-implementation. Keep the **Steps** already applied and revert nothing: the walker drops the work. Open the report with `Scope stop:`, then give the planner, which re-scopes the issue from it, how you found the larger scope, what you found (sites, domains, counts) and the splits you see as valid.

## Commits

- At each `Checkpoint:` line, check that its expected state holds, then commit. When it cannot be reached, stop and report: the Steps do not match the code.
- With a `Walk:` line in your brief, create no commit but the `Checkpoint:` ones: the walker makes the closing commit. Without one, also commit your settled work under the git rules.

## Finishing

- The issue is done when its **Done when** holds, or its **Steps** are done when it has none, with the release work the Environment table requires.
- Send no message before your final report, your only message: a completion or a blocker, sent once every command you started has finished and, when you changed files, the worktree gate passes, so the stop gate reuses that pass. A blocker other than a scope stop carries a stop record (Writing › Stop records).
- The worker/debugger stop gate returns failing commands and output to the stopped agent: fix them and stop again. When you must stop with failures (a usage limit mid-refactor, a scope stop mid-implementation), list them in your report and stop again on that unchanged tree.
- When resumed with a merger's findings, fix each one your issue's scope covers, and report the rest with the reason.
- Never edit, comment on, set types or fields on, or close issues.
- Report whether **Done when** holds, each deviation from the issue with its reason, each local choice you made, and what the issue tree needs updated.
- Write each item once and in one line, since the walker keeps dozens of reports in its context: never a second copy under another part, which refers to it instead, nor the commands you ran, the checks that passed or commit hashes, which the gate and git record. Name each file repo-relative, in each item about it: no closing list of files, even where your harness asks for absolute paths.

<!-- @end -->
