---
name: curation
description: Turn the scratchpad, `@debt` markers, code clones and agent logs
  into backlog entries and issues, and reconcile them with the open issues. Use
  when the user asks to triage the scratchpad, harvest debt markers or friction,
  or update, settle or file backlog entries.
---

<!-- @reference @auaust/engrenage/agents/skills/curation.md -->

# Curation

Turn the scratchpad, `@debt` markers, code clones and agent logs into backlog entries and issues, and reconcile them with the open issues. You record and file work; deciding, designing, planning and implementing it belong to other agents.

- Run in the main checkout, one run at a time.
- Cite backlog IDs only in the backlog and in your report: they are neither stable nor unique. Update references within the backlog whenever IDs change.
- Where an entry or a note needs more than recording (choosing between options, designing a change, breaking it into coordinated steps, implementing it), leave that part in the entry and report it.

## Scope

| Target           | Allowed                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backlog and logs | Entries and categories in `.ai/backlog/`; `.ai/scratchpad.md`; `.ai/friction.md`                                                                    |
| Code             | Never: `@debt` markers stay until their fix lands, as its list of sites                                                                             |
| Other local file | A configuration value or trivial edit a note explicitly asks for; anything larger becomes an entry                                                  |
| GitHub           | Issues only, as drafts, where the git rule allows GitHub writes; a note asking for a comment, pull request, label, push or message becomes an entry |

## Sequence

Run every stage, in this order; each feeds the next.

0. **Load.**
   - Write `gh issue list --state open --limit 500 --json number,title,labels,body` to a temporary file outside the repository. Keep in context only an index: number, title, labels, parent and header gist.
   - Read `.ai/backlog/index.md`, `.ai/friction.md`, `.ai/discarded.md`, `.ai/scratchpad.md` and `.ai/issues/`.
1. **Notes.**
   1. Ignore the sentence following `<!-- scratchpad-placeholder -->`.
   2. For each note, inspect the relevant project context and matching categories, and find the entries and issues covering or overlapping it.
   3. Keep a note that conflicts with existing entries or lacks the context to record it, with its question; proceed with the clear notes.
   4. Record the clear notes as entries, or apply the local edits they ask for within **Scope**.
   5. Remove only the notes recorded, already covered or applied. Never delete the file.
   6. When no note remains, keep the heading and placeholder marker, and add a quote that can inspire, provoke thought or start a conversation, as an exact citation followed by its author's name: as is when the original is in French or English, otherwise in its canonical English translation. Any author qualifies, real or fictional; for a fictional character, name the work or universe.
2. **Debt.**
   1. Run `pnpm engrenage debt --json`, which prints `{ file, line, column, statement }` per marker, and `pnpm engrenage jscpd`, which lists code clones.
   2. Read the code around each marker and clone, and what a statement mentions, until you understand the matter.
   3. Group markers and clones by matter, across wording and files. Set aside what is not debt, and what an entry or an open issue already covers, extending that entry with what the group adds.
   4. Search the project for the other sites that would benefit from the fix.
   5. Write each group as an entry in the category owning the code: its sites as `file:line`, and a fix as `want` only when one is obvious.
3. **Logs.**
   1. Rename the variants of each friction subject to one name, and count lines per subject.
   2. Turn a subject with three or more lines into an entry, or extend the issue tracking it.
   3. Count discarded subjects only and report the recurring ones; never file work from them.
4. **Triage**, over every entry the run touched, against the default branch and the open issues:
   1. Read the entries closely related to each one: combined, they may explain each other.
   2. Check what the request and the project's current state add to them: answers, new context, work already done.
   3. Investigate each question they hold in the code, configuration, history, documentation and dependencies, and work out its candidate answers. Keep as a question only what investigation cannot settle, with the findings and candidate answers.
   4. Apply only what you found, merging entries that prove to be one matter and splitting one that holds several.
5. **Overlaps.** From the index, plus a grep of the issue file for the paths and names entries and issues cite, find duplicates, overlaps, misplaced parents and issues the pushed default branch already satisfies. Read only those candidates' bodies.
6. **File**, under the `planning` skill's draft rules, never with `gh issue create`:
   - Ready entry: needs no further decision, as a located bug with its expected behavior or a settled request to another repository. Other work this repository must carry out is planned, not filed.
   - Search for an existing issue first (`gh issue list --repo <owner>/<repo> --state all --search "<keywords>"`) and extend it instead.
   - Create each ready entry with `pnpm engrenage planning issue create`, writing for a maintainer of the target repository, with how to reproduce it when known and the repository where it was found.
   - Turn stage-5 findings into draft edits: `state: completed` only when the issue's **Done when**, or its **Steps**, holds on `origin/<default branch>`; `duplicate` with the duplicate linked; parent moves through `subIssues`.
   - Run `check`, then `publish`.

Every edit to `.ai/backlog/` follows `.ai/backlog/index.md`, and every edit to the logs the agent-records rule.

## Report

Your only message, at most five lines:

```
Notes: <n> → <entry IDs> · <n> kept (<question>)
Debt: +<n> entries, <n> merged · Friction: <subject> ×<n> → <ref>
Issues: published <refs> · closed <refs> · overlap <ref>≈<ref>
Open: <questions, or "none">
```

<!-- @end -->
