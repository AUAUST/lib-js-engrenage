---
title: Issue walking
description: Walk a planned tree of GitHub issues in order, dispatching each leaf to a worker or debugger, then reviewing and committing it. Use only when the user asks to walk an issue tree.
category: workflow
order: 25
invocation: explicit
---

# Issue walking

Walk an issue tree in the main session: route each issue by the handling table, review each leaf's diff, commit it and report. You own sequencing, routing, review and commits; you design and implement nothing.

## Handling table

Start at the issue the user names and read each sub-issue list in order. Handle each issue by the first matching row; the Complexity row applies on top of the row that dispatches.

| Issue                                                                      | Walker                                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Closed, or closed by a local commit                                        | Skip                                                                                                          |
| A Plan other than the one walked                                           | Stop: walked on its own                                                                                       |
| Open sub-issues                                                            | Walk them in order (a Segment's in any order), then its own work                                              |
| Plan or Segment with no open sub-issue                                     | Closes with its last leaf's commit                                                                            |
| Blockers `Drafting`, with `.ai/issues/<n>.draft.md` present                | Stop: it is being planned                                                                                     |
| Blockers `Drafting`, with no local draft                                   | Ask the user whether to clear the claim and walk it; on yes, remove `Drafting` and handle it by the next rows |
| Any Blockers, or an open blocked-by issue                                  | Stop and report                                                                                               |
| Fails `engrenage issues check` for **Planning**, **Outdated** or structure | Stop; send it to the consultant                                                                               |
| Fails for **Questions**                                                    | Stop; batch the questions to the user                                                                         |
| Problem without **Steps**                                                  | Debugger                                                                                                      |
| Task or Problem with **Steps**                                             | Worker                                                                                                        |
| Complexity `Complex` or `Trivial`                                          | Dispatched with `effort: high` (Complex) or `effort: low` (Trivial); otherwise the agent's defaults           |
| Resource or Idea in a tree                                                 | Never dispatched; report it to the consultant                                                                 |

Priority never reorders a tree: order states dependencies.

## Dispatching

- Dispatch every leaf to a new agent: a worker under the issue-implementation skill, a debugger under the debugging skill.
- Resume an agent only to answer its question or to send back review gaps and gate failures.
- Brief with `Issue: <owner>/<repo>#<n>` as the first line, which the dispatch hook checks, then the header chain and the plan sections the issue names. Never paste issue or plan content: the agent reads it itself.

## After a debugger

| Its outcome                      | Next                                      |
| -------------------------------- | ----------------------------------------- |
| Fixed                            | Review and commit it as any leaf          |
| Written up, ready for a worker   | Dispatch the written-up issue to a worker |
| Written up for planning, Blocked | Stop and report it to the user            |

## After each leaf

1. Review only the diff against the issue's **Steps**, **Tests** and names; read no code beyond it. Send each gap back to the agent that did the work.
2. Add the `@debt` markers the diff calls for and the agent missed.
3. Commit under the project's git rules, closing the issue and every segment or parent it completes. Do not run the checks: the commit gate runs them. When it fails, send its output to the worker.
4. Report one row to the user: issue · consequences · decisions and deviations.

## Checkpoints

A worker commits at each `Checkpoint:` line of its issue; your final commit closes the issue.

- Review the commits from the dispatch base to `HEAD` one by one, then the uncommitted rest.
- Fix a gap in a new commit, never by rewriting a checkpoint.
- Read the worker's commit messages as a soft hint of how it read its Steps: compare them with the diff, never infer anything from them.

## Consultant

- Start the `planner` subagent on first need with the plan number, and resume the same agent through the client’s messaging or resume tool.
- Call it only when a worker stops, reports a deviation, or an issue fits no row of the handling table; answer nothing from code yourself.
- Batch what it sends back to the user with its findings and recommendations; meanwhile walk only the leaves it does not affect.

## Report

End at the end of the tree or at a stop, with the table of walked leaves, then what is pending or blocked and why.

## GitHub mechanics

- Read issues with `gh issue view <n> --repo <owner>/<repo> --json title,body,state,labels,comments`; plain `--comments` fails on some repositories.
- List sub-issues in order with `gh api repos/{owner}/{repo}/issues/<n>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.
- Remove `Drafting` by clearing Blockers with `gh api -X DELETE repos/{owner}/{repo}/issues/<n>/issue-field-values/<id>`, then posting its other values, if any, with `gh api -X POST repos/{owner}/{repo}/issues/<n>/issue-field-values --input -` and `{"issue_field_values":[{"field_id":<id>,"value":["<option>"]}]}` on standard input; the field id comes from `gh api orgs/{org}/issue-fields`.
- Find local closes with `git log --format=%B | grep -E '^Closes #'`.
