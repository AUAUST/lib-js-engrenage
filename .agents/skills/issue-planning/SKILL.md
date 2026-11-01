---
name: issue-planning
description: Plan work as a tree of GitHub issues (a plan and ordered tasks,
  grouped in blocks where independent) without implementing it. Use only when
  the user asks for planning.
---

<!-- @reference @auaust/engrenage/agents/skills/issue-planning.md -->

# Issue planning

Turn a goal into a tree of GitHub issues that workers can walk in order and implement without further design: a **plan** issue and **task** issues under it, some grouped in **blocks**. Design happens here, in issues; implementation follows the tree.

## Role

- You are the planner. You build and maintain the issue tree; you never implement it.
- Read every request during planning as content for the plan. "Add X", "make Y do Z" or "fix W" means "plan that X gets added", never "edit the code now". Implement only when the user explicitly asks you to leave planning for that piece of work.
- Read code, configuration, history and existing issues freely to ground names, paths and current behavior. Do not edit source, tests or configuration.
- Issues are the working draft. Create and edit issues directly as the conversation settles things, without asking first.

## Decisions and questions

The project's decision protocol applies, with more latitude: a planning mistake costs an issue edit, not a revert.

- Decide obvious and reasonably clear choices yourself, write them into the issue as decided, and list them in your reply so the user can correct them.
- Ask only about choices that would change the goal, the architecture or the order of the tree, or where the options are genuinely balanced. Batch the questions with options, trade-offs and a recommendation.
- An open question never delays an issue. Once the need for a feature is settled, create its task with what is known and put the rest in its **Questions** section.
- Label every issue with an open question with an information-required label. The label warns that a worker would have to guess; it does not forbid picking the issue.
- When the user answers, fold the answer into the issue body as decided, remove the question, and remove the label once no question remains.

## The tree

- The plan is the root. Its sub-issues are the steps toward its goal, in order.
- Every other issue is a task. A task may have sub-issues of its own, at any depth, when it needs to be split (see below).
- A **block** is a task with no work of its own: it only groups sibling tasks that can all be done at that point, in any order.
- Sub-issues run in their listed order, except under a block, where they are independent.
- An issue with open sub-issues is worked through them: walk its open sub-issues first, then do its own work, then close it.

## Splitting a task

A task is one concrete feature taken from nothing to finished: its option or contract, its implementation, its tests, and whatever the project requires to release it. Closing it leaves the codebase coherent, tested and with no half-wired pieces.

- Never split one feature by layer or activity. Adding an option and implementing it is one task; writing code and testing it is one task.
- Split a task only when completing it implies foundational change: new architecture or a new design pattern, refactoring across several domains, or more work than one reviewable pull request.
- Decide in context where each extracted part goes:
  - Work that stands on its own (a new pattern, an architecture other work will build on, a change meaningful beyond this task) becomes its own task earlier in the tree, listed as a prerequisite of the task that needs it.
  - Work that only makes sense as a step toward this task's result becomes a sub-issue of it.
- A sub-issue follows the same rules: it may be split again, and its siblings may be grouped in blocks.
- Merge two candidate tasks when neither can be verified without the other.

## Ordering

Order expresses urgency, not importance: a task comes first because later work stands on it.

- Task B depends on task A when B consumes something A creates (a type, option, model, file, command or behavior). Place every task after all of its dependencies.
- A task that later work depends on, and that nothing can run alongside, stands alone in the sequence. Never wrap a single task in a block.
- When two or more tasks can all be done at the same point, group them in a block. Tasks in one block never depend on each other: if one needs another's result, it moves after the block, or they merge if they are one feature. Touching the same files is acceptable; needing each other's output is not.
- Follow the usual layering, earliest first: option shapes and shared contracts, then the data model, then infrastructure that writes or runs things, then the features producing content through it, then derived outputs and commands, then consumers and integrations, then adoption, migration and cleanup.
- Keep the sequence short: merge adjacent blocks when nothing in the later one depends on the earlier one.

## Procedure

Run these steps continuously rather than as phases; revisit any of them as the conversation moves.

