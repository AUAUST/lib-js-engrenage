---
name: planning
description: Plan work as a tree of GitHub issues (a plan, ordered items, and
  segments grouping independent ones) without implementing it, in one pass or as
  an outer groundwork pass that inner planners deepen. Use proactively in the
  main session, or as the walker's consultant, when the user asks to plan,
  scope, break down or design work, or to create, restructure or review planned
  issues, so its questions reach the user directly.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/planning.md -->

# Planning

Turn a goal into a tree of GitHub issues that workers walk in order and implement without further design. A gap stays visible: what is not designed yet sits under **Planning** or **Questions**, never in vague **Steps**, since a worker stops on the first choice its issue leaves open.

## Role

You build and maintain the issue tree and never implement it. Create and edit issue drafts as the conversation settles things, without asking first. Read `.claude/rules/issues.md` before writing any issue.

Edit nothing but issues, instruction or context files, the backlog and the agent records, apart from code the user explicitly asked you to implement.

## Modes

| Mode       | Started by                                                                                         | Scope                               | Runs                                                                                                 | Asks through                      | Publishes                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| Single     | The user, by default                                                                               | The tree                            | The outer pass of `main-session.md` and §Inner pass on each item, together, revisiting either freely | The user                          | By the issues rule's default                                                             |
| Outer      | The user saying `outer`, `foundation` or `scaffold`, or accepting your proposal to run one         | The tree                            | `main-session.md`: its outer pass, then its inner dispatch                                           | The user                          | As single                                                                                |
| Inner      | An outer session, briefed `inner`                                                                  | The briefed item and its sub-issues | §Inner pass                                                                                          | The outer session, in your report | Each issue once ready or left with only **Questions**: a stopped planner keeps it        |
| Consultant | The walker, briefed `consultant`; `autonomous` in the brief widens your latitude (`consultant.md`) | The issues the walker sends         | `consultant.md`                                                                                      | The walker                        | Each issue once ready or left set aside: the walker needs it on GitHub before it resumes |
| Reshape    | The walker, briefed `reshape`                                                                      | The order of held issues            | `consultant.md` › Reshaping                                                                          | Nobody                            | The moves, at once                                                                       |

Started by the user, in single or outer mode: read this file first, which holds request handling, the outer pass and the inner dispatch:

`.claude/skills/planning/main-session.md`

Briefed `consultant` or `reshape`: read this file first, which holds those modes:

`.claude/skills/planning/consultant.md`

Propose outer mode when the goal spans several segments or domains: deepening every item there in one pass outgrows one context and hides the items left shallow.

## Decisions and questions

An issue edit undoes a wrong guess before any worker builds on it, so your own questions get latitude. The user's requests and answers get none: analyse each one through the plan and the code before writing it, and pause on every costly reach, however the request words it.

- Count as costly any reach that changes the plan's goal or **Decisions**, a contract several items share, or the order of issues already written.
- When pausing on a request's reach, name the issues and decisions it rewrites, and compare it with a change confined to the concern the request raises.
- Record each costly reach the user confirms in the plan's **Decisions** with the alternative it overrode.
- Investigate every question in the code, configuration, history, documentation, dependencies and issues it touches, and work out its candidate answers, before handling it below.
- Write what no open question affects without waiting for answers.

### Latitude

| Mode          | Settle yourself                                                  | Never settle                                                                        |
| ------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Single, outer | What investigation settles, or makes obvious or reasonably clear | Changes to the goal, the architecture or the tree order; genuinely balanced options |
| Inner         | The same, within your scope                                      | Also what the plan, a sibling or a shared contract owns                             |

Handle each question, after investigation:

- **Within your latitude**: decide it, write it into the issue as decided, and list it in your reply so the user can correct it.
- **Beyond it**: ask through your mode's channel, batched with your findings, options, trade-offs and a recommendation, and change neither the plan nor the code meanwhile.
- **Still open once the item's need is settled**: create the issue with what is known, the rest under **Questions** with your findings and candidate answers.
- **Answered**: fold the answer into the body as decided and remove the question.

## The tree

| Issue     | What it is                                                             | Its sub-issues                                                                                  |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `plan`    | A standalone tree's root: goal, design and decisions                   | Its sequence                                                                                    |
| `segment` | A wrapper with no work of its own, grouping items that share a context | Its members, in any order, never another segment                                                |
| `task`    | Item: positive work, one feature taken from nothing to finished        | When split, a sequence of its inner parts, at any depth; segments group unrelated prerequisites |
| `problem` | Item: negative work, something wrong to fix                            | When split, a sequence of its inner parts, at any depth; segments group unrelated prerequisites |

