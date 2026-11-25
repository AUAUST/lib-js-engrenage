---
paths:
  - .ai/issues/**
---

<!-- @reference @auaust/engrenage/metalbrain/rules/issue-drafts.md -->

# Issue drafts

Applies, on top of the issues rule, to every issue you file or draft.

## Filing

- Search the target repository's issues for one on the concern, with `gh issue list --state all --search "<keywords>"`, and extend it before creating one.
- Input issue whose fix the current repository owns: write the fix into that issue rather than a new one, condensing its original report into **Context**.
- Open-issue index, under a skill loading one: write `gh issue list --state open --limit 500 --json number,title,labels,body` to a temporary file outside the repository, and keep in context only each issue's number, title, labels, parent and header gist.

| Finding                                                               | Type                                   |
| --------------------------------------------------------------------- | -------------------------------------- |
| A defect, settled fix or not                                          | `problem`, with its `defect`           |
| Positive work the request or the user accepted, that you do not apply | `task`, with its `nature`              |
| Positive work worth considering, not accepted yet                     | `idea`, with its `nature`              |
| An analysis later work draws on                                       | `resource`, `material` `report`        |
| An internal behavior or contract the project keeps track of           | `resource`, `material` `specification` |
| Outside documentation the project relies on                           | `resource`, `material` `reference`     |

| Field or part          | Set                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `complexity`           | On `task` and `problem`, by the planning sheet's option descriptions. Sets dispatch effort, never size (§Size)            |
| `priority`             | Only for work due before or after normal work                                                                             |
| `blockers` `questions` | While **Planning** or **Questions** is present; cleared once both are gone                                                |
| Labels                 | The target repository's labels whose description fits                                                                     |
| Title                  | Its subject, without prefix, in sentence case without trailing punctuation; a `task` or `problem` title states its result |

## Repository

- File each issue in the repository owning the code it changes, a `resource` in the repository acting on it. Filed outside your repository: the new issue names where you found the finding, and the issue or draft leading to it links to the new issue.
- Filing in a registered repository (planning sheet › Repositories) counts as explicit cross-repository work under Environment: no confirmation needed.
- Owner not registered, or the owner is the current repository and it has no GitHub remote: write a backlog entry naming the owner instead.

## Bodies

Items are `task` and `problem` issues. Write each issue complete, through its ancestors, for the agent the first matching row sends it to:

| Shape                                          | Agent                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Item with sub-issues and **Housekeeping**      | None: the orchestrator, the session dispatching its sub-issues, applies it once they land |
| Item with sub-issues, without **Housekeeping** | Worker, once every sub-issue is closed                                                    |
| `task`                                         | Worker                                                                                    |
| `problem` with **Fix**                         | Worker                                                                                    |
| `problem` with **Leads** or neither            | Debugger: finds the cause and the fix                                                     |
| `plan` or `segment`                            | None: its orchestrator checks its **Done when** once its sub-issues close                 |

An item states its outcome and boundaries, never the procedure: its end state's owners, patterns and structure are outcome; steps, helpers, reuse and internal shapes are procedure. Uncertainty lives only under **Planning**, **Questions** and a `problem`'s **Leads**, never in a vague **Done when**, **Fix** or **Housekeeping**.

State each decision, constraint or no-go with the concern it protects, in one clause.

| Section           | Types                         | Holds                                                                                                                                                     |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header line       | segment, item                 | Inside a tree only: `<plan sections it builds on>: <gist>`                                                                                                |
| **Compass**       | plan                          | The general outcome and why it is needed, in sentences; never as technical features, unless a structure is the outcome                                    |
| Model sections    | plan                          | Exact contracts only for surfaces items share while built concurrently, and for user-facing APIs; as tables, trees and diagrams                           |
| **Decisions**     | plan                          | Architectural decisions and constraints spanning several items; file names or layout only when they are the decision                                      |
| **Re-split log**  | plan                          | Generated by `publish` from `resplit` reasons (§Drafts): never written by hand                                                                            |
| **Context**       | segment, item                 | A segment: what it adds. An item: the problem, its cause, every site sharing it, verified code facts, decisions, rabbit holes, no-gos, naming exact paths |
| **Prerequisites** | segment, item                 | Only the issues tree order does not imply, each as `#<n>: <what this issue needs from it>` and listed in `blockedBy`                                      |
| **Provides**      | `task`                        | Only what a Model section of the nearest plan expects from the item, one line each: `<Model heading>: <what it provides>`                                 |
| **Leads**         | `problem` without **Fix**     | Facts a debugger starts from beyond what **Context** holds: symptoms, reproductions, suspected sites                                                      |
| **Fix**           | `problem` without sub-issues  | Exactly when the cause is identified and its fix decided: that fix                                                                                        |
| **Housekeeping**  | item with sub-issues          | Numbered steps left once the sub-issues land: commands to run, and edits stating their file and exact text, outside code and tests                        |
| **Done when**     | plan                          | The capabilities that must exist to serve the **Compass**, and the structure the plan settles, placement included; never other implementation             |
| **Done when**     | segment                       | What the rest of the plan requires from it, in general terms: what it blocks                                                                              |
| **Done when**     | item                          | The observable end state, serving the plan's **Done when** within its **Compass** and **Decisions**                                                       |
| **Tests**         | item without **Housekeeping** | Optional: only cases **Done when** does not imply, each with its expected outcome; a fix's regression case states its reproduction                        |
| **Planning**      | plan, segment, item           | Design not finished yet; in a write-up of several ordered changes (issues rule › Outcome), the breakdown left to design                                   |
| **Questions**     | plan, segment, item           | What investigation could not settle: the findings and the candidate answers                                                                               |

| Text                | Word cap |
| ------------------- | -------- |
| Plan **Compass**    | 110      |
| Issue **Context**   | 120      |
| Issue **Done when** | 110      |

- Other sections: as complete as the item's agent needs.
- A segment's **Done when**: never the next item's or the parent's requirement, nor a restatement of its members' facts.
- Never restate the project's instructions: agents follow them for everything an issue does not say.
- An issue you create or edit taking up a backlog entry's work: update the entry in the same run, under Backlog.

## Owners

Name in an item's **Context** the domain and role owning each capability it adds or moves, never a file, from the project maps (Project structure): the root map and each touched environment's. No purpose covers one, or it needs a new layer, namespace, role or public domain: unless the plan's **Decisions** settle it, ask the user, then record the settled structure in the plan's **Decisions**, when there is one, and the **Done when** of the issue building it.

## Size

An item is one agent's worth: as many whole outcomes as one worker run can deliver and verify within its thoroughness level (Analysis › Thoroughness levels), with no part left unused until another issue lands. An outcome: a change that, made alone, leaves the codebase coherent and delivers a behavior or contract change its **Done when** observes. Judge size by outcomes, never by counting files or words.

- **More than one agent's worth.** Split it into the fewest items, each holding whole outcomes, ordered by dependency.
- **One outcome.** Parts delivering it only together stay one item: never split by layer or activity.
- **A broad pass to split**, one change applied across several domains: split it by reach, namespace or domain, unless the change is atomic, and then say why in **Context**.
- **Nested split**, into sub-issues. The parent keeps its **Done when** unchanged; each sub-issue adds a narrower one of its own, typically as groundwork the parent's own work completes once they land.
- **Parallel split**, into a new sibling. It takes its part from the original, none in both; a part both need is a dependency, ordered as such.
- **Any split.** Each **Tests** case and decision of the original lands in exactly one item; never drop, shorten or defer a part to make an item fit: a part whose design is unsettled goes under **Planning**.
- **Any split, merge or reorder.** The plan's **Compass**, **Decisions** and **Done when** stay: changing one is a plan decision of its own.
- An item holding more than one agent's worth is never ready, dispatched or handed off as ready, whatever its `complexity` or thoroughness level.

## Drafts

Write and edit issues as local drafts in `.ai/issues/`, revised as the work and the conversation settle things. Every rule on creating and editing issues applies to the drafts until they are published.

| File             | Holds                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `<ref>.md`       | The issue as `claim` fetched it, never edited: the base `publish` merges against                            |
| `<ref>.draft.md` | The manifest as frontmatter, then the body; `<ref>` is `123`, `toolkit.123`, `new-foo` or `toolkit.new-foo` |

| Manifest key   | Holds                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`         | A type's GitHub name                                                                                                                              |
| `labels`       | Label names of the target repository                                                                                                              |
| `<field name>` | For each field pinned to the type, under its GitHub name: an option name, or a list for a multi-select field                                      |
| `subIssues`    | The children in order; in a `plan`, `{ ref, gist, sections }` entries: what the child delivers and the plan sections it builds on                 |
| `blockedBy`    | Prerequisites, as references                                                                                                                      |
| `state`        | `open`, `completed`, `not planned` or `duplicate`                                                                                                 |
| `claim`        | `existing` when another maintainer held `drafting` at claim                                                                                       |
| `resplit`      | On a claimed issue in a plan's tree whose draft drops a published child from `subIssues` or reparents the issue: why, in one line. Omit otherwise |

| Reference            | Means                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `#123`               | Issue 123 of the current repository, only in a draft of that repository                                |
| `#{toolkit.123}`     | Issue 123 of the registered `toolkit`, the current repository's included in another repository's draft |
| `#{new-foo}`         | Local draft `new-foo`                                                                                  |
| `#{toolkit.new-foo}` | Local draft created in `toolkit`                                                                       |

- Use only the types, fields, options and labels `.claude/rules/planning-sheet.md` lists, by their GitHub names: Read it before your first draft unless reading a draft loaded it.
- Start by reading `.ai/issues/`, where other sessions draft too: resume only the drafts of your task, those the user names or those of the issues you were given. Edit, check and publish only those you created, claimed or resumed.
- Read an issue from `.ai/issues/` when it holds a copy, and fetch it from GitHub only otherwise.
- Create an issue with `pnpm metalbrain planning issue create <type> [--slug <slug>] [--repo <name>] [--parent <ref> [--after <ref>]]`: it writes the manifest and body skeleton and lists the draft in its parent's `subIssues`.
- Claim an issue on its first edit with `pnpm metalbrain planning issue claim <refs>`. Claim another repository's issue as `<repo>.123`: it takes no `drafting` lock. When it records `claim: existing`, report it and keep working.
- Fill or remove every section `create` writes, to match the §Bodies shape you mean the item to take.
- Order children only through their parent's `subIssues`: `publish` attaches and orders sub-issues and renders a plan's **Roadmap**, each header's ancestor chain and the **Re-split log**, refusing a re-split without its `resplit` reason. Write none of them by hand.
- End each round with the drafts it changed and the changes waiting on each question you asked.
- Run `pnpm metalbrain planning issue check <refs>` on the drafts you changed before publishing them.
- Publish when your skill says, by default before ending each turn, holding back the drafts any question you ask in that turn, to the user or your caller, concerns; an issue's own **Questions** never delay it. Run `pnpm metalbrain planning issue publish <refs>` on every draft due in one call. With the user in the conversation, report each claimed issue's change from `git diff --no-index <ref>.md <ref>.draft.md` before publishing it; as a subagent, publish without reporting first and put the diffs `publish` prints in your next report.

<!-- @end -->
