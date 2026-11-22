---
name: implement
description: Implement one specified change (a GitHub issue, an issue draft, a
  brief or a request), designing the code that delivers the end state its
  specification states. Use only when the user invokes it or asks for a worker,
  or a skill you follow asks for one.
disable-model-invocation: true
---

<!-- @reference @auaust/engrenage/metalbrain/skills/implement.md -->

# Implementation

Implement one specified change: its specification states the end state and the contracts it fixes; you design the code delivering them.

## Specification

- **As a subagent.** Your caller's brief.
- **Invoked by the user in the main session.** The user's request.
- **Brief opening with `Issue: <owner>/<repo>#<n>`, or a request naming one GitHub issue to implement.** That issue; the rest of the brief or request adds facts and limits.
- **Brief opening with `Draft: <absolute path>`.** The local issue draft at that path, read there even outside your worktree, as the issue it will become; the rest of the brief adds facts and limits.

## Before starting

With an issue as specification, first run `pnpm engrenage planning issue check <n>`, `<n>` its number. When it fails, stop with a blocked report holding its findings and that command, to run again once they are settled.

With an issue or a draft as specification, read it, then only the ancestors and plan sections its header line names; for a draft without one, the parent listing it in `subIssues` and the sections its entry there names. Your context ends at the nearest plan above it: read any other plan only when it holds information the issue needs.

- The issue's outcome: its **Done when** and each **Tests** case.
- The plans' **Goal** and **Decisions** and the issue's **Context**: the intent and facts your design serves.
- The contracts it fixes: its own, and those of each Model section of a plan above it.

Each `Concurrent: <owner>/<repo>#<n>` line in your brief names a leaf another worker builds at the same time, sharing a Model section with yours; its work is not on your base. Read its header line, **Provides** and **Done when**; build on the shared section as stated, and deliver none of that leaf's **Done when** or **Provides**.

## Design

Everything the specification states binds you: deliver its outcome and write each test case it lists. Place and reuse code where the specification or Project structure assigns its owner; design the rest, changing only what the outcome needs. Where a code fact the specification states no longer holds, design from the code and report the difference.

## Stops

Stop as soon as you find one of these, before applying any change it concerns, and report it:

- part of the outcome, a stated structure included, or a contract the specification fixes, cannot hold as written;
- the outcome needs code no domain's purpose covers or no placement holds without architectural debt, or a new layer, namespace, role or public domain the specification does not state;
- the outcome needs a user-facing change, as the Environment table defines it, that the specification does not state;
- the outcome needs a change to a contract a Model section of a plan above the issue states, that the issue does not state;
- a defect in the code of another repository, one `pnpm engrenage link` lists, blocks the change: never work around it.

Open the report of a linked defect with `Linked defect: <short name>`, the repository's short name, then the defect, where it shows and your leads to its cause; any other with `Scope stop:`, then what cannot hold or must change, where, and the options you see.

On reaching your thoroughness level, handle what remains under Analysis › Thoroughness levels, which decides whether you finish it or stop.

- The repository your `Walk:` line names counts as linked for a linked defect.
- After a scope stop or a linked defect with a `Walk:` line in your brief, keep the work applied, revert nothing and write no stop record: the walker drops the work.

## Commits

- Commit a checkpoint under the git rules, with its checks passing, when your next steps would spread a settled step's result across many files, so you can return to it if what follows fails. Whether to commit one is your call as a programmer: checkpoints are neither one per step nor required.
- When the commit gate refuses a checkpoint for failures your changes did not cause, skip it and commit the next one.
- As a subagent, commit checkpoints on your starting branch, with `Towards #<n>` for an issue, never `Closes`, and never a `snap` commit; leave the rest of your work uncommitted for your caller.

## Finishing

- The change is done when the specification's outcome holds, with the release work the Environment table requires.
- As a subagent, your final report is one of these: a completion; a stop report, opened as §Stops or Analysis › Thoroughness levels states; otherwise a blocked report, opening with `Blocked:` and carrying a stop record (Writing › Stop records).
- Report:
  - per **Done when** clause, or for the outcome when the specification has none, the command or test showing it holds and its result, exempt from Writing › Reports' bar on commands and passing checks;
  - each deviation from the specification, with its reason; a choice §Design leaves you is no deviation;
  - each shape you fixed that other work will build on, naming each `Concurrent:` leaf it concerns;
  - each discovery that sibling work or the plan above your specification must account for.
- When resumed with a merger's findings, fix each one your issue covers, and report the rest with the reason.
- Never edit, comment on, set types or fields on, close or publish issues or drafts.

<!-- @end -->
