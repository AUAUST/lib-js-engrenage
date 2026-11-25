---
title: Curation
description: Turn the scratchpad, `@debt` markers, code clones and agent logs into backlog entries, filing the ready ones as issues where GitHub planning is on. Use when the user asks to triage the scratchpad, harvest debt markers or agent logs, or update, settle or file backlog entries.
---

# Curation

Turn the scratchpad, `@debt` markers, code clones and agent logs into backlog entries, in the main session: analysers read, match and investigate (§Analysers); you decide and write.

Read `.claude/rules/issues.md` before writing anything up. Your findings become backlog entries.

<!-- @extension tools/github/issues/planning -->

- Only stage 6's ready entries become issues, as drafts, where the git rule allows GitHub writes.
- Stage 0 also reads `.ai/issues/` and loads the open-issue index as `.claude/rules/issue-drafts.md` › Filing states: the issues in a temporary file, only an index in context. Every analyser brief names that file.
- Stages 1, 2 and 4 check the open issues as well as the entries: an open issue covering a note or group counts as covering it.
- Stage 3.2 extends the issue tracking a recurring subject, when one exists, instead of creating an entry.
- The triage brief adds stage 5's search.

<!-- @end -->

- Run in the main checkout, one run at a time.
- Where an entry or a note needs more than recording (choosing between options, designing a change, breaking it into coordinated steps, implementing it), leave that part in the entry and report it.

## Scope

| Target           | Allowed                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Backlog and logs | Backlog entries and categories, and agent-log entries, through their commands; `.ai/scratchpad.md` |
| Code             | Only new `@debt` markers: existing ones stay until their fix lands, as its list of sites           |
| Other local file | A configuration value or trivial edit a note explicitly asks for; anything larger becomes an entry |
| GitHub           | A comment, pull request, label, push or message a note asks for: an entry                          |

## Analysers

Dispatch each as an `analyser` briefed read-only, in the main checkout and in the background; dispatch no other agent. Without an `analyser` agent, run its part of the stages yourself. Beyond the stage-0 files, read only what a report points to, at the lines it names.

Read this file before the first dispatch, for parallel agents, the brief lines, thoroughness stops, pending work and the findings a report names:

<!-- @shared-file dispatching.md -->
<!-- @end -->

- Dispatch stage 0's analysers side by side.

| Analyser | Dispatched at | Skipped when             | Count         | Serves         |
| -------- | ------------- | ------------------------ | ------------- | -------------- |
| Records  | Stage 0       | No note and no log entry | One           | Stages 1 and 3 |
| Debt     | Stage 0       | No marker and no clone   | One per batch | Stage 2        |
| Triage   | Stage 4       | The run touched no entry | One           | Stage 4        |

- Debt batches: the markers grouped by directory, at most about 100 per batch, one batch when all fit; each clone joins its first file's batch.
- Brief each with the paths of the files it reads and the commands it runs, never their content, its scope (those inputs and the code and history they cite), for the triage analyser a `Backlog:` line per entry the run touched and `Thoroughness: standard`, and the facts wanted back:
  - **Records.** Reads the scratchpad, the output of `list` and `stats` for the `friction` and `missing` logs and of `pnpm metalbrain discarded stats`, and the backlog. Back: per note, the project context it touches, the entries covering or overlapping it, and any conflict with them or missing context, as a question; per friction and missing subject, its variant names, the one name to merge them under, its entry IDs and count and the backlog entry tracking it; per discarded subject, its entry count.
  - **Debt.** Reads the marker and clone files, its batch and the backlog. Back: its markers and clones grouped by matter, across wording and files, each group with its sites, the other sites the fix would benefit, the entry covering it, and a fix only when obvious; each marker or clone that is not debt, with why; each group whose matter reaches past the batch.
  - **Triage.** Reads the entries its `Backlog:` lines name, the request and the backlog, against the default branch. Back: per entry, the related entries and what they explain together, and what the request and the project's current state add to it, each with its site; per question, its answer with evidence, or the findings and candidate answers when the code, configuration, history, documentation and dependencies cannot settle it; the entries that are one matter, and each entry holding several.
