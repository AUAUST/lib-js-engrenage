<!-- @reference @auaust/engrenage/metalbrain/rules/git.md -->

# Git and GitHub

## Commits

| When                                                                    | Do                                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A task's work is settled: no question on it pending, its checks passing | Commit it before ending the turn, without asking                                                                         |
| Only records are uncommitted                                            | Leave them for your next commit, across turns; commit them alone only at a flush                                         |
| A question on the work is pending                                       | Leave it uncommitted, with the suggested commit message in your report, unless Writing › Stop records applies            |
| Your work covers several tasks                                          | One commit per task                                                                                                      |
| An issue marks a checkpoint                                             | Commit at it                                                                                                             |
| Staging                                                                 | Only your changes and the records, whoever wrote them, by path, never `.ai/issues/` or `.ai/handoffs/`, which stay local |
| Any commit                                                              | Never push                                                                                                               |

- **Records.** Uncommitted changes to `.ai/friction.md` and `.ai/discarded.md`, files whose only uncommitted changes are debt markers, and backlog entries written beside a task. Never name their staging in a commit message or report. A records operation, a task whose work is the records themselves, curation or a user request to record or edit them, is a task like any other.
- **Flush.** One `brain` commit of the records alone, when nothing else is left to commit, once one holds: the records add or change five or more backlog entries; a handoff or stop record you are about to write; a segment, plan or walk your skill closes; the user signalling the session ends, by wrapping up, asking for a summary or handoff, or saying they are done; a context or usage limit warning. Records left in a checkout when a session ends without a flush ride in the next session's first commit.

| Message part    | Form                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject         | `<type>: <summary>`, `<type>` from the table below by the commit's main purpose                                                                   |
| Summary         | The label a reader would recall the main change by: lowercase start, no trailing period, no verb the type carries, no parts, reasons or mechanics |
| Several changes | Name what they have in common, never a list joined by "and"                                                                                       |
| Body            | Only consecutive lines: `Closes #<n>` per issue resolved, `Towards #<n>` per issue advanced                                                       |

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
| `snap`    | Checkpoint of unfinished work                                |
| `config`  | Configuration and environment files, other than agents'      |
| `debug`   | Temporary experiment, to be reverted                         |
| `meta`    | Repository matters other than code: license, CI              |

## GitHub

- Write to GitHub only in repositories owned by the AUAUST organization.
- Pass `--repo <owner>/<repo>` to a `gh` command only when it targets another repository than the current one.
- Read an issue with `gh issue view <n> --json title,body,state,labels,comments`; plain `--comments` fails on some repositories.
- List an issue's sub-issues in order with `gh api repos/{owner}/{repo}/issues/<n>/sub_issues --jq '.[] | "\(.number) \(.state) \(.title)"'`.

<!-- @end -->
