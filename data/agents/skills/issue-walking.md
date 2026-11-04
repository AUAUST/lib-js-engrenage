---
title: Issue walking
description: Walk a planned tree of GitHub issues in order, dispatching each task to a worker, then reviewing and committing it. Use only when the user asks to walk an issue tree.
category: workflow
order: 25
invocation: explicit
---

# Issue walking

Walk an issue tree in the main session: dispatch each task to a worker, review its work, commit it and report. You own sequencing, review and commits; you design and implement nothing.

## Walking

```
walk(issue):
  closed                      → skip
  open prerequisite           → stop
  open sub-issues             → walk each in order, then its own work
  bug label                   → dispatch to a debugger
  own work (Steps)            → dispatch to a worker
  no work left (block, plan)  → closes with its last leaf
```

- Start at the issue the user names; read each sub-issue list in order.
- Count an issue as closed when GitHub says so or a local commit's message closes it.
- Stop at an open prerequisite outside what you have walked, and at a leaf with neither **Steps** nor the bug label: report it for the debugger or the planner.

## Dispatching

- Dispatch each leaf to a worker agent under the issue-implementation skill, or to a debugger agent under the debugging skill when it carries the project's bug label.
- Brief either with the issue number and repository, the header chain and the plan sections the issue names; never paste issue or plan content, which the agent reads itself.
- Dispatch with the worker's default model and low effort when the issue carries the project's low-effort label, and with its defaults otherwise.
- Send the next leaf to the same worker when it belongs to the same block and its **Steps** name the same files; start a fresh worker otherwise.

## After a debugger

| Its outcome                      | Next                                      |
| -------------------------------- | ----------------------------------------- |
| Fixed                            | Review and commit it as any leaf          |
| Written up, ready for a worker   | Dispatch the written-up issue to a worker |
| Written up for planning, Blocked | Stop and report it to the user            |

## After each leaf

1. Check the diff against the task: its **Steps**, **Tests**, **Done when**, names and paths. Send each gap back to the agent that did the work.
2. Add the `@debt` markers the diff calls for and the agent missed.
3. Run the project's checks.
4. Commit the task alone under the project's git rules, closing the issue and every block or parent it completes.
5. Report one row to the user: issue · consequences · decisions and deviations.

## Questions and tree changes

- Answer a worker's question from the plan and the ancestors when they settle it, and resume that worker.
- Batch every other question to the user with your findings and recommendation; meanwhile walk only the leaves it does not affect.
- Hand every change the tree needs (an issue edit, a new or reordered task) to the issue-planning skill in this session; never edit issues otherwise.

## Report

End at the end of the tree, an open prerequisite or a pending question, with the table of walked leaves, then what is pending or blocked and why.

## GitHub mechanics

- Read issues with `gh issue view <n> --repo <owner>/<repo> --json title,body,state,labels,comments`; plain `--comments` fails on some repositories.
- List sub-issues in order with `gh api repos/{owner}/{repo}/issues/<n>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.
- Find local closes with `git log --format=%B | grep -E '^Closes #'`.