- Apply the stage-0 reports in stage order, checking each finding also against the entries this run already wrote: each analyser saw the backlog as it stood at its dispatch.
- A report missing what its brief asked: resume that analyser once with what is missing; past that, keep the gap as an open question.

## Stages

Run every stage, in this order; each feeds the next.

0. **Load.**
   - Run `pnpm metalbrain backlog categories`, `pnpm metalbrain friction stats` and `pnpm metalbrain missing stats`, and read `.ai/scratchpad.md`.
   - Write the output of `pnpm metalbrain debt --json`, one `{ file, line, column, statement }` per marker, and of `pnpm engrenage jscpd`, which lists code clones, to temporary files outside the repository; keep in context only the marker count per directory, to cut the debt batches.
   - Dispatch the records and debt analysers.
1. **Notes**, from the records report:
   1. Ignore the sentence following `<!-- scratchpad-placeholder -->`.
   2. Weigh each note against the project context and the entries covering or overlapping it that the report names.
   3. Keep a note that conflicts with existing entries or lacks the context to record it, with its question; proceed with the clear notes.
   4. Record the clear notes as entries, or apply the local edits they ask for within **Scope**.
   5. Remove only the notes recorded, already covered or applied. Never delete the file.
   6. When no note remains, keep the heading and placeholder marker, and add a quote that can inspire, provoke thought or start a conversation, as an exact citation followed by its author's name: as is when the original is in French or English, otherwise in its canonical English translation. Any author qualifies, real or fictional; for a fictional character, name the work or universe.
2. **Debt**, from the debt reports:
   1. Merge the groups sharing a matter across batches. Set aside what is not debt, and what an entry already covers, extending that entry with what the group adds.
   2. Write each group as an entry in the category owning the code, with its `sites`, and a fix as `want` only when one is obvious.
3. **Logs**, from the records report:
   1. Rename each variant entry of a friction or missing subject to the one name the report gives, with `pnpm metalbrain <log> update <id> --subject '<name>'`.
   2. Turn each subject `friction stats` or `missing stats` flags as recurring into a backlog entry, or extend the entry tracking it.
   3. Report the recurring discarded subjects; never file work from them.
4. **Triage**, over every entry the run touched, against the default branch:
   1. Dispatch the triage analyser.
   2. Keep as a question only what its report could not settle, with the findings and candidate answers.
   3. Apply only what it found, merging entries that prove to be one matter and splitting one that holds several.

<!-- @extension tools/github/issues/planning -->

5. **Overlaps**, from the triage report: the duplicates, overlaps, misplaced parents and issues the pushed default branch already satisfies, found from the index plus a grep of the issue file for the paths and names entries and issues cite, reading only those candidates' bodies.
6. **File** under the issues and issue-drafts rules:
   - Ready entry: needs no further decision, as a located bug with its expected behavior, a settled single task or a settled request to another repository. Leave work needing several ordered tasks in its entry and report it as needing planning.
   - Create an issue draft for each ready entry, writing for a maintainer of the target repository.
   - Turn stage-5 findings into draft edits: `state: completed` only when the issue's **Done when** holds on `origin/<default branch>`; `duplicate` with the duplicate linked; parent moves through `subIssues`.

<!-- @end -->

Every backlog change follows Backlog, and every log change the agent-records rule.

## Report

Your only message, at most five lines:

```
Notes: <n> → <entry IDs> · <n> kept (<question>)
Debt: +<n> entries, <n> merged · Friction: <subject> ×<n> → <ref>
Open: <questions, and what remains with the kind of work it needs, or "none">
```

<!-- @extension tools/github/issues/planning -->

Add `Issues: published <refs> · closed <refs> · overlap <ref>≈<ref>` before `Open`. Refines the issue-drafts rule's last Drafts bullet: a curation run publishes without reporting each claimed issue's diff first, and its `Issues` line replaces both that report and the diffs `publish` prints.

<!-- @end -->
