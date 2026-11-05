---
name: issue-planning
description: Plan work as a tree of GitHub issues (a plan and ordered tasks,
  grouped in blocks where independent) without implementing it. Use proactively
  in the main session, never as a subagent, when the user asks to plan, scope,
  break down or design work, or to create, restructure or review planned issues,
  so its questions reach the user directly.
---

<!-- @reference @auaust/engrenage/agents/skills/issue-planning.md -->

# Issue planning

Turn a goal into a tree of GitHub issues that workers walk in order and implement without further design. Design happens here, in issues; implementation follows the tree.

## Role

You are the planner: you build and maintain the issue tree and never implement it. Issues are the working draft: create and edit them as the conversation settles things, without asking first.

| Request                                                                                       | Handling                                                                                                                                                     |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Code change ("add X", "make Y do Z", "fix W")                                                 | Write it into the appropriate issue. Implement only when the user explicitly asks you to leave planning for that piece of work.                              |
| Agent instructions or project context for the current structure                               | Apply now, under the project's instruction-maintenance rules, so workers start with the correct context.                                                     |
| Instructions for a change not yet made ("once this is restructured, update the instructions") | Write into the **Steps** of the task making that change each rule's intent, constraints and target file, with proposed wording only for a one-sentence rule. |

Edit nothing but issues and instruction or context files, apart from code the user explicitly asked you to implement.

## Decisions and questions

The project's decision protocol applies with more latitude: a planning mistake costs an issue edit, not a revert.

- Investigate every question during grounding and work out its candidate answers before handling it below.
- Create and update issues without waiting for answers.

| Question, after investigation                                                               | Handling                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settled by the investigation, obvious or reasonably clear                                   | Decide it, write it into the issue as decided, and list it in your reply so the user can correct it.                                                                                                                                                                  |
| Changes the goal, the architecture or the tree order, or the options are genuinely balanced | Ask, batched with your findings, options, trade-offs and a recommendation.                                                                                                                                                                                            |
| Still open once the feature's need is settled                                               | Create the task with what is known, put the rest under **Questions** with your findings and candidate answers, and add the project's label for missing information. The label warns that the issue cannot be finished without answers; it does not forbid picking it. |
| Answered                                                                                    | Fold the answer into the body as decided, remove the question, and remove the label once no question remains.                                                                                                                                                         |

## The tree

| Issue | What it is                                                                           | Its sub-issues                                     | Title                                |
| ----- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------ |
| Plan  | A standalone tree's root: goal, design and decisions                                 | Its steps, in order                                | `Plan: <outcome>`                    |
| Task  | One feature taken from nothing to finished                                           | When split, its inner steps in order, at any depth | Its result: `<area>: <what it does>` |
| Block | A task with no work of its own, grouping siblings that can all be done at that point | Independent, in any order                          | `Block: <theme>`                     |

An issue with open sub-issues is worked through them: its open sub-issues first, then its own work, then it closes.

## Splitting a task

A task covers its option or contract, implementation, tests and whatever the project requires to release it; closing it leaves the codebase coherent, tested and with no half-wired pieces. Never split it by layer or activity: adding an option and implementing it is one task, and so are writing code and testing it.

Split only for foundational change: new architecture or a new design pattern, refactoring across several domains, or more work than one reviewable pull request. Place each extracted part by what it is:

| Extracted part                                                                                            | Becomes                                                    |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Stands on its own: a new pattern, architecture other work builds on, a change meaningful beyond this task | Its own task earlier in the tree, listed as a prerequisite |
| Only meaningful as a step toward this task's result                                                       | A sub-issue, split and grouped by the same rules           |
| Cannot be verified without another candidate task                                                         | Merged with it                                             |

## Nested plans

Extract a part of a plan into its own plan when the Map grows too long to scan or the part is clearly distinct from the rest. Do it when obvious; otherwise propose it with the part's scope.

- A nested plan works on its own: its goal, design and decisions cover its part without reading the plans that reference it.
- Move into it every fact only its part uses; link with their gist the facts it shares with other plans.
- Other plans treat it as a task: one Map step, never expanded, with a gist stating what it contributes there.
- Like any issue, it can be a step or block member of another plan, a sub-issue of a task or a prerequisite.

## Ordering

Order expresses urgency, not importance: a task comes first because later work stands on it. Task B depends on task A when B consumes something A creates (a type, option, model, file, command or behavior).

| Situation                                                     | Placement                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| B depends on A                                                | B after all of its dependencies                                                 |
| Later work depends on a task and nothing can run alongside it | Alone in the sequence; never a single-task block                                |
| Two or more tasks can be done at the same point               | One block. Touching the same files is fine; needing each other's output is not. |
| A block member needs another member's result                  | Moved after the block, or merged with it if they are one feature                |
| Adjacent blocks, the later one independent of the earlier     | Merged, to keep the sequence short                                              |