A sequence: the ordered sub-issues of a plan or item, each an item, a segment or a nested plan. An issue with open sub-issues is worked through them: its open sub-issues first, then its own work, then it closes.

Proposals are `idea` issues the plan relates to, never sub-issues. Before a plan or item closes, move the facts worth keeping to their owner, a `specification` or an `archive` the plan relates to.

## Splitting a task

A task covers its option or contract, implementation, tests and whatever the project requires to release it; closing it leaves the codebase coherent, tested and with no half-wired pieces. Never split it by layer or activity: adding an option and implementing it is one task, and so are writing code and testing it.

Split only for foundational change: new architecture or a new design pattern, refactoring across several domains, more work than one reviewable pull request, or more than one worker run can implement and verify at its effort. Place each extracted part by what it is:

| Extracted part                                                                                            | Becomes                                                    |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Stands on its own: a new pattern, architecture other work builds on, a change meaningful beyond this task | Its own task earlier in the tree, listed as a prerequisite |
| Only meaningful as a part of this task's result                                                           | A sub-issue, split and grouped by the same rules           |
| Cannot be verified without another candidate task                                                         | Merged with it                                             |

- Design the final shape before migrating to it, so each call site moves once.
- Split a broad pass by reach (namespace, domain) unless the change is atomic; when it is, say why.

## Nested plans

Extract a part of a plan into its own plan when the Roadmap grows too long to scan or the part is clearly distinct from the rest. Do it when obvious; otherwise propose it with the part's scope.

- A nested plan works on its own: its goal, design and decisions cover its part without reading the plans that reference it.
- Move into it every fact only its part uses; link with their gist the facts it shares with other plans.
- Other plans treat it as a task: one Roadmap entry, never expanded, with a gist stating what it contributes there.
- Like any issue, it can sit in another plan's sequence or segment, under a task as a sub-issue, or serve as a prerequisite.

## Ordering

Order expresses urgency, not importance: a task comes first because later work stands on it. The walker runs a segment's members at once and a sequence's members one at a time, so place an item after another only for a dependency you can name.

| Situation                                                                      | Placement                                                                                                      |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| B depends on A                                                                 | B after all of its dependencies                                                                                |
| B needs from A only a piece A does not use itself: a helper, a type, an option | The piece moved into B, both in one segment                                                                    |
| Later work depends on a task and nothing can run alongside it                  | Alone in the sequence; never a single-item segment                                                             |
| Two or more tasks can be done at the same point                                | One segment. Touching the same files is fine; needing each other's output is not.                              |
| A segment member needs another member's result                                 | Reshaped as above when it can be; otherwise moved after the segment, or merged with it if they are one feature |
| Adjacent segments, the later one independent of the earlier                    | Merged, to keep the sequence short                                                                             |

- Move a piece between tasks only when each stays one coherent feature, verifiable without the other.
- Never add or split an item only to run work concurrently: each item adds a dispatch, a merge and a review.

## Inner pass

Deepen an item until a worker implements it without design.

1. **Read** the item, its ancestors, the plan sections its header names, its prerequisites and its siblings' gists.
2. **Ground** each change in the code it touches: functions, types, call sites, tests and conventions. Verify every name, path and shape the item states.
3. **Write** **Steps**, **Tests** and **Done when**, splitting the item under §Splitting a task with sub-issues under it only. Remove **Planning** once settled.
4. **Review** the item under §Readiness.

As an inner planner:

- Edit only the briefed item and its sub-issues. A finding against the plan, a sibling or a shared contract goes into your report with a recommendation: the outer session owns it.
- Report the issues you published, each decision you settled, the batched questions and the plan findings.

## Readiness

An issue is ready for a worker when `pnpm engrenage planning issue check <n>` passes and, read with its ancestors as a worker reads it, it leaves no choice open:

- each **Steps** item names the files, functions, types and options it changes or uses, as they exist or as the issue decides them;
- no **Steps** item leaves open a choice other code or another issue can observe: names, signatures, placement, error behavior, order;
- **Tests** hold what the issues rule › Bodies asks of them.

Move whatever falls short under **Planning** or **Questions**, never leave it implied. Review every issue you write or deepen this way before reporting it ready; after an outer pass, report the tree grounded, not ready.

## How workers read issues

Workers implement one issue at a time under the issue-implementation skill, and the walker routes each issue by the walking skill's handling table. Read those skills only when an issue's wording depends on how it will be handled, never while drafting a plan whose design is still open.

## Writing rules

- Keep each fact in the issue that owns it: the plan for what several items share, the item for what only it needs. When a change surfaces, edit only that issue.

<!-- @end -->
