---
paths:
  - .ai/issues/**
---

<!-- @reference @auaust/engrenage/metalbrain/rules/issue-drafts.md -->

# Issue drafts

Applies, on top of the issues rule, to every issue you file or draft.

## Filing

- Search the target repository's issues for one on the concern, with `gh issue list --state all --search "<keywords>"` (`--repo` as the git and github rules set), and extend it before creating one.
- Input issue whose fix the current repository owns: write the fix into that issue, condensing its original report into **Context**, instead of filing a new one.
- Open-issue index, under a skill loading one: write `gh issue list --state open --limit 500 --json number,title,labels,body` to a temporary file outside the repository, and keep in context only each issue's number, title, labels, parent and header gist.

| Finding                                                                            | Type                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------- |
| A defect, settled fix or not                                                       | `problem`, with its `defect`           |
| Positive work the request or the user accepted, that you do not apply              | `task`, with its `nature`              |
| Positive work worth considering, not accepted yet                                  | `idea`, with its `nature`              |
| An analysis later work draws on: a study, a comparison, an audit, a recommendation | `resource`, `material` `report`        |
| An internal behavior or contract the project keeps track of                        | `resource`, `material` `specification` |
| Outside documentation the project relies on                                        | `resource`, `material` `reference`     |

| Field or part          | Set                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `complexity`           | On `task` and `problem`: `trivial` small and mechanical, `involved` needs analysis but stays contained, `complex` broad or delicate. It sets the dispatch effort |
| `priority`             | Only for work due before or after normal work                                                                                                                    |
| `blockers` `questions` | While **Planning** or **Questions** is present; cleared once both are gone. Such an issue is never dispatched: the walker routes it by its open section          |
| Labels                 | The target repository's labels whose description fits                                                                                                            |
| Title                  | Its subject, without prefix, in sentence case without trailing punctuation; a `task` or `problem` title states its result                                        |

## Repository

- File each issue in the repository owning the code it changes, a `resource` in the repository acting on it. When that repository is not the one you work in, the new issue names where you found the finding, and the issue or draft that led you to the finding links to the new issue.
- Filing in a registered repository (planning sheet › Repositories) counts as explicit cross-repository work under Environment: no confirmation needed.
- Owner not registered, or the owner is the current repository and it has no GitHub remote: write a backlog entry naming the owner instead.

## Bodies

Items are `task` and `problem` issues. Write each complete, through its ancestors, for a worker who treats everything in it as binding and applies it without redesign. Uncertainty lives only under **Planning**, design not finished, and **Questions**, what the user owes; never in vague **Steps**.

| Section           | Types               | Holds                                                                                                                                  |
| ----------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Header line       | segment, item       | Inside a tree only: `<plan sections it builds on>: <gist>`                                                                             |
| **Goal**          | plan                | Why the work is needed and the target state                                                                                            |
| Model sections    | plan                | Only the shapes at least two items use, as tables, trees and diagrams                                                                  |
| **Decisions**     | plan                | Each choice spanning several items, with its reason in one clause                                                                      |
| **Context**       | segment, item       | A segment: what it adds. An item: the problem, its cause and every site sharing it, then its own decisions, with exact paths and names |
| **Prerequisites** | segment, item       | Only the issues tree order does not imply, each as `#<n>: <what this issue needs from it>` and listed in `blockedBy`                   |
| **Steps**         | item                | Actionable changes only, naming the files, functions, models and helpers; when split, the work left after the sub-issues               |
| **Tests**         | item                | Each case with its expected outcome, within the Verification test minimum; for a fix, the regression case and its reproduction         |
| **Done when**     | plan, segment, item | Observable state beyond the **Steps**; dropped when it would only say the Steps are done and the checks pass                           |
| **Planning**      | plan, segment, item | Design not finished yet; in a write-up of several ordered changes (issues rule › Outcome), the breakdown left to design                |
| **Questions**     | plan, segment, item | What investigation could not settle: the findings and the candidate answers                                                            |

| Section       | Budget in words |
| ------------- | --------------- |
| **Goal**      | ~60             |
| **Context**   | ~80             |
| **Done when** | ~60             |

- Give the other sections no budget: make them as complete as a worker needs.
- Put a line `Checkpoint: <expected state>` between two groups of **Steps**, never after the last, only when the steps up to it leave the codebase coherent with checks passing and already change several files. State what then holds and which checks pass, never a commit message. A trivial or regular task gets none: it is committed once.
- Never restate the project's instructions: workers follow them for everything an issue does not say.
- An issue you create or edit taking up a backlog entry's work: update the entry in the same run, under `.ai/backlog/index.md`.

## Drafts

Write and edit issues as local drafts in `.ai/issues/`, revised as the work and the conversation settle things. Every rule on creating and editing issues applies to the drafts until they are published.

| File             | Holds                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `<ref>.md`       | The issue as `claim` fetched it, never edited: the base `publish` merges against                            |
| `<ref>.draft.md` | The manifest as frontmatter, then the body; `<ref>` is `123`, `toolkit.123`, `new-foo` or `toolkit.new-foo` |

| Manifest key   | Holds                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | A type's GitHub name                                                                                                              |
| `labels`       | Label names of the target repository                                                                                              |
| `<field name>` | For each field pinned to the type, under its GitHub name: an option name, or a list for a multi-select field                      |
| `subIssues`    | The children in order; in a `plan`, `{ ref, gist, sections }` entries: what the child delivers and the plan sections it builds on |
| `blockedBy`    | Prerequisites, as references                                                                                                      |
| `state`        | `open`, `completed`, `not planned` or `duplicate`                                                                                 |
| `claim`        | `existing` when another maintainer held `drafting` at claim                                                                       |

| Reference            | Means                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `#123`               | Issue 123 of the current repository, only in a draft of that repository                                |
| `#{toolkit.123}`     | Issue 123 of the registered `toolkit`, the current repository's included in another repository's draft |
| `#{new-foo}`         | Local draft `new-foo`                                                                                  |
| `#{toolkit.new-foo}` | Local draft created in `toolkit`                                                                       |

- Use only the types, fields, options and labels the planning sheet lists, by their GitHub names; it loads with the first draft you read.
- Start by reading `.ai/issues/`. Other sessions draft there too: resume only the drafts of your task, those the user names or those of the issues you were given.
- Your drafts are those you created, claimed or resumed. Edit, check and publish only them, never another session's.
- Read an issue from `.ai/issues/` when it holds a copy, and fetch it from GitHub only otherwise.
- Create an issue with `pnpm engrenage planning issue create <type> [--slug <slug>] [--repo <name>] [--parent <ref> [--after <ref>]]`: it writes the manifest with each field's options and the body skeleton, and lists the draft in its parent's `subIssues`.
- Claim an issue on its first edit with `pnpm engrenage planning issue claim <refs>`. Claim another repository's issue as `<repo>.123`: it takes no `drafting` lock. When it records `claim: existing`, another maintainer is drafting the issue: report it and keep working.
- Fill or remove every section `create` writes: `check` fails on an empty one.
- Order children only through their parent's `subIssues`: `publish` attaches and orders sub-issues, renders a plan's **Roadmap** from them and each header's ancestor chain from the tree. Write none of them by hand.
- End each round with the drafts it changed and the changes waiting on each question you asked.
- Run `pnpm engrenage planning issue check <refs>` on the drafts you changed before publishing them.
- Publish when your skill says, by default before ending each turn, holding back the drafts any question you ask in that turn, to the user or your caller, concerns; an issue's own **Questions** never delay it. Run `pnpm engrenage planning issue publish <refs>` on every draft due in one call. With the user in the conversation, report each claimed issue's change from `git diff --no-index <ref>.md <ref>.draft.md` before publishing it; as a subagent, publish without reporting first and put the diffs `publish` prints in your next report.

<!-- @end -->