Usual layering, earliest first: option shapes and shared contracts → data model → infrastructure that writes or runs things → features producing content through it → derived outputs and commands → consumers and integrations → adoption, migration and cleanup.

## How workers read issues

Workers implement one issue at a time under the issue-implementation skill, once its prerequisites are closed and its sub-issues are done, reading its ancestors only up to the nearest plan. They apply everything outside **Questions** as decided, stop when the issue disagrees with the plan, and report what the tree needs updated instead of editing issues.

## Procedure

Run these continuously rather than as phases, revisiting any of them as the conversation moves.

1. **Goal.** State the target outcome, why it is needed and what "done" means for the whole plan. Create the plan issue as soon as the goal is clear.
2. **Grounding.** Inspect the affected code (models, entry points, conventions), overlapping issues and backlog entries, and the code, configuration, history, documentation and dependencies each open question touches. Every name, path and shape in the issues matches reality or is an explicit decision to change it.
3. **Design.** Write the model and decisions several tasks share into the plan, and those one task needs into that task.
4. **Tasks.** Create, split, order and link each task as soon as its need is settled, keeping the plan's **Map** in sync.
5. **Maintenance.** When planning or implementation reveals a change, edit only the issue that owns the changed fact.

## Templates

Any issue may end with a **Questions** section while something is open: the only place uncertainty lives. Drop it once empty.

### Plan

```markdown
## Goal

<Why this work is needed and the target state, in at most three lines.>

## Map

1. #<n>: <what the task delivers> · [<section>](#<section-anchor>)
2. #<n>: <what the block delivers> · <section>
   - #<n>
   - #<n>
3. #<n>: <what the nested plan contributes to this plan>

## <Model sections>

<Only the shapes at least two tasks use, as tables, trees and diagrams.>

## Decisions

- <Each choice spanning several tasks, with its reason in one clause.>

## Done when

<Observable end state of the whole plan.>

## Questions

- <What investigation could not settle for the whole plan: the findings and the candidate answers.>
```

### Block

```markdown
#<plan> › … › #<parent> · <section>: <gist>

## Context

<What this block adds, in at most three lines.>

## Prerequisites

- #<n>: <what this block needs from it>.

## Done when

<Observable state once the block is closed.>
```

### Task

```markdown
#<plan> › … › #<parent> · <section>: <gist>

## Context

<The problem, then what is decided for this task only, in at most three lines with exact paths and names.>

## Prerequisites

- #<n>: <what this task needs from it>.

## Steps

1. <Concrete change, naming the files, models or helpers to use. When split, the work left after the sub-issues.>

## Tests

<The cases that prove it: usually one expected case and one meaningful edge case.>

## Done when

<Observable behavior beyond the Steps.>

## Questions

- <What investigation could not settle: the findings and the candidate answers.>
```

In the **Map**, give each step its gist and the plan sections it builds on, linking each section that is a heading of the plan. List a block's members under it as bare references, with no gist or section to keep in sync.

The header lists every ancestor from the nearest plan down to the parent, then the plan sections the issue builds on. A plan has no header. Drop **Prerequisites** when tree order implies them all, and **Done when** when it would only say the Steps are done and the checks pass.

While a task's design is open, keep what is settled (goal, expected behavior, constraints) and take **Steps** and **Tests** as far as they can honestly go.

## Writing rules

- Make each task complete through its ancestors: read with them, it names exact files, functions and options and leaves nothing to design.
- Keep each fact in the issue that owns it: the plan for what several tasks share, the task for what only it needs.
- List under **Prerequisites** only the issues tree order does not imply, never as GitHub "blocked by" relationships, which `gh` cannot set. Turn any backlog entry a task depends on into an issue first.
- Once an issue you create or edit tracks the work of an entry in the backlog or the debt backlog, remove the entry in the same run, or reduce it to the work the issue leaves and link the issue from it.
- Never restate the project's instructions in issues; workers follow them for everything a task does not say.
- Apply the project's existing labels and issue types; never invent new ones.

## GitHub mechanics

- Create issues with `gh issue create` and edit them with `gh issue edit <n>`, passing bodies on standard input (`--body-file -`). Read them with `gh issue view <n> --repo <owner>/<repo> --json title,body,state,labels,comments`; plain `--comments` fails on some repositories.
- Sub-issues take the child's database `id`, not its number, and keep insertion order, so attach them in order: `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=$(gh api repos/{owner}/{repo}/issues/<child> --jq .id)`.
- List a parent's children with `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.

<!-- @end -->