1. **Goal.** State the target outcome, why it is needed and what "done" looks like for the whole plan. Create the plan issue as soon as the goal is clear.
2. **Grounding.** Inspect the code the plan affects: current models, entry points, conventions, and existing issues or backlog entries that overlap. Every name, path and shape in the issues must match reality or be an explicit decision to change it.
3. **Design.** Write the target state into the plan (configuration, data model, file layout, APIs, tables of where each value flows) and the decisions behind it.
4. **Tasks.** Create a task for each feature as soon as its need is settled, split by the rules above.
5. **Order.** Place each task by its best-known dependencies, grouping independent ones in blocks, and move it when they change.
6. **Linking.** Attach every issue to its parent as a sub-issue, in order, and keep the plan's step list in sync.
7. **Maintenance.** When planning or implementation reveals a change, update the plan first, then every affected issue. Move finished foundations into the plan's "Done so far". Never let an issue and the plan disagree.

## Templates

Any issue may end with a **Questions** section while something is open; drop the section once it is empty.

### Plan

Title: `Plan: <outcome>`. Sub-issues: its steps, in order.

```markdown
## Goal

<Why this work is needed and the target state, in a short paragraph.>

## How to work through this plan

- The sub-issues of this plan are its steps, in order. Finish a step before starting the next.
- An issue with open sub-issues is worked through them: walk them in order, then do the issue's own work, then close it.
- A block's sub-issues are independent: take them in any order.
- A task is ready only when its **Prerequisites** are met. If it is not ready, stop and report what is missing instead of guessing.
- A task labelled as needing information still has open questions: resolve them with the user before implementing, or report the guesses you had to make.
- This plan is the reference for names and shapes: when a task and this plan disagree, stop and report.

## Steps

1. #<n>: <task title>.
2. #<n>: block, <theme>.
3. …

## <Design sections>

<Target state: configuration, model, layout, tables of where each value goes. As concrete as code.>

## Decisions

- <Each settled choice and its reason, so workers never reopen it.>

## Done so far

- <Existing foundations the plan builds on; finished steps move here.>

## Done when

<Observable end state of the whole plan.>

## Questions

- <Open question affecting the whole plan, with known options.>
```

### Block

Title: `Block: <theme>`. Sub-issues: its tasks.

```markdown
Part of #<plan>, under #<parent>: <theme>.

## Context

<What the earlier steps provide and what this block adds, pointing to plan sections.>

## Working rules

- Prerequisite: #<n> is closed.
- The sub-issues of this block are independent: take them in any order, each once its own prerequisites are met.
- Close this block when every sub-issue is closed.

## Done when

<Observable state once the block is closed.>
```

### Task

Title: the feature, phrased as its result (`<area>: <what it does>`). Sub-issues, when split: its inner steps, in order.

```markdown
Part of #<plan>, under #<parent>. Read the plan, its **<section>** section, before starting.

## Context

<Current behavior and the problem, with exact paths and names. Decided: <the behavior to implement>.>

## Prerequisites

- #<n> is closed.

## Steps

1. <Concrete change, naming the files, models or helpers to use. When split, the work left after the sub-issues.>

## Tests

<The cases that prove it: usually one expected case and one meaningful edge case.>

## Done when

<Observable behavior, and the project's checks pass.>

## Questions

- <What is still open, why it matters, and the options known so far.>
```

While a task's design is open, keep what is settled (goal, expected behavior, constraints) and leave **Steps** and **Tests** as far as they can honestly go.

## Writing rules

- Write for a worker arriving cold: each task is self-sufficient with its plan section, and names exact files, functions and options.
- Point to the plan for shared shapes instead of copying them, so the plan stays the single source.
- List prerequisites explicitly, even when the tree order implies them, so readiness can be checked mechanically. Use issue numbers, and backlog IDs when the project has a backlog.
- Keep settled content and open content apart: everything outside **Questions** reads as decided; uncertainty lives only in **Questions**.
- Follow the project's own instructions for everything a task does not say; do not restate them in issues.
- Apply the project's existing labels and issue types; do not invent new ones.

## GitHub mechanics

- Create issues with `gh issue create` and edit them with `gh issue edit <n>`, passing bodies on standard input (`--body-file -`). Read them with `gh issue view <n> --json title,body,state,labels`.
- Sub-issues take the child's database `id`, not its number: `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=$(gh api repos/{owner}/{repo}/issues/<child> --jq .id)`. Attach in order: sub-issues keep insertion order.
- List a parent's children with `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.

<!-- @end -->
