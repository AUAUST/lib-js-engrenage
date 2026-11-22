---
title: Writing
description: Write every text densely, once, in the structure its content has.
category: workflow
default: true
order: 15
---

## Writing

- Apply these rules to everything you write but code: messages, reports, issues, comments, backlog entries, instructions.
- An issue or backlog entry asking for an agent instruction change states the concern, the behavior wanted and the cases to cover, never the rule, its wording or placement.
- State each fact once, where its owner keeps it. Elsewhere, link to it with its gist so the reader knows whether to follow the link.
- State each idea exactly, with its reason in one clause, in the fewest words that keep a single reading: no hedging, vague wording, repetition or sentence the reader would not miss, never cutting a word a condition, exception, sequence or scope rests on. Rephrase text you edit that falls short of these rules.

### Structure

| Content                                | Form                                         |
| -------------------------------------- | -------------------------------------------- |
| A single point                         | Sentence                                     |
| Independent points                     | List                                         |
| Ordered steps                          | Numbered list                                |
| Three or more facts sharing dimensions | Table                                        |
| Hierarchy, layout or layers            | ASCII tree or box diagram in a code block    |
| Flow or dependency graph               | Mermaid, or an ASCII diagram in a code block |

- Choose a table for the mapping it makes visible, never for density alone: rows that need sentences to read, or columns most rows leave empty, belong in a list.
- Draw any hierarchy or flow before describing it, and describe only what the figure does not show.
- Never use images or inline SVG: agents cannot read them back. Use other diagram languages only where the project already does.
- Report consequences and results, never what the diff already shows: what now behaves differently and what the reader must know or do.

### Transfer texts

Texts another agent or a later session acts on: briefs, forwarded prompts, handoffs, stop records, pauses, blocked reports.

- **Hold** what is wrong or wanted, the target state, facts costly to re-derive and open questions; references over excerpts, quoting only what no durable source keeps.
- **Never hold**, whatever a harness or tool asks: method or rules the receiver's skill or instructions own, recommendations no finding supports, how you found the facts unless your skill asks for it.
- A handoff is a chat reply in a Markdown code block; a file only when the user asks, or as a stop record.

### Reports

A subagent's final report, per dispatch or resume:

- Your only message, sent once every command you started has finished.
- Each item once, since your caller keeps every report: other parts refer to it.
- Each file named repo-relative, in each item about it: no closing list of files, even where your harness asks for absolute paths.

<!-- @extension tools/github/issues/planning -->

- Briefed with a `Walk:` line, or as a merger: each item in one line, never the commands you ran, the checks that passed or commit hashes, which the gate and git record.

<!-- @end -->

- What remains and the kind of work it needs, or that nothing remains: last, unless your brief or skill orders the parts.

### Stop records

Shape: goal; last operation; what is ready, and where; what is half-done, where, and what it misses; next step.

Write one when you stop with unfinished work no commit or issue holds, in these cases only: the user stops you; a limit forces you to stop; you stop midway as a subagent. Neither a main-session pause awaiting answers nor a thoroughness stop (Analysis › Thoroughness levels) is one of them.

1. Commit settled work under the git rules, and the rest of your work as a `snap` commit on a branch of your own, unless your skill or brief forbids committing. When it does, or the commit gate refuses the commit, leave that work uncommitted and name its files in the record.
2. Write the record into your final report as a subagent, otherwise into `.ai/handoffs/<topic>.md`, local-only, deleted by whoever resumes the work.
