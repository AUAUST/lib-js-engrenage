---
title: Git and GitHub
description: Commit, write commit messages and write to GitHub.
---

# Git and GitHub

## Commits

Records here are uncommitted changes to `.ai/friction.md` and `.ai/discarded.md`, and files whose only uncommitted changes are debt markers.

| When                                                                    | Do                                                                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A task's work is settled: no question on it pending, its checks passing | Commit it before ending the turn, without asking                                                           |
| Only records are uncommitted                                            | Leave them uncommitted, across turns, for your next commit; commit them alone only when you send a handoff |
| A question on the work is pending                                       | Leave it uncommitted, its suggested commit message in your report, unless Writing › Stop records applies   |
| Your work covers several tasks                                          | Commit each task separately                                                                                |

- Stage by path only your changes and the records, whoever wrote them, never naming the records' staging in a commit message or report.
- A task whose work is the records themselves commits like any other.

| Message part    | Form                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject         | `<type>: <summary>`                                                                                                                               |
| Summary         | The label a reader would recall the main change by: lowercase start, no trailing period, no verb the type carries, no parts, reasons or mechanics |
| Several changes | Name what they have in common, never a list joined by "and"                                                                                       |
| Body            | Only these lines, as one paragraph: `Closes #<n>` per issue resolved, `Towards #<n>` per issue advanced                                           |

| Type      | Main purpose                                                 |
| --------- | ------------------------------------------------------------ |
| `feat`    | New feature                                                  |
| `fix`     | Bug fix                                                      |
| `imp`     | Improvement to something that exists                         |
| `cq`      | Code change that keeps behavior                              |
| `docs`    | Comments and documentation for human readers                 |
| `brain`   | Agentic programming: what steers agents and what they record |
| `css`     | Styling and layout                                           |
| `tests`   | Tests                                                        |
| `update`  | Dependency updates                                           |
| `content` | Content a CMS stores in git                                  |
| `assets`  | Images and other files the code uses, other than content     |
| `files`   | Adding, renaming or moving files and directories             |
| `snap`    | Unfinished work set aside                                    |
| `config`  | Configuration and environment files, other than agents'      |
| `debug`   | Temporary experiment, to be reverted                         |
| `meta`    | Repository matters other than code: license, CI              |

## GitHub

- Write to GitHub only in repositories owned by the AUAUST organization.
- Pass `--repo <owner>/<repo>` to a `gh` command only when it targets another repository than the current one.
- Read an issue with `gh issue view <n> --json title,body,state,labels,comments`, never plain `--comments`.
- List an issue's sub-issues in order with `gh api repos/{owner}/{repo}/issues/<n>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.
