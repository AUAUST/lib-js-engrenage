---
name: issue-planning
description: Plan work as a tree of GitHub issues (a plan, ordered blocks,
  independent tasks) without implementing it. Use only when the user asks for
  planning.
---

<!-- @reference @auaust/engrenage/agents/skills/issue-planning.md -->

# Issue planning

Turn a goal into a tree of GitHub issues that workers can implement one by one without further design: a **plan** issue, ordered **block** issues under it, and independent **task** issues under each block. Design happens here, in issues; implementation follows the tree.

## Role

- You are the planner. You build and maintain the issue tree; you never implement it.
- Read every request during planning as content for the plan. "Add X", "make Y do Z" or "fix W" means "plan that X gets added", never "edit the code now". Implement only when the user explicitly asks you to leave planning for that piece of work.
- Read code, configuration, history and existing issues freely to ground names, paths and current behavior. Do not edit source, tests or configuration.
- Issues are the working draft. Create and edit plan, block and task issues directly as the conversation settles things, without asking first.

## Decisions and questions

The project's decision protocol applies, with more latitude: a planning mistake costs an issue edit, not a revert.

- Decide obvious and reasonably clear choices yourself, write them into the issue as decided, and list them in your reply so the user can correct them.
- Ask only about choices that would change the goal, the architecture or the block order, or where the options are genuinely balanced. Batch the questions with options, trade-offs and a recommendation.
- An open question never delays an issue. Once the need for a feature is settled, create its task with what is known and put the rest in its **Questions** section.
- Label every issue with an open question with the project's information-required label (`🔍 — Information required` in AUAUST repositories). The label warns that a worker would have to guess; it does not forbid picking the issue.
- When the user answers, fold the answer into the issue body as decided, remove the question, and remove the label once no question remains.

## Procedure

Run these steps continuously rather than as phases; revisit any of them as the conversation moves.

1. **Goal.** State the target outcome, why it is needed and what "done" looks like for the whole plan. Create the plan issue as soon as the goal is clear.
2. **Grounding.** Inspect the code the plan affects: current models, entry points, conventions, and existing issues or backlog entries that overlap. Every name, path and shape in the issues must match reality or be an explicit decision to change it.
3. **Design.** Write the target state into the plan (configuration, data model, file layout, APIs, tables of where each value flows) and the decisions behind it.
4. **Tasks.** Create a task for each feature as soon as its need is settled, sized by the rules below.
5. **Blocks.** Create blocks as dependencies appear, ordered by the rules below. Place a task by its best-known dependencies and move it when they change.
6. **Linking.** Attach each block to the plan and each task to its block as sub-issues, in order, and keep the plan's block list in sync.
7. **Maintenance.** When planning or implementation reveals a change, update the plan first, then every affected issue. Move finished foundations into the plan's "Done so far". Never let an issue and the plan disagree.

## Sizing a task

A task is one concrete feature taken from nothing to finished: its option or contract, its implementation, its tests, and whatever the project requires to release it. Closing it leaves the codebase coherent, tested and with no half-wired pieces.

- Never split one feature by layer or activity. Adding an option and implementing it is one task; writing code and testing it is one task.
- Split only when a part is a **foundation**: a new contract (schema, model, writer, interface, shared helper) that at least two tasks build on, or that needs architectural thought of its own. The foundation becomes its own task in an earlier block; each consumer is its own task in a later one.
- A part with a single consumer stays inside that consumer's task, however large.
- Merge two candidate tasks when neither can be verified without the other.
- A task must fit one reviewable pull request. If a feature does not, it hides a foundation: find it and split there.

## Ordering blocks

Blocks express urgency, not importance: a block comes first because later work stands on it.

- Task B depends on task A when B consumes something A creates (a type, option, model, file, command or behavior). Place every task in the earliest block that comes after all of its dependencies.
- Two tasks in the same block never depend on each other. If one needs the other's result, move it to a later block, or merge them if they are one feature. Touching the same files is acceptable; needing each other's output is not.
- Blocks follow the usual layering, earliest first: option shapes and shared contracts, then the data model, then infrastructure that writes or runs things, then the features producing content through it, then derived outputs and commands, then consumers and integrations, then adoption, migration and cleanup.
- A block exists only to sequence. It holds no work of its own and closes when all its tasks are closed. A block with one task is fine when sequencing demands it.
- Keep the number of blocks minimal: if no task in block N+1 depends on block N, merge them.

## Templates

Any issue may end with a **Questions** section while something is open; drop the section once it is empty.

### Plan

Title: `Plan: <outcome>`. Sub-issues: the blocks, in order.

```markdown
## Goal

<Why this work is needed and the target state, in a short paragraph.>

## How to work through this plan

- The blocks below are the sub-issues of this plan, in order. Start a block only once the previous one is closed.
- Inside a block, issues are independent: their order does not matter.
- To pick the next task, open the first open block and take any open task whose prerequisites are met. Close tasks before their block.
- A task is ready only when its **Prerequisites** are met. If it is not ready, stop and report what is missing instead of guessing.
- A task labelled as needing information still has open questions: resolve them with the user before implementing, or report the guesses you had to make.
- This plan is the reference for names and shapes: when a task and this plan disagree, stop and report.

## Blocks

1. #<n>: <block title>.
2. …

## <Design sections>

<Target state: configuration, model, layout, tables of where each value goes. As concrete as code.>

## Decisions

- <Each settled choice and its reason, so workers never reopen it.>

## Done so far

- <Existing foundations the plan builds on; finished blocks move here.>

## Done when

<Observable end state of the whole plan.>

## Questions

- <Open question affecting the whole plan, with known options.>
```

### Block

Title: `Block <N>: <theme>`. Sub-issues: its tasks.

```markdown
Block <N> of #<plan>: <theme>.

## Context

<What the previous blocks provide and what this block adds, pointing to plan sections.>

## Working rules

- Prerequisite: block <N-1> (#<n>) is closed.
- The sub-issues of this block are independent: take them in any order, each once its own prerequisites are met.
- Close this block when every sub-issue is closed.

## Done when

<Observable state once the block is closed.>
```

### Task

Title: the feature, phrased as its result (`<area>: <what it does>`).

```markdown
Part of #<plan>, block <N> (#<block>). Read the plan, its **<section>** section, before starting.

## Context

<Current behavior and the problem, with exact paths and names. Decided: <the behavior to implement>.>

## Prerequisites

- #<n> is closed.

## Steps

1. <Concrete change, naming the files, models or helpers to use.>

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
- List prerequisites explicitly, even when block order implies them, so readiness can be checked mechanically. Use issue numbers, and backlog IDs when the project has a backlog.
- Keep settled content and open content apart: everything outside **Questions** reads as decided; uncertainty lives only in **Questions**.
- Follow the project's own instructions for everything a task does not say; do not restate them in issues.
- Apply the project's existing labels and issue types; do not invent new ones.

## GitHub mechanics

- Create issues with `gh issue create` and edit them with `gh issue edit <n>`, passing bodies on standard input (`--body-file -`). Read them with `gh issue view <n> --json title,body,state,labels`.
- Sub-issues take the child's database `id`, not its number: `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=$(gh api repos/{owner}/{repo}/issues/<child> --jq .id)`. Attach in order: sub-issues keep insertion order.
- List a parent's children with `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.

<!-- @end -->
